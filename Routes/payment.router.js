const express = require('express');
const router= express.Router()


const { getStripeSecretKey } = require('../Controller/payment.controller');



router.post('/create-payment-intent',getStripeSecretKey);



module.exports=router;