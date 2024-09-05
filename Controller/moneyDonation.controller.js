


const addNotification = require("../utils/addNotification");
const { getMoneyDonateCollection } = require("../utils/AllDB_Collections/moneyDonteCollection");
const { getNotificationCollection } = require("../utils/AllDB_Collections/NotificationCollection");
const { getUserCollection } = require("../utils/AllDB_Collections/userCollection");


const moneyDonationCollection = getMoneyDonateCollection()
const notificationCollection = getNotificationCollection()
const userCollection = getUserCollection()

// add donation 

const addMoneyDonation = async (req, res) => {
  const donationData = req.body;

  const notificationData = {
    donorEmail: donationData?.donorEmail,
    donorName: donationData?.donorName,
    message: `Thank you, ${donationData?.donorName}, for your generous donation of $${donationData?.amount}! Your support means a lot to us.`,
    type: "moneyDonation",
    status: "unread",
    timestamp:  new Date().toISOString()
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


//   add  monthly donation 


const addMonthlyDonation = async (req, res) => {
  try {
    const donationData = req.body;
    const {
      donorEmail,
      donationType,
      monthlyAmount,
      donationHistory,
      lastDonationDate,
    } = donationData;

    const notificationData = {
      donorEmail: donationData.donorEmail,
      donorName: donationData.donorName,
      message: `Dear ${donationData.donorName}, your donation for ${donationData.donationHistory.length} month(s), totaling $${monthlyAmount * donationData.donationHistory.length}, has been successfully completed. We are deeply grateful for your continuous support and generosity. Thank you for making a difference!`,
      type: "moneyDonation",
      status: "unread",
      timestamp:  new Date().toISOString(),
    };


    const existingDonor = await moneyDonationCollection.findOne({
      donorEmail: donorEmail,
      donationType: donationType,
    });

    if (existingDonor) {
      const updatedDonationHistory = [...existingDonor.donationHistory, ...donationHistory];


      const updateResult = await moneyDonationCollection.updateOne(
        { donorEmail: donorEmail, donationType: donationType },
        {
          $set: {
            lastDonationDate: lastDonationDate,
            donationHistory: updatedDonationHistory,
          },
        }
      );

      if (updateResult.modifiedCount > 0) {

        const addNotificationRes = await addNotification(notificationData);

        if (addNotificationRes.insertedId) {
          res.status(200).json({ status: true, message: 'Your Donation is Complete.' });
        } else {
          res.status(500).json({ status: false, message: 'Failed to send notification.' });
        }
      }

    } else {


      const newMonthlyDonorAddRes = await moneyDonationCollection.insertOne(donationData);

      if (newMonthlyDonorAddRes.insertedId) {
        const query = { email: donorEmail };
        const updateData = {
          $set: {
            monthlyDonation: 'active',
            donationAmount: monthlyAmount,
          },
        };

        const updateUserData = await userCollection.updateOne(query, updateData);

        if (updateUserData.modifiedCount > 0) {
          const addNotificationRes = await addNotification(notificationData);

          if (addNotificationRes.insertedId) {
            res.status(200).json({ status: true, message: 'Your Donation is Complete.' });
          } else {
            res.status(500).json({ status: false, message: 'Failed to send notification.' });
          }
        } else {
          res.status(500).json({ status: false, message: 'Failed to update user data.' });
        }
      } else {
        res.status(500).json({ status: false, message: 'Failed to add new donor data.' });
      }
    }
  } catch (error) {
    console.error('Error processing donation:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// update donation amount 


const updateMonthlyDonationAmount = async (req, res) => {
  try {
    const email = req.params.email;
    const { amount } = req.body;

    const userQuery = { email };
    const donorQuery = { 
      donorEmail: email,
      donationType:'monthlyDonation',
     };
    
    const userUpdateData = { $set: { donationAmount: amount } };
    const donorUpdateData = { $set: { monthlyAmount: amount } };

   
    const updateUserData = await userCollection.updateMany(userQuery, userUpdateData);
    if (updateUserData.modifiedCount === 0) {
      return res.status(404).send({ status: false, message: 'User not found or amount is already updated' });
    }

   
    const updateDonorData = await moneyDonationCollection.updateOne(donorQuery, donorUpdateData);
    if (updateDonorData.modifiedCount === 0) {
      return res.status(404).send({ status: false, message: 'Donor not found or amount is already updated' });
    }

    // Successful update
    return res.send({ status: true, message: 'Your amount was successfully updated' });

  } catch (error) {
    
    console.error('Error updating donation amount:', error);
    return res.status(500).send({ status: false, message: 'An error occurred while updating the amount' });
  }
};


// get user monthly donation single  data 

const getSingleUserMonthlyDonation = async (req, res) => {
try{
  const email=req.params.email
  const query= {
    donorEmail:email,
    donationType:'monthlyDonation'
  }
  
  const result=await moneyDonationCollection.findOne(query)
  return  res.send(result)

}
catch (error) {
  console.error("Error getting user monthly donation:", error);
  res.status(500).send("Internal Server Error");
}

}

// yearly total donation 

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

//  user total donation summary 

const getUserDonationSummary = async (req, res) => {
  try {
      const email = req.params.email;

      const oneTimeDonations = await moneyDonationCollection.aggregate([
          { $match: { donorEmail: email, donationType: 'oneTimeDonation' } },
          { $group: { _id: null, totalOneTimeAmount: { $sum: "$amount" } } }
      ]).toArray();

    
      const monthlyDonations = await moneyDonationCollection.aggregate([
          { $match: { donorEmail: email, donationType: 'monthlyDonation' } },
          { $unwind: "$donationHistory" },
          { $group: { _id: null, totalMonthlyAmount: { $sum: "$donationHistory.amount" } } }
      ]).toArray();

  
      const result = {
          oneTimeDonation: oneTimeDonations[0]?.totalOneTimeAmount || 0,
          monthlyDonation: monthlyDonations[0]?.totalMonthlyAmount || 0
      };
      res.send(result);

  } catch (error) {
    
      console.error('Error fetching donation summary:', error);
      res.status(500).send({
          status: false,
          message: 'An error occurred while fetching the donation summary.'
      });
  }
};
  
// all donation summary for admin dashboard 
const totalDonationSummary = async (req, res) => {
  try {
      // One-time Donations: Calculate total amount and total donors
      const oneTimeDonations = await moneyDonationCollection.aggregate([
          { $match: { donationType: 'oneTimeDonation' } },
          { $group: { _id: "$donorEmail", totalOneTimeAmount: { $sum: "$amount" } } },
          { $group: { _id: null, totalOneTimeAmount: { $sum: "$totalOneTimeAmount" }, totalOneTimeDonors: { $sum: 1 } } }
      ]).toArray();

      // Monthly Donations: Calculate total amount and total donors
      const monthlyDonations = await moneyDonationCollection.aggregate([
          { $match: { donationType: 'monthlyDonation' } },
          { $unwind: "$donationHistory" },
          { $group: { _id: "$donorEmail", totalMonthlyAmount: { $sum: "$donationHistory.amount" } } },
          { $group: { _id: null, totalMonthlyAmount: { $sum: "$totalMonthlyAmount" }, totalMonthlyDonors: { $sum: 1 } } }
      ]).toArray();

      const guestDonations = await moneyDonationCollection.aggregate([
          { $match: {userType:'guest' } },
          { $group: { _id: "$donorEmail", totalGuestDonationAmount: { $sum: "$amount" } } },
          { $group: { _id: null, totalGuestDonationAmount: { $sum: "$totalGuestDonationAmount" }, totalGuestDonor: { $sum: 1 } } }
      ]).toArray();

      const result = {
          oneTimeDonation: oneTimeDonations[0]?.totalOneTimeAmount || 0,
          oneTimeDonor: oneTimeDonations[0]?.totalOneTimeDonors || 0,

          monthlyDonation: monthlyDonations[0]?.totalMonthlyAmount || 0,
          monthlyDonor: monthlyDonations[0]?.totalMonthlyDonors || 0,
          
          guestDonation: guestDonations[0]?.totalGuestDonationAmount || 0,
          guestDonor: guestDonations[0]?.totalGuestDonor || 0,

      };

      res.send(result);

  } catch (error) {
      console.error('Error fetching donation summary:', error);
      res.status(500).send({
          status: false,
          message: 'An error occurred while fetching the donation summary.'
      });
  }
};


//  user donation details 

const getUserDonationHistory = async (req, res) => {
  try {
    const userEmail = req.params.email;

    const oneTimeDonations = await moneyDonationCollection
      .find({ donorEmail: userEmail, donationType: "oneTimeDonation" })
      .toArray();

    const monthlyDonations = await moneyDonationCollection
      .find({ donorEmail: userEmail, donationType: "monthlyDonation" })
      .toArray();

    let allDonations = [...oneTimeDonations];

    monthlyDonations.forEach((monthlyDonation) => {
      if (monthlyDonation.donationHistory && monthlyDonation.donationHistory.length > 0) {
        monthlyDonation.donationHistory.forEach((history) => {
          allDonations.push({
            _id: monthlyDonation._id,
            donorName: monthlyDonation.donorName,
            donorEmail: monthlyDonation.donorEmail,
            donorPhone: monthlyDonation.donorPhone,
            date: history.donateDate || monthlyDonation.date,
            donationMonth:history.donationMonth || 'One Time',
            amount: monthlyDonation.monthlyAmount,
            category: monthlyDonation.category,
            donationType: monthlyDonation.donationType,
            paymentType: monthlyDonation.paymentType || "unknown",
            transactionId: monthlyDonation.transactionId || "unknown",
          });
        });
      }
    });

    res.send(allDonations);
  } catch (error) {
    console.error("Error retrieving donation history:", error);
    res.status(500).send("Failed to get donation history.");
  }
};

// all user donation histroy for Admin 

const getAllMoneyDonationHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.floor(parseInt(req.query.limit)/2) || 5;
    const skip = (page - 1) * limit;

   
    const oneTimeDonationCount = await moneyDonationCollection
      .countDocuments({ donationType: "oneTimeDonation" });


    const monthlyDonationCount = await moneyDonationCollection
      .countDocuments({ donationType: "monthlyDonation" });

    const totalDonationsCount = oneTimeDonationCount + monthlyDonationCount;

   
    const oneTimeDonations = await moneyDonationCollection
      .find({ donationType: "oneTimeDonation" })
      .skip(skip)
      .limit(limit)
      .toArray();

 
    const monthlyDonations = await moneyDonationCollection
      .find({ donationType: "monthlyDonation" })
      .skip(skip)
      .limit(limit)
      .toArray();

    let allDonations = [...oneTimeDonations];

    monthlyDonations.forEach((monthlyDonation) => {
      if (monthlyDonation.donationHistory && monthlyDonation.donationHistory.length > 0) {
        monthlyDonation.donationHistory.forEach((history) => {
          allDonations.push({
            _id: monthlyDonation._id,
            donorName: monthlyDonation.donorName,
            donorEmail: monthlyDonation.donorEmail,
            donorPhone: monthlyDonation.donorPhone,
            date: history.donateDate || monthlyDonation.date,
            donationMonth: history.donationMonth || 'One Time',
            amount: monthlyDonation.monthlyAmount,
            category: monthlyDonation.category,
            donationType: monthlyDonation.donationType,
            paymentType: monthlyDonation.paymentType || "unknown",
            transactionId: monthlyDonation.transactionId || "unknown",
          });
        });
      }
    });

    res.send({
      data: allDonations,
      totalPages: Math.ceil(totalDonationsCount / limit),
      currentPage: page
    });

  } catch (error) {
    console.error("Error retrieving donation history:", error);
    res.status(500).send("Failed to get donation history.");
  }
};







module.exports = {
  addMoneyDonation,
  getYearlyTotalDonation,
  addMonthlyDonation,
  getSingleUserMonthlyDonation,
  updateMonthlyDonationAmount,
  getUserDonationSummary,
  getUserDonationHistory,
  totalDonationSummary,
  getAllMoneyDonationHistory,
}


