const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cron = require('node-cron');
const Student = require('./Model/Student');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const logStudentTable = async () => {
  try {
    const students = await Student.find().sort({ createdAt: -1 }).lean();
    const rows = students.map(student => ({
      Name: student.name,
      USN: student.usn,
      Registered: student.createdAt ? new Date(student.createdAt).toLocaleString() : '-',
      'Logged In': student.isLoggedIn ? 'Yes' : 'No',
      'Last Login': student.lastLoginAt ? new Date(student.lastLoginAt).toLocaleString() : '-',
      'Last Logout': student.lastLogoutAt ? new Date(student.lastLogoutAt).toLocaleString() : '-'
    }));

    if (process.stdout.isTTY) {
      console.clear();
    }
    console.log('Registered students and login activity (refreshes on login, logout, or registration):');
    console.table(rows);
  } catch (error) {
    console.error('Could not print student activity table:', error);
  }
};
app.set('logStudentTable', logStudentTable);

// Mongo connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/myapp24';
mongoose.connect(mongoUri)
  .then(async () => {
    console.log('MongoDB connected');
    await logStudentTable();
  })
  .catch(err => console.error('Mongo error', err));

// Socket.io basic wiring
io.on('connection', (socket) => {
  console.log('Client connected');
});
app.set('io', io);

// Routers
const studentRouter = require('./Controller/StudentController');
const teacherRouter = require('./Controller/TeacherController');
const announcementRouter = require('./Controller/AnnouncementController');
app.use('/student', studentRouter);
app.use('/teacher', teacherRouter);
app.use('/announcement', announcementRouter);

// Cron: purge announcements older than 4 days daily at 01:00
const Announcement = require('./Model/Announcement');
cron.schedule('0 1 * * *', async () => {
  const cutoff = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);
  await Announcement.deleteMany({ createdAt: { $lt: cutoff } });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
