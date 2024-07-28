const { db } = require("./DB-connect");


const getNotificationCollection = () => {
    return db.collection('notification');
};

module.exports = { getNotificationCollection };