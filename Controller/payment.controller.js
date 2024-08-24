const stripe = require('stripe')(process.env.STRIPE_KEY);


const getStripeSecretKey=async (req, res) => {
    try {
        const { price } = req.body;
        const amount = parseInt(100 * price);
        const MAX_AMOUNT = 99999999; // in the smallest currency unit, for AED this is 999,999.99 AED
    console.log(price);
        if (amount > MAX_AMOUNT) {
          return res.status(400).send({ error: 'Amount must be no more than 999,999 AED' });
        }
    
        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency: "bdt",
          payment_method_types: ["card"],
        });
    
        res.send({
          clientSecret: paymentIntent.client_secret,
        });
      } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).send({ error: 'Failed to create payment intent' });
      }


}


module.exports = {
getStripeSecretKey,

}