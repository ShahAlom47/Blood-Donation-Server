const express = require('express');
const router= express.Router()

const { addUser, isLogin, login, updateUserData, updateUserProfilePhoto,} = require('../Controller/users.controller');

//  example=== /user/addUser

router.post('/addUser',addUser);
router.post('/login',login);
router.post('/is-login',isLogin);
router.patch('/updateUserData/:id',updateUserData);
router.patch('/updateUserProfilePhoto/:email',updateUserProfilePhoto);



module.exports=router;