const express = require('express');
const router= express.Router()

const { addUser,} = require('../Controller/users.controller');

//  example=== /user/addUser

router.post('/addUser',addUser);



module.exports=router;