const express = require('express');
const router= express.Router()
const { userNotification, allNotification } = require('../Controller/notification.controller');
const  verifyAdmin =require('../Middleware/verifyAdmin')
const  verifyToken =require('../Middleware/verifyToken')


router.get('/getUserNotification/:email',userNotification);
router.get('/getAllNotification',verifyToken,verifyAdmin,allNotification);

module.exports=router;