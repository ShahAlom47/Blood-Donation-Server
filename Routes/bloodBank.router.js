const express = require('express');
const router= express.Router()
const verifyToken = require('../Middleware/verifyToken');
const verifyAdmin = require('../Middleware/verifyAdmin');
const { addBloodDonor, getBloodGroupSummary, getBloodGroupData, updateBloodBankDataState, getAllBloodBankData, deleteBloodBankData, rejectBloodBankRequest, acceptBloodBankRequest, getUserBloodBankRequest, cancelUserBloodBankRequest, completeUserBloodBankRequest } = require('../Controller/bloodBank.controller');

router.get('/admin/allBloodBankData',verifyToken,verifyAdmin,getAllBloodBankData);

router.get('/user/allBloodBankRequest/:email',getUserBloodBankRequest);
router.patch('/user/cancelBloodBankRequest/:id',verifyToken,cancelUserBloodBankRequest);
router.patch('/user/completeBloodBankRequest/:id',verifyToken,completeUserBloodBankRequest);
router.post('/addBloodDonor',addBloodDonor);
router.get('/blood-summary',getBloodGroupSummary);
router.get('/blood-groupData/:group', verifyToken ,getBloodGroupData);
router.patch('/blood-bank-updateState/:id' ,updateBloodBankDataState);
router.delete('/admin/delete-blood-bank-data/:id',verifyToken,verifyAdmin ,deleteBloodBankData);
router.patch('/admin/reject-requester/:id',verifyToken,verifyAdmin ,rejectBloodBankRequest);
router.patch('/admin/accept-requester/:id',verifyToken,verifyAdmin ,acceptBloodBankRequest);

module.exports=router;