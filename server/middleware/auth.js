const jwt = require('jsonwebtoken');
const User = require('../models/User');
const localDB = require('../utils/localDB');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Try Local DB (for Demo/Local Mode)
    let user = localDB.findById('users', decoded.id);

    if (!user) {
      // Try MongoDB (for Production/Real Mode)
      try {
        user = await User.findById(decoded.id).select('-password');
      } catch (e) {
        // Mongo might be down, ignore and keep user as null
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    if (user.isActive === false) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    req.user = { ...user, id: user._id };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;
