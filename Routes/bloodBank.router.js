const express = require('express');
const router= express.Router()
const verifyToken = require('../Middleware/verifyToken');
const verifyAdmin = require('../Middleware/verifyAdmin');
const { addBloodDonor, getBloodGroupSummary, getBloodGroupData } = require('../Controller/bloodBank.controller');

router.post('/addBloodDonor',addBloodDonor);
router.get('/blood-summary', verifyToken ,getBloodGroupSummary);
router.get('/blood-groupData/:group', verifyToken ,getBloodGroupData);

module.exports=router;