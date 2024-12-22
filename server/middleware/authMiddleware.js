const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Extract token from the Authorization header
  const token = req.header('Authorization') && req.header('Authorization').split(' ')[1]; // Get the token part of the Bearer
  
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify the token using the JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // Add user info to request object
    next();
  } catch (error) {
    return res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
