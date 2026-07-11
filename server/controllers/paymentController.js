const db = require("../config/db");
const stripe = require("../config/stripe");

exports.createPayment = async (req, res) => {
  const { orderId } = req.body;

  try {
    const { data: order, error } = await db // ดึง order
      .from("orders")
      .select()
      .eq("order_id", orderId)
      .single();

    if(error || !order){
      return res.status(404).json({
        error:"Order not found"
      });
    }

    const amount = order.total_amount;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "thb",
      payment_method_types: ["promptpay"],
    });

    const { data, error: updateError } = await db // อัปเดต order
      .from("orders")
      .update({ stripe_pi_id: paymentIntent.id })
      .eq("order_id", orderId);

    if (updateError) {
      console.error("Error updating order:", updateError);
      return res.status(500).json({ error: "Failed to update order" });
    }

    res.json({
      client_secret: paymentIntent.client_secret,
      payment_id: paymentIntent.id
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ error: "Failed to create payment" });
  }
};
