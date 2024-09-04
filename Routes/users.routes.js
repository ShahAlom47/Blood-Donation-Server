const express = require('express');
const router= express.Router()

const { addUser, isLogin, login, updateUserData, updateUserProfilePhoto, getAllUser, updateUserRole,} = require('../Controller/users.controller');
const verifyToken = require('../Middleware/verifyToken');
const verifyAdmin = require('../Middleware/verifyAdmin');
//  example=== /user/addUser

router.post('/addUser',addUser);
router.post('/login',login);
router.post('/is-login',isLogin);
router.patch('/updateUserData/:id', updateUserData);
router.patch('/updateUserProfilePhoto/:email',verifyToken,updateUserProfilePhoto);
router.get('/allUser',verifyToken,verifyAdmin,getAllUser);
router.patch('/updateUserRole/:email',verifyToken,verifyAdmin,updateUserRole);



module.exports=router;