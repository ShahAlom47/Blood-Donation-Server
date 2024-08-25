

const { getMoneyDonateCollection } = require("../utils/AllDB_Collections/moneyDonteCollection");
const { getNotificationCollection } = require("../utils/AllDB_Collections/NotificationCollection");



const moneyDonationCollection = getMoneyDonateCollection()
const notificationCollection= getNotificationCollection()

// add donation 

const addMoneyDonation = async (req, res) => {
    const donationData = req.body;
    
    const notificationData = {
      donorEmail: donationData?.donorEmail,
      donorName: donationData?.donorName,
      message: `Thank you, ${donationData?.donorName}, for your generous donation of $${donationData?.amount}! Your support means a lot to us.`,
      type: "moneyDonation",
      status: "unread",
      timestamp: new Date()
    };
  
    try {
      const result = await moneyDonationCollection.insertOne(donationData);
  
      if (result.insertedId) {
        await notificationCollection.insertOne(notificationData);
  
        res.status(201).send(result);
      } else {
        res.status(400).send({
          success: false,
          message: "Failed to record the donation. Please try again."
        });
      }
    } catch (error) {
      console.error("Error ", error.message);
      res.status(500).send({
        success: false,
        message: " Please try again later."
      });
    }
  };
  


  const getYearlyTotalDonation = async (req, res) => {
    try {
      const currentYear = new Date().getFullYear();
  
      const result = await moneyDonationCollection.aggregate([
        {
          $addFields: {
            dateObj: {
              $dateFromString: {
                dateString: {
                  $concat: [
                    { $arrayElemAt: [{ $split: ["$date", "/"] }, 2] }, // বছর অংশ
                    "-",
                    { $arrayElemAt: [{ $split: ["$date", "/"] }, 0] }, // মাস অংশ
                    "-",
                    { $arrayElemAt: [{ $split: ["$date", "/"] }, 1] }  // দিন অংশ
                  ]
                }
              }
            }
          }
        },
        {
          $match: {
            $expr: {
              $eq: [
                { $year: "$dateObj" },
                currentYear
              ]
            }
          }
        },
        {
          $group: {
            _id: null, 
            totalAmount: {
              $sum: "$amount" 
            }
          }
        }
      ]).toArray();
  
      res.json(result);
    } catch (error) {
      console.error("Error getting yearly total donation:", error);
      res.status(500).send("Internal Server Error");
    }
  };
  
  



module.exports = {
    addMoneyDonation,
getYearlyTotalDonation
}