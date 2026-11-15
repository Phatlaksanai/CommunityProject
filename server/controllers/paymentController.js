const db = require("../config/db");
const stripe = require("../config/stripe");

exports.createPayment = async (req, res) => {
  const { cartId, sellerUsername, userId } = req.body;

  try {
    const { data: cartItems, error } = await db
      .from("cart_items")
      .select(
        `
        cart_items_id,
        items!inner(price ,item_id ,user_id, users!inner ( username ) ),
        carts!inner(cart_id, user_id)
      `,
      )
      .eq("carts.cart_id", cartId)
      .eq("carts.user_id", userId)
      .eq("items.users.username", sellerUsername); // กรองเอาเฉพาะสินค้าของร้านค้านี้ร้านเดียว

    if (error) {
      throw error;
    }

    if (!cartItems || cartItems.length === 0) {
      return res.status(404).json({ error: "Cart is empty" });
    }

    // [ตรวจสอบซ้ำเพื่อความชัวร์] ตรวจสอบว่าสินค้าทุกชิ้นมาจากร้านเดียวกันทั้งหมด
    // เพราะ Destination Charge รองรับการโอนเข้า 1 ปลายทางต่อ 1 PaymentIntent
    const firstSellerId = cartItems[0].items.user_id;
    const isSameSeller = cartItems.every(cartitem => cartitem.items.user_id === firstSellerId);

    if (!isSameSeller) {
      return res.status(400).json({
        error: "Destination Charge requires all items in the cart to be from the same store. Please checkout store by store."
      });
    }
    // 2. คำนวณราคาสินค้าและค่าธรรมเนียมต่างๆ
    // 2.1 หาราคาสินค้ารวม (Subtotal)
    const subtotal = cartItems.reduce((sum, cartItem) => sum + cartItem.items.price, 0);
    const platformFee = subtotal * 0.035; // 2.2 คำนวณค่าคอมมิชชันที่แพลตฟอร์มจะหัก
    const netTarget = subtotal + platformFee;// 2.3 ยอดสุทธิที่แพลตฟอร์มต้องการ (ราคาสินค้า + คอมมิชชัน)

    // 2.4 คำนวณค่าธรรมเนียมของ Payment Gateway (เช่น Stripe คิด 1.65% + VAT 7%)
    // เพื่อบวกกลับเข้าไปในราคาสุทธิ ให้ลูกค้าเป็นคนจ่ายค่าธรรมเนียมการโอนนี้
    const effectiveFeeRate = 0.0165 * (1 + 0.07);

    const totalAmount = netTarget / (1 - effectiveFeeRate);// ยอดรวมทั้งหมดที่ลูกค้าต้องจ่ายจริง

    // 3. สร้างบิลคำสั่งซื้อ (Order) ในฐานข้อมูล
    const { data: order, error: orderError } = await db
      .from("orders")
      .insert({
        user_id: userId,
        total_amount: totalAmount,
        status: "pending",
      })
      .select()
      .single();

    if (orderError) {
      throw orderError;
    }

    // เตรียมข้อมูลสินค้าแต่ละชิ้นเพื่อบันทึกลงตาราง order_items (รายละเอียดบิล)
    const orderItems = cartItems.map((cartItem) => {
      const itemPrice = cartItem.items.price;
      const itemPlatformFee = itemPrice * 0.035;

      return {
        order_id: order.order_id,
        item_id: cartItem.items.item_id,
        seller_id: cartItem.items.user_id,
        platform_fee: itemPlatformFee, // ค่าธรรมเนียมเฉพาะของสินค้านี้
        seller_net: itemPrice, // รายได้เฉพาะชิ้นนี้
      };
    });

    const { error: orderItemsError } = await db
      .from("order_items")
      .insert(orderItems);

    if (orderItemsError) {
      throw orderItemsError;
    }

    // 4. เชื่อมต่อระบบจ่ายเงิน Stripe
    // Stripe รับยอดเงินเป็นหน่วย "สตางค์" เสมอ (เช่น 100 บาท ต้องส่งเป็น 10000)
    const amount = Math.round(order.total_amount * 100);

    if (amount < 10) { // ขั้นตํ่า 10 บาท
      return res.status(400).json({
        error: "Minimum payment amount is 10 THB",
      });
    }

    // 4.1 ดึงรหัสกระเป๋าเงิน Stripe (stripe_connect_id) ของร้านค้าเพื่อเตรียมโอนเงินให้
    const { data: sellerData, error: sellerError } = await db
      .from("users")
      .select("stripe_connect_id")
      .eq("user_id", firstSellerId)
      .single();

    if (sellerError || !sellerData?.stripe_connect_id) {
      return res.status(400).json({ error: "Seller Stripe Connect ID not found" });
    }

    // 4.2 คำนวณส่วนแบ่ง: ยอดที่จะหักเข้ากระเป๋าแพลตฟอร์ม (ค่าคอมมิชชัน + ค่าธรรมเนียม Payment)
    const netAmountCents = Math.round(subtotal * 100); // ยอดที่ร้านจะได้ (ราคาสินค้าเพียวๆ)
    const applicationFeeAmount = amount - netAmountCents; // ยอดรวมทั้งหมด - ยอดของร้าน = ยอดของแพลตฟอร์ม

    // 4.3 สั่งให้ Stripe สร้างคำขอรับเงิน (PaymentIntent)
    const paymentIntent = await stripe.paymentIntents.create({
      amount,// ยอดเก็บเงินลูกค้าทั้งหมด (สตางค์)
      currency: "thb",
      payment_method_types: ["promptpay"],// รับชำระผ่าน PromptPay (สแกน QR)
      application_fee_amount: applicationFeeAmount, // ** Stripe จะหักเงินก้อนนี้เก็บไว้ที่แพลตฟอร์ม **
      transfer_data: {
        destination: sellerData.stripe_connect_id, // ** ส่วนที่เหลือ จะโอนเข้าบัญชีร้านค้านี้ให้อัตโนมัติ **
      },
    });

    // 5. อัปเดตบิล & ส่งข้อมูลให้หน้าบ้าน
    // เอา ID การจ่ายเงินของ Stripe (pi_xxxx) มาแปะไว้ที่บิลในฐานข้อมูล 
    // เพื่อเอาไว้เช็คสถานะภายหลังใน Webhook
    const { error: updateError } = await db
      .from("orders")
      .update({ stripe_pi_id: paymentIntent.id })
      .eq("order_id", order.order_id);

    if (updateError) {
      console.error("Error updating order:", updateError);
      return res.status(500).json({ error: "Failed to update order" });
    }

    // ส่งคืนข้อมูลให้ Frontend: 
    // 1. Order ID ของเรา 
    // 2. clientSecret ของ Stripe (เอาไว้ไป render QR Code ให้ลูกค้าสแกนจ่ายหน้าเว็บ)
    res.json({
      orderId: order.order_id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ error: "Failed to create payment" });
  }
};

