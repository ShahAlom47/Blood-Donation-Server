const express = require('express');
const { addBloodDonor } = require('../Controller/bloodBank.controller');
const router= express.Router()

router.post('/addBloodDonor',addBloodDonor);

module.exports=router;