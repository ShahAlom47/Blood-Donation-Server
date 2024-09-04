const express = require('express');
const router= express.Router()


const { addMoneyDonation, getYearlyTotalDonation,
    addMonthlyDonation, getSingleUserMonthlyDonation,
     updateMonthlyDonationAmount, getUserDonationSummary,
      getUserDonationHistory, totalDonationSummary, 
      getAllMoneyDonationHistory} = require('../Controller/moneyDonation.controller');

const  verifyAdmin =require('../Middleware/verifyAdmin')
const  verifyToken =require('../Middleware/verifyToken')

router.post('/addDonation',addMoneyDonation);
router.post('/addMonthlyDonation',addMonthlyDonation);
router.patch('/updateDonationAmount/:email',verifyToken,updateMonthlyDonationAmount);
router.get('/yearlyTotalDonation',getYearlyTotalDonation);
router.get('/getUserMonthlyDonationData/:email',verifyToken,getSingleUserMonthlyDonation);
router.get('/userDonationSummary/:email',verifyToken,getUserDonationSummary);
router.get('/totalDonationSummary',verifyToken,verifyAdmin,totalDonationSummary);
router.get('/userDonationHistory/:email',getUserDonationHistory);
router.get('/allMoneyDonationHistory',verifyToken,verifyAdmin,getAllMoneyDonationHistory);


module.exports=router;