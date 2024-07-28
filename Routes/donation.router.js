const express = require('express');
const router= express.Router()


const {addBloodRequest, getBloodRequest, updateDonationRequest, } = require('../Controller/donation.controller');
//  example=== /donation/bloodRequest

router.post('/bloodRequest',addBloodRequest);
router.get('/getBloodRequest',getBloodRequest);
router.put('/updateDonationRequest',updateDonationRequest);

module.exports=router;