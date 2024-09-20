const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config();
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { connect } = require('./utils/DB-connect');

// Stripe payment
const stripe = require('stripe')(process.env.STRIPE_KEY);
app.use(express.static('public'));
const cron = require('node-cron');
const sendDonationRemainderEmail = require('./utils/SendEmail/sendDonationRemainderEmail');

const server = http.createServer(app);

// Update Socket.IO CORS Settings
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://blood-donation-client-zeta.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: true // Add this line if you need to send cookies
  }
});

// Middleware
app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://blood-donation-client-zeta.vercel.app"
  ],
  credentials: true // Add this line to allow credentials
}));

app.use(cookieParser());

// Socket handler
const socketHandler = require('./ChatApp/ChatApp');
socketHandler(io);

// Monthly donation reminder

// 0: মিনিটের জন্য (০ মিনিট)-- 0: ঘণ্টার জন্য (মধ্যরাত ১২টা)--  1: মাসের প্রথম দিন  --*: মাসের যেকোনো মাস -- *: সপ্তাহের যেকোনো দিন  মাসের প্রথম দিন (১ তারিখ) রাত ১২টা ০ মিনিটে চলবে
cron.schedule('0 0 1 * *', async () => {
  try {
    await sendDonationRemainderEmail();
  } catch (error) {
    console.error(error);
  }
});

// JWT related API
app.post('/jwt', async (req, res) => {
  const userInfo = req.body.userInfo;
  const token = jwt.sign({ data: userInfo }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
  res.send({ token });
});

// Routes
const userRoutes = require('./Routes/users.routes');
const donationRoutes = require('./Routes/donation.router');
const notificationRoutes = require('./Routes/notification.router');
const bloodBankRoutes = require('./Routes/bloodBank.router');
const paymentRoutes = require('./Routes/payment.router');
const moneyDonation = require('./Routes/moneyDonation.router');
const chatRoute = require('./Routes/chart.router');

app.use('/user', userRoutes);
app.use('/donation', donationRoutes);
app.use('/moneyDonation', moneyDonation);
app.use('/notification', notificationRoutes);
app.use('/bloodBank', bloodBankRoutes);
app.use('/payment', paymentRoutes);
app.use('/chatData', chatRoute);

app.get('/', (req, res) => {
  res.send('Red Love is Running');
});

// Start the server
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
