const { db } = require("../DB-connect");



const getBloodBankCollection = () => {
    return db.collection('bloodBank');
};

module.exports = { getBloodBankCollection };