exports.addItemToCart = async (req, res) => {
  const { item_id } = req.body;
  const user_id = req.user.user_id;

  try {
    // ตรวจสอบสินค้า
    const { data: item, error: itemError } = await db
      .from("items")
      .select("*")
      .eq("item_id", item_id)
      .single();

    if (itemError || !item) {
      return res.status(404).json({
        error: "Item not found",
      });
    }

    // เวลาหมดอายุ +1 วัน
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 1);

    // ค้นหา Cart ของผู้ใช้
    let { data: cart } = await db
      .from("carts")
      .select("*")
      .eq("user_id", user_id)
      .single();

    // ถ้ามี Cart และหมดอายุแล้ว
    if (cart && new Date(cart.cart_expire) < new Date()) {
      await db.from("carts").delete().eq("cart_id", cart.cart_id);

      return res.status(400).json({ error: "Cart expired" });
    }

    // ถ้ายังไม่มี Cart
    if (!cart) {
      const { data: newCart, error: createCartError } = await db
        .from("carts")
        .insert({
          user_id,
          cart_expire: expireDate,
          updated_at: new Date(),
        })
        .select()
        .single();

      if (createCartError) {
        throw createCartError;
      }

      cart = newCart;
    } else {
      // มี Cart แล้ว อัปเดตเวลา
      const { error: updateCartError } = await db
        .from("carts")
        .update({
          updated_at: new Date(),
          cart_expire: expireDate,
        })
        .eq("cart_id", cart.cart_id);

      if (updateCartError) {
        throw updateCartError;
      }
    }

    // ตรวจสอบว่ามีสินค้านี้ใน Cart แล้วหรือยัง
    const { data: existItem } = await db
      .from("cart_items")
      .select("*")
      .eq("cart_id", cart.cart_id)
      .eq("item_id", item_id)
      .single();

    if (existItem) {
      return res.status(400).json({
        error: "Item already exists in cart",
      });
    }

    // เพิ่มสินค้า
    const { data: cartItem, error: cartItemError } = await db
      .from("cart_items")
      .insert({
        cart_id: cart.cart_id,
        item_id,
      })
      .select()
      .single();

    if (cartItemError) {
      throw cartItemError;
    }

    res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      cartItem,
    });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add item to cart",
    });
  }
};

