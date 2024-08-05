const express = require('express');
const router= express.Router()

const { addBloodDonor, getBloodGroupSummary } = require('../Controller/bloodBank.controller');

router.post('/addBloodDonor',addBloodDonor);
router.get('/blood-summary',getBloodGroupSummary);

module.exports=router;