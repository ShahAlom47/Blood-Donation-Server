const express = require('express');
const router= express.Router()


const {addBloodRequest, getBloodRequest,
     updateDonationRequest, getUserAllRequest,
     updateRequestConfirm, 
    
    } = require('../Controller/donation.controller');

const verifyToken = require('../Middleware/verifyToken');
//  example=== /donation/bloodRequest

router.post('/bloodRequest',addBloodRequest);
router.get('/getBloodRequest',getBloodRequest);
router.put('/updateDonationRequest', verifyToken,updateDonationRequest);
router.get('/user/allRequest/:email', verifyToken,getUserAllRequest);
router.patch('/user/confirmDonation/:id', verifyToken,updateRequestConfirm);

module.exports=router;