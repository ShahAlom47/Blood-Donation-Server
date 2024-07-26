const express = require('express');
const router= express.Router()


const {addBloodRequest, getBloodRequest, getBloodRequestDetails } = require('../Controller/donation.controller');
//  example=== /donation/bloodRequest

router.post('/bloodRequest',addBloodRequest);
router.get('/getBloodRequest',getBloodRequest);
router.get('/getBloodRequest/details/:id',getBloodRequestDetails);

module.exports=router;