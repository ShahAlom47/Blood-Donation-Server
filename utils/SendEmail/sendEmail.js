
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS ,
    },
  });
const sendEmail=async(mailOptions)=>{
  const mailRes=  await transporter.sendMail(mailOptions);
  return mailRes
}

module.exports =sendEmail;