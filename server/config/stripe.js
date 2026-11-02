const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_TEST_SECRET_KEY);

module.exports = stripe;