exports.getCardItems = async (req, res) => {
  const { userId } = req.params;

  try {
    // Join ตาราง cart_items เข้ากับ carts (เช็ค userId) และ items (ดึงรายละเอียด)
    const { data: cartItems, error } = await db
      .from("cart_items")
      .select(
        `
        cart_items_id,
        cart_id,
        carts!inner ( user_id ),
        items!inner ( 
          item_id, 
          modelName, 
          price, 
          img, 
          users!inner ( username, name, profilePic, isdelete ) 
        )`
      )
      .eq("carts.user_id", userId)
      .eq("items.users.isdelete", "active");

    if (error) {
      throw error;
    }

    // จัดรูปทรงของ Data ใหม่ให้อยู่ในระดับเดียวกัน เพื่อให้ Frontend เรียกใช้ง่าย
    const formattedData = cartItems.map((cartItem) => ({
      cart_items_id: cartItem.cart_items_id,
      cart_id: cartItem.cart_id,
      item_id: cartItem.items.item_id,
      modelName: cartItem.items.modelName,
      price: cartItem.items.price,
      img: cartItem.items.img,
      username: cartItem.items.users?.username,
      name: cartItem.items.users?.name,
      profilePic: cartItem.items.users?.profilePic,
    }));

    // ส่ง Array กลับไปโดยตรง เพื่อให้ data.map() ฝั่ง Frontend ทำงานได้
    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ error: "Failed to fetch cards" });
  }
};

exports.removeItemFromCart = async (req, res) => {
  const { itemId } = req.params;

  try {
    // หา cart_id ก่อนลบ
    const { data: cartItem, error: findError } = await db
      .from("cart_items")
      .select("cart_id")
      .eq("cart_items_id", itemId)
      .single();

    if (findError || !cartItem) {
      return res.status(404).json({
        success: false,
        error: "Item not found",
      });
    }

    // ลบสินค้า
    const { error: deleteError } = await db
      .from("cart_items")
      .delete()
      .eq("cart_items_id", itemId);

    if (deleteError) {
      throw deleteError;
    }

    // ตรวจสอบว่ายังมีสินค้าใน cart หรือไม่
    const { data: remainItems, error: remainError } = await db
      .from("cart_items")
      .select("cart_items_id")
      .eq("cart_id", cartItem.cart_id);

    if (remainError) {
      throw remainError;
    }

    if (remainItems.length === 0) {
      // ไม่มีสินค้าเหลือ ลบ cart
      const { error: deleteCartError } = await db
        .from("carts")
        .delete()
        .eq("cart_id", cartItem.cart_id);

      if (deleteCartError) {
        throw deleteCartError;
      }
    } else {
      // ยังมีสินค้า ต่ออายุ cart อีก 1 วัน
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + 1);

      const { error: updateError } = await db
        .from("carts")
        .update({
          updated_at: new Date(),
          cart_expire: expireDate,
        })
        .eq("cart_id", cartItem.cart_id);

      if (updateError) {
        throw updateError;
      }
    }

    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
    });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({
      success: false,
      error: "Failed to remove item from cart",
    });
  }
};

