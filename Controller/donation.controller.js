
const { db } = require("../utils/DB-connect");
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const { ObjectId } = require("mongodb");



const donationCollection = db.collection('donation')


// Blood request 

const addBloodRequest= async(req,res)=>{
const data= req.body;
const response= await donationCollection.insertOne(data)
return res.send(response)

}

// get blood request data 

const getBloodRequest = async (req, res) => {
   const { page = 1, limit = 8 } = req.query; // ডিফল্টভাবে পৃষ্ঠা সংখ্যা ১ এবং লিমিট ৮ সেট করা হয়েছে

   try {
       const response = await donationCollection.find()
           .sort({ requireDate: -1 }) // requireDate অনুযায়ী সর্বশেষ তারিখের ক্রমে সাজানো
           .skip((page - 1) * limit) // পৃষ্ঠা অনুযায়ী ডেটা স্কিপ করা
           .limit(parseInt(limit)) // লিমিট অনুযায়ী ডেটা সীমিত করা
           .toArray();

       const total = await donationCollection.countDocuments(); // মোট ডকুমেন্ট সংখ্যা

       return res.send({
           data: response,
           totalPages: Math.ceil(total / limit),
           currentPage: parseInt(page)
       });
   } catch (error) {
       console.error(error);
       return res.status(500).send('Server Error');
   }
};


const getBloodRequestDetails = async (req, res) => {
const id=req.params.id
const query={_id:new ObjectId(id)}
const result= await donationCollection.findOne(query)
return res.send(result)
}




module.exports={
   addBloodRequest,
   getBloodRequest,
   getBloodRequestDetails,
}