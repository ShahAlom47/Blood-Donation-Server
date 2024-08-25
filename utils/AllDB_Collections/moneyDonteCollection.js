const { db } = require("../DB-connect");



const getMoneyDonateCollection = () => {
    return db.collection('moneyDonation');
};

module.exports = { getMoneyDonateCollection };