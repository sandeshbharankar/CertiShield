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
let studentTablePrinted = false;
const clientOrigin = (process.env.CLIENT_ORIGIN || 'http://localhost:3000').replace(/\/+$/, '');
const io = new Server(server, {
  cors: {
    origin: clientOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.type('html').send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Server Status</title>
  <style>
    * { box-sizing: border-box; }
    body {
      display: grid;
      min-height: 100vh;
      margin: 0;
      place-items: center;
      background: linear-gradient(135deg, #0f172a, #1e293b, #334155);
      color: #f1f5f9;
      font-family: system-ui, sans-serif;
    }
    main {
      width: min(90%, 520px);
      padding: 40px;
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 20px;
      background: rgba(15,23,42,.72);
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,.25);
    }
    .status { color: #86efac; font-weight: 700; }
    p { color: #cbd5e1; line-height: 1.6; }
  </style>
</head>
<body>
  <main>
    <h1>Welcome to the Server</h1>
    <p class="status">● Server is running</p>
    <p>The backend is up and ready to receive requests.</p>
  </main>
</body>
</html>`);
});

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
    } else if (studentTablePrinted) {
      return;
    }
    console.log('Registered students and login activity (refreshes on login, logout, or registration):');
    console.table(rows);
    studentTablePrinted = true;
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
server.listen(PORT, () => {
  const serverUrl = `http://localhost:${server.address().port}`;
  console.log(`Server is connected and running at ${serverUrl}`);
});
