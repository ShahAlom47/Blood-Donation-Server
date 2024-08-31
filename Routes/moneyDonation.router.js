const express = require('express');
const router= express.Router()


const { addMoneyDonation, getYearlyTotalDonation, addMonthlyDonation, getSingleUserMonthlyDonation, updateMonthlyDonationAmount, getUserDonationSummary, getUserDonationHistory } = require('../Controller/moneyDonation.controller');

const  verifyAdmin =require('../Middleware/verifyAdmin')
const  verifyToken =require('../Middleware/verifyToken')

router.post('/addDonation',addMoneyDonation);
router.post('/addMonthlyDonation',addMonthlyDonation);
router.patch('/updateDonationAmount/:email',verifyToken,updateMonthlyDonationAmount);
router.get('/yearlyTotalDonation',getYearlyTotalDonation);
router.get('/getUserMonthlyDonationData/:email',verifyToken,getSingleUserMonthlyDonation);
router.get('/userDonationSummary/:email',verifyToken,getUserDonationSummary);
router.get('/userDonationHistory/:email',getUserDonationHistory);


module.exports=router;