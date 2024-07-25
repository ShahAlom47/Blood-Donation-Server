const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config();
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // Import cookie-parser
const { connect } = require('./utils/DB-connect');

// Middleware
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
}));
app.use(cookieParser()); // Use cookie-parser



// JWT related API
app.post('/jwt', async (req, res) => {
  const userInfo = req.body.userInfo

  const token = jwt.sign({
    data: userInfo
  }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
  res.send({ token })

})

// Routes
const userRoutes = require('./Routes/users.routes');
app.use('/user', userRoutes);


app.get('/', (req, res) => {
    res.send('Red Love is Running');
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
