const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register a new user
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  // Check if all fields are provided
  if (!username || !email || !password) {
    return res.status(400).json({ msg: 'Please provide all fields' });
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ msg: 'User already exists' });
  }

  // Hash the password before saving
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({ username, email, password: hashedPassword });
  await newUser.save();

  // Create and sign JWT token
  const payload = {
    user: {
      id: newUser._id,
    },
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.status(201).json({ token , user: { id: newUser._id, username: newUser.username, email: newUser.email }, msg: 'User created successfully' });
};

// Login an existing user
// Login an existing user
const loginUser = async (req, res) => {
    console.log("loginUser function called");

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: 'Please provide both email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user._id,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '72h' });

    

    // Log response handling
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      
    });

    
};

  
module.exports = { registerUser, loginUser };
