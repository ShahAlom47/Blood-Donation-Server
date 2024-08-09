const { getNotificationCollection } = require("../utils/AllDB_Collections/NotificationCollection");


const notificationCollection = getNotificationCollection();

const userNotification = async (req, res) => {
  const email = req.params.email;

  const query = {
    $or: [
      { type: "donation_interest", requesterEmail: email },
      { type: "blood_bank_blood_request", requesterEmail: email },
      { type: "blood_bank_blood_request", donorEmail: email },
      { type: "donation_accept", donorEmail: email },


      { type: "donation_received", recipientEmail: email },
      { type: "new_message", userEmail: email },
      { type: "event_invitation", inviteeEmail: email },
      { type: "comment_reply", commentOwnerEmail: email },
      { type: "like_notification", likedUserEmail: email },
      { type: "group_invite", invitedEmail: email },
      { type: "promotion_notification", userEmail: email }
    ]
  };

  try {
    const interestedNotification = await notificationCollection
      .find(query)
      .sort({ timestamp: -1 })
      .limit(20)
      .toArray();
    return res.send(interestedNotification);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).send({ success: false, error: 'Failed to fetch notifications' });
  }
};


// alll natification for admin 

const allNotification = async (req, res) => {


  const query = {
    $or: [
      { type: "blood_bank_blood_request", },
      { type: "donation_interest", },
      { type: "donation_accept",  },
      { type: "donation_received", },
     
    ]
  };

  try {
    const interestedNotification = await notificationCollection
      .find(query)
      .sort({ timestamp: -1 })
      .limit(20)
      .toArray();
    return res.send(interestedNotification);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).send({ success: false, error: 'Failed to fetch notifications' });
  }
};



// Add notification   

const addNotification = async (notificationData) => {
  try {
      const result = await notificationCollection.insertOne(notificationData);
      return result;
  } catch (error) {
      console.error('Error adding notification:', error);
      return { error: 'Failed to add notification', details: error };
  }
};


module.exports = {
  userNotification,
  addNotification,
  allNotification,
};
