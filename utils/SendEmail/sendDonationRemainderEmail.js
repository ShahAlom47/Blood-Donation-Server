const nodemailer = require('nodemailer');
const { getMoneyDonateCollection } = require('../AllDB_Collections/moneyDonteCollection');
const { addNotification } = require('../../Controller/notification.controller');

const moneyDonationCollection = getMoneyDonateCollection();


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS ,
  },
});



const checkAndSendReminder = async () => {
  try {
  
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const previousMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth()).padStart(2, '0')}`;

   
    const donors = await moneyDonationCollection.find({
      donationType: 'monthlyDonation'
    }).toArray();

    for (const donor of donors) {
      const { donationHistory, donorEmail,donorName } = donor;


      const lastDonationMonth = donationHistory.length > 0 ? donationHistory[donationHistory.length - 1].donationMonth : '';

      if (lastDonationMonth !== previousMonth) {
        const mailOptions = {
          from: 'redloveservice@gmail.com',
          to: donorEmail,
          subject: 'Reminder: Time to make your monthly donation',
          text: `Dear ${donor.donorName},\n\nIt has been a month since your last donation.  The month of your last grant ${lastDonationMonth}. Please consider making your monthly donation to continue supporting our cause.\n\nThank you!`
        };

        const notificationData = {
         
          donorEmail: donorEmail,
          donorName: donorName,
          message: ` Dear ${donor?.donorName},It has been a month since your last donation. The month of your last grant ${lastDonationMonth}. Please consider making your monthly donation to continue supporting our cause.`,
          type: 'moneyDonation',
          status: 'unread',
          timestamp: new Date()
        };
        await addNotification(notificationData);
        await transporter.sendMail(mailOptions);

        console.log(`Reminder sent to ${donorEmail}`);
      }
    }
  } catch (error) {
    console.error('Error checking donations and sending reminders:', error);
  }
};

module.exports =checkAndSendReminder ;
