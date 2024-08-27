const { getNotificationCollection } = require("./AllDB_Collections/NotificationCollection");

const notificationCollection = getNotificationCollection();

const addNotification = async (notificationData) => {
  try {
    const res = await notificationCollection.insertOne(notificationData);
    return res;
  } catch (error) {
    console.error("Error inserting notification: ", error.message);
    throw new Error("Failed to add notification. Please try again later.");
  }
};


module.exports = addNotification;
