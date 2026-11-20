const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  teacherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Teacher', 
    required: true 
  },
  teacherName: { 
    type: String, 
    required: true 
  },
  code: { 
    type: String, 
    unique: true, 
    required: true 
  },
  description: { 
    type: String, 
    default: '' 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  studentCount: { 
    type: Number, 
    default: 0 
  },
  approvedStudentCount: { 
    type: Number, 
    default: 0 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

classroomSchema.index({ teacherId: 1, name: 1 }, { unique: true });
classroomSchema.index({ code: 1 }, { unique: true });

module.exports = mongoose.model('Classroom', classroomSchema);