const { db } = require("../utils/DB-connect");
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const { getUserCollection } = require("../utils/AllDB_Collections/userCollection");
const { ObjectId } = require("mongodb");



const usersCollection = getUserCollection()


// Register  


const addUser = async (req, res) => {
  try {
    const userData = req.body;
    const existingUser = await usersCollection.findOne({ email: userData.email });

    if (existingUser) {
      return res.send({ message: 'Account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
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


// User  Login 

const login = async (req, res) => {

  const { email, password } = req.body;
  try {
    const user = await usersCollection.findOne({ email: email });

    if (!user) {
      return res.send({ message: 'Invalid email' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.send({ message: 'Invalid  password' });
    }
    res.send({ message: 'Login successful', user });


  } catch (error) {
    res.sendStatus(500); // Internal server error
  }



}


// check user login 
const isLogin = async (req, res) => {
  try {
    const token = req.body.token;
    if (!token) {
      return res.status(400).send({ message: 'Token is missing' });
    }
    
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    const email = decoded.data;

    const existingUser = await usersCollection.findOne({ email: email });

    if (existingUser) {
      const { password, ...userWithoutPassword } = existingUser;
      res.send({ message: 'User is logged in', user: userWithoutPassword });
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).send({ message: 'Token expired' });
    }
    res.sendStatus(500);
  }
}



const updateUserData = async (req, res) => {
  try {
    const id = req.params.id;
    const newData = req.body;

    if (!ObjectId.isValid(id)) {
      return res.send({ message: 'Invalid ID format' });
    }

    const query = { _id: new ObjectId(id) };
    const updateData = {
      $set: newData
    };

    const result = await usersCollection.updateOne(query, updateData);

    if (result.matchedCount === 0) {
      return res.send({ message: 'User not found' });
    }

    return res.send({ message: 'User updated successfully', result });
  } catch (error) {
    console.error('Error updating user data:', error);
    return res.status(500).send({ message: 'Internal Server Error' });
  }
};

const updateUserProfilePhoto = async (req, res) => {
  const email=req.params.email;
  const {photoURL}=req.body;
  const query= {email:email}
  const updateData={
    $set:{
      photoURL:photoURL
    }
  }

  const result=await usersCollection.updateOne(query,updateData)
  return res.send(result)

  console.log(email,photoURL);

}

module.exports = {
  addUser,
  login,
  isLogin,
  updateUserData,
  updateUserProfilePhoto,
}