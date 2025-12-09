const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cron = require('node-cron');

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

// Mongo connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/myapp24';
mongoose.connect(mongoUri).then(() => console.log('MongoDB connected')).catch(err => console.error('Mongo error', err));

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