exports.getDownloads = async (req, res) => {
  try {
    const { data, error } = await db
      .from("order_items")
      .select(
        `
        order_item_id,
        orders!inner(
          status,
          created_at,
          user_id
        ),
        items!inner(
          item_id,
          modelName,
          price,
          update_models(update_models_id,version,obj,fbx,blend,usdz,gltf)
        )
      `,
      )
      .eq("orders.user_id", req.user.user_id)
      .eq("orders.status", "completed")
      .order('created_at', { referencedTable: 'items.update_models', ascending: false })

    if (error) throw error;

    // 1. ดึง item_id ทั้งหมดจาก data ที่ได้มา
    const itemIds = data.map((d) => d.items.item_id);

    // 2. ค้นหาตาราง reviews ด้วย user_id ปัจจุบัน และ item_id ที่อยู่ในรายการดาวน์โหลด
    const { data: reviewsData, error: reviewsError } = await db
      .from("reviews")
      .select("item_id")
      .eq("user_id", req.user.user_id)
      .in("item_id", itemIds);

    if (reviewsError) throw reviewsError;

    // 3. นำ item_id ที่เคยรีวิวแล้วมาเก็บใน Set
    const reviewedItemIds = new Set(reviewsData.map((r) => r.item_id));

    // 4. Map ค่า is_reviewed เพิ่มเข้าไปในชุดข้อมูลเดิม
    const result = data.map((downloadItem) => ({
      ...downloadItem,
      is_reviewed: reviewedItemIds.has(downloadItem.items.item_id),
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to load downloads",
    });
  }
};

exports.getDownloadFile = async (req, res) => {
  // *เปลี่ยนชื่อตัวแปรให้ตรงกับความจริง (หน้าบ้านส่ง update_models_id มาให้)
  // หากใน Route (router.js) ของคุณตั้งชื่อไว้ว่า /download/:orderItemId/:type ก็ให้รับเป็น orderItemId ไปก่อนแล้วจับใส่ตัวแปรใหม่
  const updateModelId = req.params.orderItemId || req.params.id;
  const { type } = req.params;

  try {
    // 1. อนุญาตเฉพาะชนิดไฟล์ที่กำหนด (เช็กเพื่อความปลอดภัยก่อนเลย)
    const allowTypes = ["obj", "fbx", "blend", "usdz", "gltf"];
    if (!allowTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid file type" });
    }

    // 2. ค้นหาเวอร์ชันที่ต้องการดาวน์โหลดจาก update_models โดยตรง
    const { data: modelData, error: modelError } = await db
      .from("update_models")
      .select(`
        item_id, 
        ${type} 
      `)
      .eq("update_models_id", updateModelId)
      .single();

    if (modelError || !modelData) {
      return res.status(404).json({ error: "File version not found" });
    }

    const fileUrl = modelData[type];
    if (!fileUrl) {
      return res.status(404).json({ error: "File not found for this version" });
    }

    // 3. ตรวจสอบสิทธิ์ว่า User คนนี้ เคยซื้อ item_id นี้และจ่ายเงินเสร็จสิ้นแล้วหรือไม่
    const { data: orderData, error: orderError } = await db
      .from("order_items")
      .select(`
        order_item_id,
        orders!inner(
          user_id,
          status
        )
      `)
      .eq("item_id", modelData.item_id) // เช็กว่าเคยซื้อ item_id นี้ไหม
      .eq("orders.user_id", req.user.user_id) // เช็กว่าเป็น user ที่ล็อกอินอยู่หรือไม่
      .eq("orders.status", "completed") // เช็กว่าจ่ายเงินแล้ว
      .limit(1);

    if (orderError || !orderData || orderData.length === 0) {
      return res.status(403).json({
        error: "You do not have permission to download this file or payment not completed",
      });
    }

    // 4. ผ่านทุกด่าน -> ส่งลิงก์ให้ดาวน์โหลด
    return res.json({ downloadUrl: fileUrl });

  } catch (err) {
    console.error("Download Error:", err);
    res.status(500).json({
      error: "Server error",
    });
  }
};

exports.stripeWebhook = async (req, res) => { //ถูกเรียก "โดยอัตโนมัติจากฝั่ง Stripe"
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; // Secret ปกติก่อน
  const connectEndpointSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET; // (ถอนเงิน)

  let event;

  try {
    // พยายามแกะกล่องข้อมูลด้วย Secret ปกติก่อน
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    try {
      // ถ้าพลาด ลองแกะด้วย Secret ของ Stripe Connect (ถอนเงิน)
      if (!connectEndpointSecret) throw new Error("STRIPE_CONNECT_WEBHOOK_SECRET is not defined");
      event = stripe.webhooks.constructEvent(req.body, sig, connectEndpointSecret);
    } catch (connectErr) {
      // ถ้าแกะไม่ได้ทั้งคู่ แสดงว่ามาจากคนอื่นที่พยายามแฮ็ก เตะออก
      console.error("Webhook signature verification failed for both secrets.");
      return res.status(400).send(`Webhook Error: Verification failed`);
    }
  }

  // เหตุการณ์ที่ 1: "ลูกค้าจ่ายเงินซื้อของสำเร็จ"
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;

    try {
      // 1.1 หาออร์เดอร์ที่เพิ่งจ่ายเงินเข้ามา
      const { data: order, error: orderError } = await db
        .from("orders")
        .select("order_id, user_id")
        .eq("stripe_pi_id", paymentIntent.id)
        .single();

      if (orderError || !order) {
        throw new Error("Order not found for this PaymentIntent");
      }

      // 1.2 อัปเดตสถานะ Order เป็น 'completed'
      const { error: updateOrderError } = await db
        .from("orders")
        .update({ status: "completed" })
        .eq("order_id", order.order_id);

      if (updateOrderError) throw updateOrderError;

      // 1.3 เช็คสถานะ completed แล้วเพิ่มข้อมูลลง transactions
      // ดึงรายการสินค้าในออร์เดอร์นี้
      const { data: items, error: itemsErr } = await db
        .from("order_items")
        .select("order_item_id, seller_net, seller_id, users(balance)")
        .eq("order_id", order.order_id);

      if (!itemsErr && items && items.length > 0) {
        // บันทึกประวัติรายได้ (transaction) ลงตาราง
        const transactions = items.map((item) => ({
          user_id: order.user_id,
          order_item_id: item.order_item_id,
          amount: item.seller_net, // เงินส่วนแบ่งที่ร้านได้
          created_at: new Date(),
          transaction_type: "sale",
        }));

        const { error: insertErr } = await db
          .from("transactions")
          .insert(transactions);

        if (insertErr) {
          console.error("Failed to insert transactions:", insertErr);
          throw insertErr;
        }

        // อัปเดตกระเป๋าเงิน (balance) ของร้านค้าให้เพิ่มขึ้น
        const sellerId = items[0].seller_id; // id คนขาย
        const currentBalance = items[0].users?.balance || 0; // เงินคนขายปัจจุบัน
        const totalEarned = items.reduce((acc, item) => acc + Number(item.seller_net), 0);
        const newBalance = currentBalance + totalEarned;

        const { error: updateError } = await db
          .from("users")
          .update({ balance: newBalance })
          .eq("user_id", sellerId);

        if (updateError) {
          console.error("Failed to update user balances:", updateError);
          throw updateError;
        }
      }

      // 3.1 ดึง item_id เฉพาะชิ้นที่เพิ่งจ่ายเงินสำเร็จจากตาราง order_items
      const { data: orderItems, error: itemsError } = await db
        .from("order_items")
        .select("item_id")
        .eq("order_id", order.order_id);

      if (!itemsError && orderItems && orderItems.length > 0) {
        const purchasedItemIds = orderItems.map(item => item.item_id);

        // 3.2 หา cart_id ประจำตัวของ user คนนี้
        const { data: cart } = await db
          .from("carts")
          .select("cart_id")
          .eq("user_id", order.user_id)
          .single();

        if (cart) {
          // 3.3 ลบ "เฉพาะสินค้าที่ซื้อสำเร็จ" ออกจากตะกร้า
          await db
            .from("cart_items")
            .delete()
            .eq("cart_id", cart.cart_id)
            .in("item_id", purchasedItemIds);

          // 3.4 เช็คว่าถ้าลบแล้วตะกร้าว่างเปล่า ไม่มีของร้านอื่นเหลืออยู่ ให้ลบตัวตะกร้าทิ้งไปด้วย
          const { data: remainItems } = await db
            .from("cart_items")
            .select("cart_items_id")
            .eq("cart_id", cart.cart_id);

          if (!remainItems || remainItems.length === 0) {
            await db.from("carts").delete().eq("cart_id", cart.cart_id);
          }
        }
      }

    } catch (dbError) {
      console.error("Database update failed during webhook:", dbError);
      return res.status(500).json({ error: "Failed to update DB" });
    }
  }

  // เหตุการณ์ที่ 2: "ลูกค้าจ่ายเงินล้มเหลว หรือ ยกเลิก"
  else if (event.type === 'payment_intent.payment_failed' || event.type === 'payment_intent.canceled') {
    const paymentIntent = event.data.object;

    try {
      const { error: updateOrderError } = await db
        .from("orders")
        .update({ status: "failed" }) // เปลี่ยนสถานะเป็น failed
        .eq("stripe_pi_id", paymentIntent.id);

      if (updateOrderError) throw updateOrderError;

      console.log(`Payment failed/canceled for PaymentIntent: ${paymentIntent.id}`);
    } catch (dbError) {
      console.error("Database update failed during webhook (failed payment):", dbError);
    }
  }

  // เหตุการณ์ที่ 3: "ร้านค้าถอนเงินสำเร็จ (โอนเข้าบัญชีธนาคาร)"
  else if (event.type === "payout.paid") {
    const payout = event.data.object;

    const withdrawAmount = payout.amount / 100; // แปลงหน่วยสตางค์ (Cents) กลับเป็นหน่วยบาท
    const stripeConnectId = event.account; // ID ร้านค้าที่ถอนเงิน

    if (stripeConnectId) {
      try {

        // 3.1 หาร้านค้าจาก ID
        const { data: user, error: userError } = await db
          .from("users")
          .select("user_id, balance")
          .eq("stripe_connect_id", stripeConnectId)
          .single();

        if (userError || !user) {
          throw new Error("User not found for this Payout");
        }

        // 3.2 หักเงินออกจากกระเป๋า (balance) ในระบบ
        const newBalance = user.balance - withdrawAmount;

        const { error: updateError } = await db
          .from("users")
          .update({ balance: newBalance })
          .eq("user_id", user.user_id);

        if (updateError) throw updateError;

        // 3.3 บันทึกประวัติการถอนลงตาราง
        const { error: insertTxError } = await db
          .from("transactions")
          .insert({
            user_id: user.user_id,
            amount: withdrawAmount,
            transaction_type: "withdrawal" // กำหนดประเภทเป็น withdrawal
          });

        if (insertTxError) {
          console.error("Failed to insert withdrawal transaction:", insertTxError);
          throw insertTxError;
        }

        console.log(`Payout processed and transaction recorded for User ID: ${user.user_id}`);
      } catch (dbError) {
        console.error("Database update failed during payout webhook:", dbError);
      }
    }
  }

  res.status(200).send();// ต้องตอบ 200 (OK) กลับไปเสมอ ไม่งั้น Stripe จะพยายามยิงซ้ำเรื่อยๆ
};

