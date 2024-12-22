const User = require('../models/User');

// Controller to fetch all users (excluding the logged-in user)
const getUsers = async (req, res) => {
  try {
    const { excludeId } = req.query; // Retrieve excludeId from the query parameters
    const users = await User.find({ _id: { $ne: excludeId } }).select('username'); // Exclude the user ID
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error fetching users' });
  }
};


module.exports = {
  getUsers,
};
