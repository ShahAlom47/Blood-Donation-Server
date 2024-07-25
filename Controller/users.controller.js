const { db } = require("../utils/DB-connect");
const bcrypt = require('bcryptjs');



const usersCollection = db.collection('users')

const addUser = async (req, res) => {
    try {
        const userData = req.body;
        const hashedPassword = await bcrypt.hash(userData.password, 10)
        const result = await usersCollection.insertOne({
            ...userData,
            password: hashedPassword 
        });
        res.status(201).send(result);
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).send('Internal Server Error');
    }
};


module.exports={
    addUser,
}