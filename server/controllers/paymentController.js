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
