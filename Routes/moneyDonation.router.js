const express = require('express');
const router= express.Router()


const { addMoneyDonation, getYearlyTotalDonation, addMonthlyDonation } = require('../Controller/moneyDonation.controller');



router.post('/addDonation',addMoneyDonation);
router.post('/addMonthlyDonation',addMonthlyDonation);
router.get('/yearlyTotalDonation',getYearlyTotalDonation);


module.exports=router;