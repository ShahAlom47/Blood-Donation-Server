const express = require('express');
const router= express.Router()


const { addMoneyDonation, getYearlyTotalDonation, addMonthlyDonation, getSingleUserMonthlyDonation } = require('../Controller/moneyDonation.controller');



router.post('/addDonation',addMoneyDonation);
router.post('/addMonthlyDonation',addMonthlyDonation);
router.get('/yearlyTotalDonation',getYearlyTotalDonation);
router.get('/getUserMonthlyDonationData/:email',getSingleUserMonthlyDonation);


module.exports=router;