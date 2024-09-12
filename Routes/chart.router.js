const express = require('express');
const router= express.Router()
const verifyToken = require('../Middleware/verifyToken');
const verifyAdmin = require('../Middleware/verifyAdmin');

const { getAllChatUsers, changeUserReadMsgStatus, changeAdminReadMsgStatus } = require('../Controller/chatController');


router.get('/chartUsers/:email',getAllChatUsers);
router.patch('/changeUserMessageRedStatus',changeUserReadMsgStatus);
router.patch('/changeAdminMessageRedStatus',changeAdminReadMsgStatus);


module.exports=router;