require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const { connectDB, disconnectDB } = require('./db');
const Course = require('./models/Course');
const CartItem = require('./models/CartItem');
const authRouter = require('./routes/auth');
const STARTER_COURSES = require('./data/courses');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'comfort-learning-dev-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
}));

app.use('/api/auth', authRouter);

app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: 1 });
    res.json(courses);
  } catch (err) {
    console.error('GET /api/courses failed:', err);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

app.get('/api/cart', async (req, res) => {
  try {
    const sessionId = req.sessionID;
    const items = await CartItem.find({ sessionId }).populate('course').sort({ createdAt: 1 });
    res.json(items.filter(i => i.course));
  } catch (err) {
    console.error('GET /api/cart failed:', err);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

app.post('/api/cart', async (req, res) => {
  try {
    const sessionId = req.sessionID;
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ error: 'courseId is required' });

    const exists = await Course.exists({ _id: courseId });
    if (!exists) return res.status(404).json({ error: 'Course not found' });

    await CartItem.findOneAndUpdate(
      { sessionId, course: courseId },
      { $inc: { quantity: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json({ message: 'Added to cart' });
  } catch (err) {
    console.error('POST /api/cart failed:', err);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

app.put('/api/cart/:courseId', async (req, res) => {
  try {
    const sessionId = req.sessionID;
    const { courseId } = req.params;
    const delta = Number(req.body.delta);
    if (![1, -1].includes(delta)) {
      return res.status(400).json({ error: 'delta must be 1 or -1' });
    }

    const item = await CartItem.findOne({ sessionId, course: courseId });
    if (!item) return res.status(404).json({ error: 'Item not in cart' });

    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      await CartItem.deleteOne({ _id: item._id });
      return res.json({ message: 'Item removed', quantity: 0 });
    }

    item.quantity = newQty;
    await item.save();
    res.json({ message: 'Quantity updated', quantity: newQty });
  } catch (err) {
    console.error('PUT /api/cart/:courseId failed:', err);
    res.status(500).json({ error: 'Failed to update quantity' });
  }
});

app.delete('/api/cart/:courseId', async (req, res) => {
  try {
    const sessionId = req.sessionID;
    const { courseId } = req.params;
    await CartItem.deleteOne({ sessionId, course: courseId });
    res.json({ message: 'Item removed' });
  } catch (err) {
    console.error('DELETE /api/cart/:courseId failed:', err);
    res.status(500).json({ error: 'Failed to remove item' });
  }
});

app.delete('/api/cart', async (req, res) => {
  try {
    const sessionId = req.sessionID;
    await CartItem.deleteMany({ sessionId });
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    console.error('DELETE /api/cart failed:', err);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

async function ensureCoursesSeeded() {
  const count = await Course.countDocuments();
  if (count === 0) {
    await Course.insertMany(STARTER_COURSES);
    console.log(`Seeded ${STARTER_COURSES.length} starter courses.`);
  }
}

let server;

connectDB()
  .then(async () => {
    await ensureCoursesSeeded();
    server = app.listen(PORT, () => {
      console.log(`ComfortLearning server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to the database:', err);
    process.exit(1);
  });

process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  if (server) server.close();
  await disconnectDB();
  process.exit(0);
});
