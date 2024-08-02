const { getUserCollection } = require("../utils/AllDB_Collections/userCollection");

const usersCollection =getUserCollection()
const verifyAdmin = async (req, res, next) => {
    const tokenEmail = req.email;
    const query = { email: tokenEmail }
    const result = await usersCollection.findOne(query)
    const isAdmin = result?.role === 'admin'

    if (!isAdmin) {
      return res.status(403).send({ message: 'forbidden access' })
    }
    next()
  }

  module.exports =verifyAdmin