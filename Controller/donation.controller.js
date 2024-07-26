
const { db } = require("../utils/DB-connect");
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');



const donationCollection = db.collection('donation')


// Blood request 

const bloodRequest= async(req,res)=>{
const data= req.body;
const response= await donationCollection.insertOne(data)
return res.send(response)

}


module.exports={
   bloodRequest,

}