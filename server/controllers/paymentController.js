const db = require("../config/db");
const stripe = require("../config/stripe");

exports.createPayment = async (req, res) => {
  const { cartId } = req.body;

  try {
    const { data: cartItems, error } = await db 
      .from("cart_items")
      .select(`
        cart_items_id,
        items(price),
        carts!inner(cart_id,user_id)
      `)
      .eq("carts.cart_id", cartId)
      .eq("carts.user_id", req.user.user_id)

    if (error) {
      throw error;
    }

    if (!cartItems || cartItems.length === 0) {
      return res.status(404).json({error: "Cart is empty"});
    }

    const subtotal = cartItems.reduce((sum, cartItem) => sum + cartItem.items.price ,0); // นำ price ของทุกชิ้นมาบวกกัน
    
    const platformFee = subtotal * 0.035;
    const paymentFee = subtotal * 0.0165 + (subtotal * (0.0165 * 0.07));
    const totalAmount = subtotal + platformFee + paymentFee;

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

    return res.status(400).json({error: "Cart expired"});
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
