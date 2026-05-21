const jwt = require('jsonwebtoken');
const { readDatabase, findById } = require('../store');

const OWNER_USERNAME = 'huseyn';

const isOwnerUser = (user) => user?.username?.trim().toLowerCase() === OWNER_USERNAME;

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const db = readDatabase();
    const user = findById(db, 'users', decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (isOwnerUser(user) && !user.isAdmin) {
      user.isAdmin = true;
    }

    req.userId = decoded.userId;
    req.user = {
      ...decoded,
      username: user.username,
      isAdmin: Boolean(user.isAdmin || isOwnerUser(user))
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware, isOwnerUser };
