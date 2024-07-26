const express = require('express');
const router= express.Router()


const { bloodRequest } = require('../Controller/donation.controller');
//  example=== /donation/bloodRequest

router.post('/bloodRequest',bloodRequest);

module.exports=router;