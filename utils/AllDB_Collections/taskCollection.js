const { db } = require("../DB-connect");




const getTaskCollection = () => {
    return db.collection('taskCollection');
};

module.exports = { getTaskCollection };