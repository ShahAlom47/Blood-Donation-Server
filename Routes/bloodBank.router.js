const express = require('express');
const router= express.Router()
const verifyToken = require('../Middleware/verifyToken');
const verifyAdmin = require('../Middleware/verifyAdmin');
const { addBloodDonor, getBloodGroupSummary, getBloodGroupData, updateBloodBankDataState, getAllBloodBankData } = require('../Controller/bloodBank.controller');

router.get('/admin/allBloodBankData',verifyToken,verifyAdmin,getAllBloodBankData);
router.post('/addBloodDonor',addBloodDonor);
router.get('/blood-summary',getBloodGroupSummary);
router.get('/blood-groupData/:group', verifyToken ,getBloodGroupData);
router.patch('/blood-bank-updateState/:id' ,updateBloodBankDataState);

module.exports=router;