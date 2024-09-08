const express = require('express');
const router= express.Router()
const verifyToken = require('../Middleware/verifyToken');
const verifyAdmin = require('../Middleware/verifyAdmin');

const { getAllChatUsers } = require('../Controller/chatController');


router.get('/chartUsers/:email',getAllChatUsers);


module.exports=router;