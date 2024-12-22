const Message = require('../models/Message');

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { sender, recipient, message } = req.body;

    if (!sender || !recipient || !message) {
      return res.status(400).json({ msg: 'senderId, receiverId, and message are required.' });
    }

    const newMessage = new Message({
      sender,
      recipient,
      message,
    });

    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ msg: 'Error sending message', error });
  }
};

// Get messages between two users
// Get paginated messages between two users
const getMessages = async (req, res) => {
  try {
    const { sender, recipient, page = 1, limit = 20 } = req.query;

    if (!sender || !recipient) {
      return res.status(400).json({ msg: 'Sender and recipient are required.' });
    }

    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { sender, recipient },
        { sender: recipient, recipient: sender },
      ],
    })
      .sort({ timestamp: -1 }) // Newest messages first
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json(messages.reverse()); // Reverse to show oldest first in the chat
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ msg: 'Error fetching messages', error });
  }
};


// Get unread message count
const getUnreadMessagesCount = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ msg: 'User ID is required.' });
    }

    const unreadCount = await Message.countDocuments({
      recipient: userId,
      read: false,
    });

    res.status(200).json({ unreadCount });
  } catch (error) {
    console.error('Error fetching unread message count:', error);
    res.status(500).json({ msg: 'Error fetching unread message count', error });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getUnreadMessagesCount,
};