exports.CheckStripeId = async (req, res) => {
  const { userId } = req.params;
  const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

  try {
    const { data, error } = await db
      .from("users")
      .select("stripe_connect_id")
      .eq("user_id", userId)
      .single();

    if (error || !data)
      return res.status(404).json({ error: "User not found" });

    // ถ้ายังไม่มี ID ในฐานข้อมูลเลย
    if (!data.stripe_connect_id) {
      return res.status(200).json({ isSetupComplete: false, url: null });
    }

    // ถ้ามี ID แล้ว ให้ไปเช็คสถานะกับ Stripe ว่ากรอกข้อมูลเสร็จหรือยัง
    const account = await stripe.accounts.retrieve(data.stripe_connect_id);

    // เช็คว่า details_submitted เป็น true หรือยัง (แปลว่ากรอกฟอร์มครบไหม)
    if (account.details_submitted) {
      return res.status(200).json({ isSetupComplete: true });
    } else {
      // ถ้ามี ID แต่กรอกฟอร์มไม่ครบ ให้สร้างลิงก์ให้ไปทำต่อจากจุดเดิม
      const accountLink = await stripe.accountLinks.create({
        account: data.stripe_connect_id,
        refresh_url: `${CLIENT_URL}/market`,
        return_url: `${CLIENT_URL}/market`,
        type: "account_onboarding",
      });
      return res.status(200).json({ isSetupComplete: false, url: accountLink.url });
    }
  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.CreateStripeAccount = async (req, res) => {
  const { userId, email } = req.body;
  const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

  try {
    const account = await stripe.accounts.create({
      type: "standard",
      email: email,
    });

    const { error } = await db
      .from("users")
      .update({ stripe_connect_id: account.id })
      .eq("user_id", userId);

    if (error) {
      console.error("Supabase Update Error:", error);
      return res.status(500).json({ error: "Failed to update database" });
    }

    // ใช้ AccountLinks (V1) สร้าง URL เพื่อให้ Frontend พาเด้งไปได้
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${CLIENT_URL}/market`,
      return_url: `${CLIENT_URL}/market`,
      type: "account_onboarding",
    });

    return res.status(200).json({ url: accountLink.url });
  } catch (err) {
    console.error("Stripe/Server Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// สำหรับของฟรี
exports.addItemToDownload = async (req, res) => {
  const { item_id } = req.body;
  const user_id = req.user.user_id;

  try {
    // 1. ตรวจสอบว่ามีสินค้านี้อยู่จริงหรือไม่
    const { data: item, error: itemError } = await db
      .from("items")
      .select("*")
      .eq("item_id", item_id)
      .single();

    if (itemError || !item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // 2. (แนะนำเพิ่ม) ตรวจสอบว่า User เคยมีสินค้านี้แล้วหรือยัง ป้องกันการกดรับซ้ำ
    const { data: existingOrder } = await db
      .from("order_items")
      .select(`
        order_id,
        orders!inner(user_id)
      `)
      .eq("item_id", item_id)
      .eq("orders.user_id", user_id)
      .limit(1);

    if (existingOrder && existingOrder.length > 0) {
      return res.status(400).json({ error: "You already own this item" });
    }

    // 3. สร้างออเดอร์ใหม่ (ฟรี)
    const { data: order, error: orderError } = await db
      .from("orders")
      .insert({
        user_id: user_id,
        total_amount: 0,
        status: "completed",
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 4. นำสินค้าเข้า order_items
    const { error: orderItemsError } = await db
      .from("order_items")
      .insert({
        order_id: order.order_id,
        item_id: item_id,
        seller_id: item.user_id,
        platform_fee: 0,
        seller_net: 0,
      });

    if (orderItemsError) throw orderItemsError;

    // 5. ส่ง Response (ลบ cartItem ที่ไม่มีตัวตนออก)
    res.status(200).json({
      success: true,
      message: "Item added to download successfully"
    });

  } catch (error) {
    console.error("Error adding item to download:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add item to download",
    });
  }
};