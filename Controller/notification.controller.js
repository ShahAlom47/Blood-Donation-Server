const { ObjectId } = require("mongodb");
const { getNotificationCollection } = require("../utils/AllDB_Collections/NotificationCollection");


const notificationCollection = getNotificationCollection();



const fetchNotifications = async (req, res, userRole, email) => {
  let query = {};

  if (userRole === 'user') {
    query = {
      $or: [
        { type: "donation_interest", requesterEmail: email },
        { type: "blood_bank_blood_request", requesterEmail: email },
        { type: "blood_bank_blood_request", donorEmail: email },
        { type: "donation_accept", donorEmail: email },
        { type: "moneyDonation", donorEmail: email },
        
        { type: "new_message", userEmail: email },
        { type: "event_invitation", inviteeEmail: email },
        { type: "comment_reply", commentOwnerEmail: email },
        { type: "like_notification", likedUserEmail: email },
        { type: "group_invite", invitedEmail: email },
        { type: "promotion_notification", userEmail: email }
      ]
    };
  } else if (userRole === 'admin') {
    query = {
      $or: [
        { type: "blood_bank_blood_request" },
        { type: "donation_interest" },
        { type: "donation_accept" },
        { type: "donation_received" },
        { type: "moneyDonation" }
      ]
    };
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  try {
    const notifications = await notificationCollection
      .find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await notificationCollection.countDocuments(query);
    const pages = Math.ceil(total / limit);

    return res.send({ notifications, total, pages });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).send({ success: false, error: 'Failed to fetch notifications' });
  }
};

// For user notifications
const userNotification = (req, res) => {
  const email = req.params.email;
  fetchNotifications(req, res, 'user', email);
};

// For admin notifications
const allNotification = (req, res) => {
  fetchNotifications(req, res, 'admin');
};






const updateNotificationStatus = async (req, res) => {
  const id = req.params.id;

  try {
    const query = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: { status: 'read' }
    };
    const result = await notificationCollection.updateOne(query, updateDoc);

    if (result.modifiedCount === 0) {
      return res.send({state:false, message: "Notification not found or already marked as read" });
    }

    return res.send({ state:true, message: "Notification status updated to 'read'", result });
  } catch (error) {
    console.error("Error updating notification status:", error);
    return res.status(500).send({state:false, message: "Internal Server Error", error });
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
  updateNotificationStatus,
};
