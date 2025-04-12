const User = require('../models/user.model');
const Joi = require('joi');
const jwt = require('jsonwebtoken');

// In-memory store for refresh tokens (replace with DB in production)
const refreshTokens = new Set();

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Helper to generate refresh token
function generateRefreshToken(userId) {
  const token = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || 'refresh_secret',
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
  refreshTokens.add(token);
  return token;
}

// Register user
exports.register = async (req, res, next) => {
  try {
    // Validate request data
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    // Generate tokens
    const token = User.getSignedToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.status(201).json({ token, refreshToken });
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    // Validate request data
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await User.matchPassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const token = User.getSignedToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.status(200).json({ token, refreshToken });
  } catch (error) {
    next(error);
  }
};

// Refresh token endpoint
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken || !refreshTokens.has(refreshToken)) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    // Verify refresh token
    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'refresh_secret',
      (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Invalid refresh token' });
        const token = User.getSignedToken(decoded.id);
        res.status(200).json({ token });
      }
    );
  } catch (error) {
    next(error);
  }
};

// Logout endpoint to invalidate refresh token
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken && refreshTokens.has(refreshToken)) {
      refreshTokens.delete(refreshToken);
    }
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register: exports.register,
  login: exports.login,
  refreshToken: exports.refreshToken,
  logout: exports.logout,
  // Export for testing
  refreshTokens
};
