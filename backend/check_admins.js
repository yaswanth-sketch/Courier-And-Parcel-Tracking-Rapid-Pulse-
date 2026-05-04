const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const checkAdmins = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const admins = await User.find({ role: 'admin' });
  console.log('--- ADMIN ACCOUNTS ---');
  admins.forEach(a => console.log(`- ${a.email} (${a.name})`));
  console.log(`Total admins: ${admins.length}`);
  await mongoose.disconnect();
};

checkAdmins();
