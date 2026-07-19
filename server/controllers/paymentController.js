const db = require("../config/db");
const stripe = require("../config/stripe");

exports.createPayment = async (req, res) => {
  const { cartId } = req.body;

  try {
    const { data: cartItems, error } = await db
      .from("cart_items")
      .select(`
        cart_items_id,
        items(price ,item_id ,user_id),
        carts!inner(cart_id,user_id)
      `)
      .eq("carts.cart_id", cartId)
      .eq("carts.user_id", req.user.user_id)

    if (error) {
      throw error;
    }

    if (!cartItems || cartItems.length === 0) {
      return res.status(404).json({ error: "Cart is empty" });
    }

    const subtotal = cartItems.reduce((sum, cartItem) => sum + cartItem.items.price, 0); // นำ price ของทุกชิ้นมาบวกกัน

    const platformFee = subtotal * 0.035;
    const netTarget = subtotal + platformFee;
    const effectiveFeeRate = 0.0165 * (1 + 0.07);
    const totalAmount = netTarget / (1 - effectiveFeeRate);
    const paymentFee = totalAmount - netTarget;

    // 2. สร้าง Order
    const { data: order, error: orderError } = await db
      .from("orders")
      .insert({
        user_id: req.user.user_id,
        total_amount: totalAmount,
        status: "pending",
      })
      .select()
      .single();

    if (orderError) {
      throw orderError;
    }

    const orderItems = cartItems.map(cartItem => ({
      order_id: order.order_id,
      item_id: cartItem.items.item_id,
      seller_id: cartItem.items.user_id,
      platform_fee: platformFee,
      seller_net: subtotal,
    }));

    const { data: orderItemsData, error: orderItemsError } = await db
      .from("order_items")
      .insert(orderItems);

    if (orderItemsError) {
      throw orderItemsError;
    }


    const amount = Math.round(order.total_amount * 100);

    if (amount < 10) {
      return res.status(400).json({
        error: "Minimum payment amount is 10 THB",
      });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "thb",
      payment_method_types: ["promptpay"],
    });
    const { data, error: updateError } = await db // อัปเดต order
      .from("orders")
      .update({ stripe_pi_id: paymentIntent.id })
      .eq("order_id", order.order_id);

    if (updateError) {
      console.error("Error updating order:", updateError);
      return res.status(500).json({ error: "Failed to update order" });
    }

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
      await db.from("carts")
        .delete()
        .eq("cart_id", cart.cart_id);

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
      .select(`
        cart_items_id,
        cart_id,
        carts!inner ( user_id ),
        items ( item_id, modelName, price, img )
      `)
      .eq("carts.user_id", userId);

    if (error) {
      throw error;
    }

    // จัดรูปทรงของ Data ใหม่ให้อยู่ในระดับเดียวกัน เพื่อให้ Frontend เรียกใช้ง่าย
    const formattedData = cartItems.map(item => ({
      cart_items_id: item.cart_items_id,
      cart_id: item.cart_id,
      item_id: item.items.item_id,
      modelName: item.items.modelName,
      price: item.items.price,
      img: item.items.img
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
      .select(`
        order_item_id,
        orders!inner(
          status,
          created_at,
          user_id
        ),
        items(
          item_id,
          modelName,
          price,
          obj,
          fbx,
          blend,
          usdz,
          gltf
        )
      `)
      .eq("orders.user_id", req.user.user_id)
      .eq("orders.status", "completed");

    if (error) throw error;

    // 1. ดึง item_id ทั้งหมดจาก data ที่ได้มา
    const itemIds = data.map(d => d.items.item_id);

    // 2. ค้นหาตาราง reviews ด้วย user_id ปัจจุบัน และ item_id ที่อยู่ในรายการดาวน์โหลด
    const { data: reviewsData, error: reviewsError } = await db
      .from("reviews")
      .select("item_id")
      .eq("user_id", req.user.user_id)
      .in("item_id", itemIds);

    if (reviewsError) throw reviewsError;

    // 3. นำ item_id ที่เคยรีวิวแล้วมาเก็บใน Set 
    const reviewedItemIds = new Set(reviewsData.map(r => r.item_id));

    // 4. Map ค่า is_reviewed เพิ่มเข้าไปในชุดข้อมูลเดิม
    const result = data.map(item => ({
      ...item,
      is_reviewed: reviewedItemIds.has(item.items.item_id)
    }));

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to load downloads"
    });
  }
};

exports.getDownloadFile = async (req, res) => {
  const { orderItemId, type } = req.params;

  try {
    const { data, error } = await db
      .from("order_items")
      .select(`
        order_item_id,

        orders!inner(
          user_id,
          status
        ),

        items(
          modelName,
          obj,
          fbx,
          blend,
          usdz,
          gltf
        )
      `)
      .eq("order_item_id", orderItemId)
      .single();

    if (error || !data) {
      return res.status(404).json({
        error: "Order item not found"
      });
    }

    // ตรวจสอบว่าเป็นเจ้าของรายการซื้อ
    if (data.orders.user_id !== req.user.user_id) {
      return res.status(403).json({
        error: "You do not have permission to download this file"
      });
    }

    // ตรวจสอบว่าจ่ายเงินแล้ว
    if (data.orders.status !== "completed") {
      return res.status(403).json({
        error: "Payment not completed"
      });
    }

    // อนุญาตเฉพาะชนิดไฟล์ที่กำหนด
    const allowTypes = ["obj", "fbx", "blend", "usdz", "gltf"];

    if (!allowTypes.includes(type)) {
      return res.status(400).json({
        error: "Invalid file type"
      });
    }

    const fileUrl = data.items[type];

    if (!fileUrl) {return res.status(404).json({error: "File not found"});}

    return res.json({ downloadUrl: fileUrl });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Server error"
    });
  }
};

exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;

    try {
      // 1. ค้นหา Order
      const { data: order, error: orderError } = await db
        .from("orders")
        .select("order_id")
        .eq("stripe_pi_id", paymentIntent.id)
        .single();

      if (orderError || !order) {
        throw new Error("Order not found for this PaymentIntent");
      }

      // 2. อัปเดตสถานะ Order เป็น 'completed'
      const { error: updateOrderError } = await db
        .from("orders")
        .update({ status: "completed" })
        .eq("order_id", order.order_id);

      if (updateOrderError) throw updateOrderError;

      console.log(`Payment successful and DB updated for Order ID: ${order.order_id}`);

    } catch (dbError) {
      console.error("Database update failed during webhook:", dbError);
      return res.status(500).json({ error: "Failed to update DB" });
    }
  }

  res.status(200).send();
};
