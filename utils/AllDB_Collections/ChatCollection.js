const { db } = require("../DB-connect");



const getChatCollection  = () => {
    return db.collection('chatCollection');
};

module.exports = { getChatCollection };