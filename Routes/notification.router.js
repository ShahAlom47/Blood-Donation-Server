const express = require('express');
const router= express.Router()
const { userNotification, allNotification, updateNotificationStatus } = require('../Controller/notification.controller');
const  verifyAdmin =require('../Middleware/verifyAdmin')
const  verifyToken =require('../Middleware/verifyToken')


router.get('/getUserNotification/:email',userNotification);
router.get('/getAllNotification',verifyToken,allNotification);
router.patch('/updateNotificationStatus/:id',verifyToken,updateNotificationStatus);

module.exports=router;