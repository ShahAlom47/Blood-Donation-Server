const express = require('express');
const router= express.Router()


const { addMoneyDonation, getYearlyTotalDonation, addMonthlyDonation, getSingleUserMonthlyDonation, updateMonthlyDonationAmount } = require('../Controller/moneyDonation.controller');



router.post('/addDonation',addMoneyDonation);
router.post('/addMonthlyDonation',addMonthlyDonation);
router.patch('/updateDonationAmount/:email',updateMonthlyDonationAmount);
router.get('/yearlyTotalDonation',getYearlyTotalDonation);
router.get('/getUserMonthlyDonationData/:email',getSingleUserMonthlyDonation);


module.exports=router;