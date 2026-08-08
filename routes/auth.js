const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const LoginHistory = require('../models/LoginHistory');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const SALT_ROUNDS = 10;

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are all required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'An account with that email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash });

    req.session.userId = user._id;

    res.status(201).json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    console.error('POST /api/auth/register failed:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const ipAddress = req.ip;
  const userAgent = req.get('User-Agent') || '';

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      await LoginHistory.create({ user: null, email: email.toLowerCase(), success: false, ipAddress, userAgent });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);

    await LoginHistory.create({
      user: user._id,
      email: user.email,
      success: match,
      ipAddress,
      userAgent,
    });

    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    req.session.userId = user._id;
    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    console.error('POST /api/auth/login failed:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('POST /api/auth/logout failed:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

router.get('/me', async (req, res) => {
  if (!req.session.userId) return res.json({ user: null });
  try {
    const user = await User.findById(req.session.userId).select('name email createdAt');
    if (!user) return res.json({ user: null });
    res.json({ user });
  } catch (err) {
    console.error('GET /api/auth/me failed:', err);
    res.status(500).json({ error: 'Failed to fetch current user' });
  }
});

router.get('/history', requireAuth, async (req, res) => {
  try {
    const history = await LoginHistory.find({ user: req.session.userId })
      .sort({ loginAt: -1 })
      .limit(20);
    res.json(history);
  } catch (err) {
    console.error('GET /api/auth/history failed:', err);
    res.status(500).json({ error: 'Failed to fetch login history' });
  }
});

module.exports = router;
