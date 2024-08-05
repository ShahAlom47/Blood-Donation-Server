const express = require('express');
const router= express.Router()

const { addUser, isLogin, login, updateUserData, updateUserProfilePhoto,} = require('../Controller/users.controller');
const verifyToken = require('../Middleware/verifyToken');
//  example=== /user/addUser

router.post('/addUser',addUser);
router.post('/login',login);
router.post('/is-login',isLogin);
router.patch('/updateUserData/:id', updateUserData);
router.patch('/updateUserProfilePhoto/:email',verifyToken,updateUserProfilePhoto);



module.exports=router;