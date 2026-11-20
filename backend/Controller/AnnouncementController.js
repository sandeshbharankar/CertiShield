const express = require('express');
const Announcement = require('../Model/Announcement');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const anns = await Announcement.find().sort({ createdAt: -1 });
    res.json(anns);
  } catch (e) {
    res.status(500).json({ message: 'Error fetching announcements' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { message, important } = req.body;
    const a = await Announcement.create({ message, important: important === true });
    res.json(a);
  } catch (e) {
    res.status(500).json({ message: 'Error creating announcement' });
  }
});

module.exports = router;
