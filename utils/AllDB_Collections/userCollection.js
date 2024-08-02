const { db } = require("../DB-connect");

const getUserCollection = () => {
    return db.collection('users');
};

module.exports = { getUserCollection };