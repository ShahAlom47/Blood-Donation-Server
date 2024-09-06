const express = require('express');
const router= express.Router()


const {addBloodRequest, getBloodRequest,
     updateDonationRequest, getUserAllRequest,
     updateRequestConfirm,
     getAdminAllRequest,
     deleteBloodRequest,
     getUserBloodDonationHistory, 
    
    } = require('../Controller/donation.controller');

const verifyToken = require('../Middleware/verifyToken');
const verifyAdmin = require('../Middleware/verifyAdmin');


//  example=== /donation/bloodRequest

router.post('/bloodRequest',addBloodRequest);
router.get('/getBloodRequest',getBloodRequest);
router.put('/updateDonationRequest', verifyToken,updateDonationRequest);
router.get('/user/allRequest/:email', verifyToken,getUserAllRequest);
router.patch('/user/confirmDonation/:id', verifyToken,updateRequestConfirm);
router.get('/admin/allRequest', verifyToken,verifyAdmin ,getAdminAllRequest );
router.delete('/delete/bloodRequest/:id', verifyToken,deleteBloodRequest );
router.get('/bloodDonationHistory/:email', verifyToken,getUserBloodDonationHistory );



module.exports=router;