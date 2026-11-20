const express = require('express'); 
const Student = require('../Model/Student'); 
const Announcement = require('../Model/Announcement'); 
const router = express.Router(); 
router.post('/login', async (req, res) => { 
const { loginID, password } = req.body; 
if (loginID === 'sandesh' && password === 'Sandesh@789') { 
    return res.json({ message: 'Login success' }); 
  } 
  return res.status(401).json({ message: 'Invalid credentials' }); 
}); 
 
router.post('/:id/approve', async (req, res) => { 
  try { 
    const student = await Student.findByIdAndUpdate(req.params.id, { status: 'approved', 
rejectionReason: undefined }, { new: true }); 
    if (!student) return res.status(404).json({ message: 'Student not found' }); 
    req.app.get('io').emit('student_approved', { id: student._id }); 
    res.json(student); 
  } catch (e) { 
    res.status(500).json({ message: 'Error approving student' }); 
  } 
}); 
 
router.post('/:id/reject', async (req, res) => { 
  try { 
    const { reason } = req.body; 
    const student = await Student.findByIdAndUpdate(req.params.id, { status: 'rejected', 
rejectionReason: reason || 'No reason provided' }, { new: true }); 
    if (!student) return res.status(404).json({ message: 'Student not found' }); 
    req.app.get('io').emit('student_rejected', { id: student._id }); 
    res.json(student); 
  } catch (e) { 
    res.status(500).json({ message: 'Error rejecting student' }); 
  } 
}); 
 
router.get('/approved', async (req, res) => { 
  try { 
    const students = await Student.find({ status: 'approved' }).sort({ createdAt: -1 }); 
    res.json(students); 
  } catch (e) { 
    res.status(500).json({ message: 'Error fetching approved students' }); 
  } 
}); 
 
router.get('/fake-attempts', async (req, res) => { 
  try { 
    const students = await Student.find({ certificateStatus: 'fake' }).sort({ createdAt: -1 }); 
    res.json(students); 
  } catch (e) { 
    res.status(500).json({ message: 'Error fetching fake attempts' }); 
  } 
}); 
 
router.post('/announcement', async (req, res) => { 
  try { 
    const { message, important } = req.body;
    const a = await Announcement.create({ message, important: important === true });
    req.app.get('io').emit('announcement_new', a); 
    res.json(a); 
  } catch (e) { 
    res.status(500).json({ message: 'Error creating announcement' }); 
  } 
}); 

router.patch('/announcement/:id/important', async (req, res) => {
  try {
    if (typeof req.body.important !== 'boolean') {
      return res.status(400).json({ message: 'Important status must be a boolean' });
    }
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { important: req.body.important },
      { new: true, runValidators: true }
    );
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
    req.app.get('io').emit('announcement_updated', announcement);
    res.json(announcement);
  } catch (e) {
    res.status(500).json({ message: 'Error updating announcement' });
  }
});

router.delete('/announcement/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
    req.app.get('io').emit('announcement_deleted', { id: announcement._id });
    res.json({ message: 'Announcement deleted' });
  } catch (e) {
    res.status(500).json({ message: 'Error deleting announcement' });
  }
});
module.exports = router;