const db = require("../config/db");
const stripe = require("../config/stripe");

exports.createPayment = async (req, res) => {
  const { item_id } = req.body;

  try {
    const { data: item, error } = await db // ดึง item
      .from("items")
      .select('*')
      .eq("item_id", item_id)
      .single();

    if(error || !item){
      return res.status(404).json({
        error:"Item not found"
      });
   }

   // 2. สร้าง Order
   const {data:order ,error:orderError}=await db
   .from("orders")
   .insert({
      user_id:req.user.user_id,
      total_amount:item.price,
      status:"pending"
   })
   .select()
   .single();


   if(orderError){
      throw orderError;
   }

    const amount = order.total_amount;
    if(amount < 10){
    return res.status(400).json({
        error:"Minimum payment amount is 10 THB"
    });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
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
      orderId:order.order_id,
      clientSecret:paymentIntent.client_secret
   });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ error: "Failed to create payment" });
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
