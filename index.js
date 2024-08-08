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

// Create HTTP server
const server = http.createServer(app);

// Create Socket.io instance
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  }
});

// Middleware
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
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


app.use('/user', userRoutes);
app.use('/donation', donationRoutes);
app.use('/notification', notificationRoutes );
app.use('/bloodBank', bloodBankRoutes );




app.get('/', (req, res) => {
    res.send('Red Love is Running');
});

// Start the server
server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});



// check total code line . 
// find . -path ./node_modules -prune -o -path ./.git -prune -o -name '.env' -prune -o \( -name 'package-lock.json' -o -name 'package.json' \) -prune -o -type f -print | xargs wc -l  