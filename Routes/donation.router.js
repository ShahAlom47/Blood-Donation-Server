const express = require('express');
const router= express.Router()


const {addBloodRequest, getBloodRequest, updateDonationRequest, } = require('../Controller/donation.controller');
const verifyToken = require('../Middleware/verifyToken');

//  example=== /donation/bloodRequest

router.post('/bloodRequest',addBloodRequest);
router.get('/getBloodRequest',getBloodRequest);
router.put('/updateDonationRequest', verifyToken,updateDonationRequest);

module.exports=router;