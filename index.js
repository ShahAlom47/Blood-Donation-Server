const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const port = process.env.PORT || 3000;
require("dotenv").config();
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { connect } = require("./utils/DB-connect");

// Stripe payment
const stripe = require("stripe")(process.env.STRIPE_KEY);
app.use(express.static("public"));
const cron = require("node-cron");
const sendDonationRemainderEmail = require("./utils/SendEmail/sendDonationRemainderEmail");
const sendEmail = require("./utils/SendEmail/sendEmail");

const server = http.createServer(app);

//  Socket.IO CORS
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:3001",
      "http://localhost:5174",
      "https://blood-donation-client-zeta.vercel.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3001",
      "https://blood-donation-client-zeta.vercel.app",
    ],
    credentials: true, // Add this line to allow credentials
  })
);

app.use(cookieParser());

// Socket handler
const socketHandler = require("./ChatApp/ChatApp");
socketHandler(io);

// Monthly donation reminder

// 0: মিনিটের জন্য (০ মিনিট)-- 0: ঘণ্টার জন্য (মধ্যরাত ১২টা)--  1: মাসের প্রথম দিন  --*: মাসের যেকোনো মাস -- *: সপ্তাহের যেকোনো দিন  মাসের প্রথম দিন (১ তারিখ) রাত ১২টা ০ মিনিটে চলবে
cron.schedule("0 0 1 * *", async () => {
  try {
    await sendDonationRemainderEmail();
  } catch (error) {
    console.error(error);
  }
});

// JWT related API
app.post("/jwt", async (req, res) => {
  const userInfo = req.body.userInfo;
  const token = jwt.sign({ data: userInfo }, process.env.ACCESS_TOKEN, {
    expiresIn: "1h",
  });
  res.send({ token });
});

app.post("/sendMail", async (req, res) => {
  try {
    const { mailOption } = req.body;
    const mailRes = await sendEmail(mailOption);
    res.send(mailRes);
  } catch (error) {
    console.log(error);
    res.send({ success: false, message: "mail sending fail" });
  }
});

// Routes
const userRoutes = require("./Routes/users.routes");
const donationRoutes = require("./Routes/donation.router");
const notificationRoutes = require("./Routes/notification.router");
const bloodBankRoutes = require("./Routes/bloodBank.router");
const paymentRoutes = require("./Routes/payment.router");
const moneyDonation = require("./Routes/moneyDonation.router");
const chatRoute = require("./Routes/chart.router");
const {
  getTaskCollection,
} = require("./utils/AllDB_Collections/taskCollection");
const { ObjectId } = require("mongodb");

app.use("/user", userRoutes);
app.use("/donation", donationRoutes);
app.use("/moneyDonation", moneyDonation);
app.use("/notification", notificationRoutes);
app.use("/bloodBank", bloodBankRoutes);
app.use("/payment", paymentRoutes);
app.use("/chatData", chatRoute);

// task api

// Get all tasks
const taskCollection = getTaskCollection();

app.get("/tasks", async (req, res) => {
  try {
    const tasks = await taskCollection.find().toArray();

    // Check if tasks are found
    if (!tasks || tasks.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No tasks found",
      });
    }

    res.send({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error); // Log the error for debugging
    res.status(500).send({
      success: false,
      message: "Server error, unable to fetch tasks",
      error: error.message,
    });
  }
});

// Create a new task
app.post("/tasks", async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const newTask = taskCollection.insertOne(req.body);

    res.status(201).json({
      success: true,
      message: "Task added successfully",
      data: newTask,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

// Update a task
app.patch("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    // Validate if at least one field (title or description) is provided
    if (!title && !description && !status) {
      return res.status(400).send({
        success: false,
        message:
          "At least one field (title, description, or status) is required",
      });
    }

    // Update the task in the database
    const updatedTask = await taskCollection.updateOne(
      { _id: new ObjectId(id) }, // Corrected to use proper ObjectId for query
      { $set: { title, description, status } } // Use $set to update only the fields provided
    );

    // Check if task was found and updated
    if (updatedTask.matchedCount === 0) {
      return res.status(404).send({
        success: false,
        message: "Task not found",
      });
    }

    res.send({
      success: true,
      message: "Task updated successfully",
      data: { title, description, status }, // Return the updated task data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// delate task
app.delete("/tasks/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    console.log(taskId, "ggggg");

    // 🔹 ObjectId ভ্যালিড কিনা চেক করো
    if (!ObjectId.isValid(taskId)) {
      return res
        .status(400)
        .send({ success: false, message: "Invalid task ID" });
    }

    const result = await taskCollection.deleteOne({
      _id: new ObjectId(taskId),
    });

    console.log(result);

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .send({ success: false, message: "Task not found" });
    }

    res
      .status(200)
      .send({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res
      .status(500)
      .send({ success: false, message: "Internal server error", error });
  }
});

app.get("/", (req, res) => {
  res.send("Red Love is Running");
});

// Start the server
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
