const express = require('express');
const router= express.Router()

const { addUser, isLogin, login,} = require('../Controller/users.controller');

//  example=== /user/addUser

router.post('/addUser',addUser);
router.post('/login',login);
router.post('/is-login',isLogin);



module.exports=router;