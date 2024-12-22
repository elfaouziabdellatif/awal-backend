const express = require('express');
const http = require("http"); // Required for creating the HTTP server
const { Server } = require("socket.io"); // Import Socket.IO
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const routes = require('./server/routes/Routes');  // Import routes

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with the server
const io = new Server(server, {
  cors: {
    origin: "*", // Allow requests from any origin
    methods: ["GET", "POST"], // Specify allowed methods
  },
  pingTimeout: 10000, // Disconnect if no response within 10 seconds
  pingInterval: 5000, // Send a ping every 5 seconds
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.log("MongoDB connection error:", err));

// Routes
app.use('/api', routes);  // API route for message-related tasks

// Socket.IO connection handling
const onlineUsers = new Map(); // Maps socketId to userId and username

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user login
  socket.on("userLoggedIn", (data) => {
    onlineUsers.set(socket.id, { userId: data.userId, username: data.username });
    console.log(`${data.username} logged in. Online users:`, Array.from(onlineUsers.values()));

    // Broadcast updated online users list to all clients
    io.emit("updateOnlineUsers", Array.from(onlineUsers.values()));
  });

  // Handle sending a message
  socket.on("sendMessage", ({ senderId, receiverId, content }) => {
    // Find the receiver's socketId from the onlineUsers map
    let receiverSocketId = null;
    for (let [socketId, user] of onlineUsers.entries()) {
      if (user.userId === receiverId) {
        receiverSocketId = socketId;
        break;
      }
    }

    if (receiverSocketId) {
      console.log(`Sending message from ${senderId} to ${receiverId}: ${content}`);
      io.to(receiverSocketId).emit("receiveMessage", {
        senderId,
        receiverId,
        content,
      });
    } else {
      console.log(`Recipient with userId ${receiverId} is not online.`);
    }
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    const disconnectedUser = onlineUsers.get(socket.id);
    if (disconnectedUser) {
      console.log(`${disconnectedUser.username} disconnected.`);
    }
    onlineUsers.delete(socket.id);

    // Broadcast updated online users list to all clients
    io.emit("updateOnlineUsers", Array.from(onlineUsers.values()));
  });
});


// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
