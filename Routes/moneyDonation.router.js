const express = require('express');
const router= express.Router()


const { addMoneyDonation, getYearlyTotalDonation } = require('../Controller/moneyDonation.controller');



router.post('/addDonation',addMoneyDonation);
router.get('/yearlyTotalDonation',getYearlyTotalDonation);


module.exports=router;