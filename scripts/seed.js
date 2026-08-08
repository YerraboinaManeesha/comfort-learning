require('dotenv').config();
const { connectDB, disconnectDB } = require('../db');
const Course = require('../models/Course');
const STARTER_COURSES = require('../data/courses');

async function seed() {
  await connectDB();
  await Course.deleteMany({});
  await Course.insertMany(STARTER_COURSES);
  console.log(`Seeded ${STARTER_COURSES.length} courses.`);
  await disconnectDB();
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
