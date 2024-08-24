const express = require('express');
const http = require('http'); // Import http module
const { Server } = require('socket.io'); // Import Server class from socket.io
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config();
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { connect } = require('./utils/DB-connect');
// stripe  payment 
const stripe = require('stripe')(process.env.STRIPE_KEY);
app.use(express.static('public'));


// Create HTTP server
const server = http.createServer(app);

// Create Socket.io instance
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", 
      "http://localhost:5174",
      'https://blood-donation-client-zeta.vercel.app'],
    credentials: true,
  }
});

// Middleware
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173",
       "http://localhost:5174",
       'https://blood-donation-client-zeta.vercel.app'],
    credentials: true,
}));
app.use(cookieParser());

// Notification middleware
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Notification room management
io.on('connection', (socket) => {
  socket.on('join', (email) => {
    socket.join(email);
  });
});

// JWT related API
app.post('/jwt', async (req, res) => {
  const userInfo = req.body.userInfo;

  const token = jwt.sign({
    data: userInfo
  }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });

  res.send({ token });
});

// Routes
const userRoutes = require('./Routes/users.routes');
const donationRoutes = require('./Routes/donation.router');
const notificationRoutes = require('./Routes/notification.router');
const bloodBankRoutes =  require('./Routes/bloodBank.router');
const paymentRoutes =  require('./Routes/payment.router');


app.use('/user', userRoutes);
app.use('/donation', donationRoutes);
app.use('/notification', notificationRoutes );
app.use('/bloodBank', bloodBankRoutes );
app.use('/payment', paymentRoutes );


// ================================
// app.post("/create-payment-intent", async (req, res) => {
//   try {
//     const { price } = req.body;
//     const amount = parseInt(100 * price);
//     const MAX_AMOUNT = 99999999; // in the smallest currency unit, for AED this is 999,999.99 AED

//     if (amount > MAX_AMOUNT) {
//       return res.status(400).send({ error: 'Amount must be no more than 999,999 AED' });
//     }

//     // Create a PaymentIntent with the order amount and currency
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: amount,
//       currency: "bdt",
//       payment_method_types: ["card"],
//     });

//     res.send({
//       clientSecret: paymentIntent.client_secret,
//     });
//   } catch (error) {
//     console.error('Error creating payment intent:', error);
//     res.status(500).send({ error: 'Failed to create payment intent' });
//   }
// });
// ================================



app.get('/', (req, res) => {
    res.send('Red Love is Running');
});

// Start the server
server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});



// check total code line . 
// find . -path ./node_modules -prune -o -path ./.git -prune -o -name '.env' -prune -o \( -name 'package-lock.json' -o -name 'package.json' \) -prune -o -type f -print | xargs wc -l  