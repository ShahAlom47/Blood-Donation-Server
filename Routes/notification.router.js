const express = require('express');
const { userNotification } = require('../Controller/notification.controller');
const router= express.Router()

router.get('/getUserNotification/:email',userNotification);

module.exports=router;