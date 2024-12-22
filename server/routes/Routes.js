const express = require('express');
const {
  registerUser,
  loginUser
} = require('../controllers/authController');
const {
  getUsers
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const {
  sendMessage,
  getMessages,
  getUnreadMessagesCount
} = require('../controllers/messageController');

const router = express.Router();

// Auth routes
router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);

// User routes
router.get('/users', authMiddleware, getUsers);

// Message routes
router.post('/send', authMiddleware, sendMessage);
router.get('/messages', authMiddleware, getMessages);
router.get('/unreadMessages', authMiddleware, getUnreadMessagesCount);

module.exports = router;
