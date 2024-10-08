const { db } = require("../utils/DB-connect");
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const { getUserCollection } = require("../utils/AllDB_Collections/userCollection");
const { ObjectId } = require("mongodb");
const { getNotificationCollection } = require("../utils/AllDB_Collections/NotificationCollection");



const usersCollection = getUserCollection();
const notificationCollection = getNotificationCollection();


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



}


// get all user for admin 
const getAllUser = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.floor(parseInt(req.query.limit)) || 5;
    const skip = (page - 1) * limit;

   
    const totalUserCount = await usersCollection.countDocuments();

    const allUserResult = await usersCollection
      .find()
      .skip(skip)
      .limit(limit)
      .toArray();

    res.send({
      data: allUserResult,
      totalPages: Math.ceil(totalUserCount / limit),
      currentPage: page
    });

  } catch (error) {
    console.error("Error retrieving donation history:", error);
    res.status(500).send("Failed to get donation history.");
  }

}

// user role update 

const updateUserRole = async (req, res) => {
  try {
    const email = req.params.email;
    const data = req.body;

    const query = { email: email };
    const role = data?.value;

    const updateData = {
      $set: { role: data?.value || 'user' }
    };

 console.log(email,role,data.notificationData);

    const result = await usersCollection.updateOne(query, updateData);

    if (result.modifiedCount <= 0) {
      res.send({ success: false, message: 'Role update failed' });
      return;
    }

    
    const notiRes = await notificationCollection.insertOne(data.notificationData);
    if (notiRes.insertedId) {
      res.send({ success: true, message: 'User role updated successfully' });
      return;
    }

    res.send({ success: false, message: 'Role update failed' });

  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).send("Failed to update user role.");
  }
}


const deleteUser = async (req, res) => {
  const email = req.params.email;

  if (!email) {
    return res.status(400).send({ status: false, message: 'Email is required' });
  }

  try {
  
    const result = await usersCollection.deleteOne({ email: email });

    if (result.deletedCount > 0) {
      res.send({ status: true, message: 'User deleted successfully' });
    } else {
      res.status(500).send({ status: false, message: 'Failed to delete user' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send({ status: false, message: 'Internal Server Error' });
  }
};


// password change Related API 
// =================================

const checkPassword = async (req, res) =>{
const {password}= req.body;
const userEmail= req.params.email;

try {
  const user = await usersCollection.findOne({ email: userEmail });

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.send({status:false, message: 'Invalid  password' });
  }
  res.send({status:true, message: 'Password Match' });


} catch (error) {
  res.sendStatus(500); // Internal server error
}

}


// change password 
const changePassword = async (req, res) => {
  const { newPassword } = req.body;
  const userEmail = req.params.email;

  // Validate input
  if (!newPassword || !userEmail) {
    return res.status(400).send({ status: false, message: 'Invalid input: Please provide new password.' });
  }

  try {

    const hashedPassword = await bcrypt.hash(newPassword, 10);

  
    const updateRes = await usersCollection.updateOne(
      { email: userEmail },
      { $set: { password: hashedPassword } }
    );


    if (updateRes.modifiedCount === 0) {
      return res.status(404).send({ status: false, message: 'Password change failed: User not found or no changes made.' });
    }


    res.send({ status: true, message: 'Your password has been successfully updated.' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).send({ status: false, message: 'An error occurred while updating the password. Please try again later.' });
  }
};

// Forget Password Related API 
// ===============================


const findUserAccount = async (req, res) => {
  try {
    const userEmail = req.params.email;

    const user = await usersCollection.findOne({ email: userEmail });

    if (user) {
      return res.send({ status: true, user: user });
    }

    return res.send({ 
      status: false, 
      message: 'No account found with the provided email. Please check your email address and try again.' 
    });

  } catch (error) {
    console.error('Error finding user account:', error);
    res.send({
      status: false,
      message: 'An error occurred while searching for the account. Please try again later.'
    });
  }
};


module.exports = {
  addUser,
  login,
  isLogin,
  updateUserData,
  updateUserProfilePhoto,
  getAllUser,
  updateUserRole,
  deleteUser,
  checkPassword,
  changePassword,
  findUserAccount
}