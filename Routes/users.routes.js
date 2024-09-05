const express = require('express');
const router= express.Router()

const { addUser, isLogin, login, updateUserData, updateUserProfilePhoto, getAllUser, updateUserRole, deleteUser,} = require('../Controller/users.controller');
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
router.delete('/deleteUser/:email',verifyToken,verifyAdmin,deleteUser);



module.exports=router;