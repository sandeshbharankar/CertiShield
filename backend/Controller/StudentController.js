const express = require('express'); 
const multer = require('multer'); 
const path = require('path'); 
const fs = require('fs'); 
const mongoose = require('mongoose'); 
const Student = require('../Model/Student'); 
const { extractQrJson, extractQrFromImage } = require('../utils/pdfQr'); 
const router = express.Router(); 
// Configure storage for ID cards 
const idStorage = multer.diskStorage({ 
destination: (req, file, cb) => { 
const dir = path.join(__dirname, '..', 'uploads', 'idcards'); 
fs.mkdirSync(dir, { recursive: true }); 
cb(null, dir); 
}, 


filename: (req, file, cb) => { 
const ext = path.extname(file.originalname); 
cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`); 
}
}); 
// Configure storage for certificates 
const certStorage = multer.diskStorage({ 
destination: (req, file, cb) => { 
    const dir = path.join(__dirname, '..', 'uploads', 'certificates'); 
    fs.mkdirSync(dir, { recursive: true }); 
    cb(null, dir); 
  }, 
  filename: (req, file, cb) => { 
    const ext = path.extname(file.originalname || '.pdf') || '.pdf'; 
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`); 
  } 
}); 
 
const uploadID = multer({ storage: idStorage }); 
 
const uploadPDF = multer({ 
  storage: certStorage, 
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit 
  fileFilter: (req, file, cb) => { 
    const mime = (file.mimetype || '').toLowerCase(); 
    const ext = (path.extname(file.originalname || '') || '').toLowerCase(); 
    const allowedPdf = [ 
      'application/pdf', 
      'application/x-pdf', 
      'application/acrobat', 
      'applications/pdf', 
      'text/pdf' 
    ]; 
    const isPdf = allowedPdf.includes(mime) || mime.includes('pdf') || ext === '.pdf'; 
    const isImage = mime.startsWith('image/') || ['.jpg', '.jpeg', '.png', '.gif', '.bmp', 
'.webp'].includes(ext); 
     
    if (isPdf || isImage) { 
      return cb(null, true); 
    } 
     
    return cb(new Error('Only PDF or image (JPG/PNG/GIF/BMP/WEBP) files are allowed')); 
  } 
}); 
 
// ---------------- REGISTER ---------------- 
router.post('/register', uploadID.single('idCardImage'), async (req, res) => { 
  try { 
    const { name, usn } = req.body; 
 
    // Validate input 
    if (!name || !usn) { 
      return res.status(400).json({ message: 'Name and USN are required' }); 
    } 
 
    const existing = await Student.findOne({ usn }); 
    if (existing) return res.status(400).json({ message: 'USN already registered' }); 
 
    const student = await Student.create({ 
      name, 
      usn, 
      idCardImage: req.file ? `/uploads/idcards/${req.file.filename}` : undefined, 
      status: 'pending' 
    }); 
    await req.app.get('logStudentTable')?.();
 
    req.app.get('io').emit('student_registered', { 
      id: student._id, 
      name: student.name, 
      usn: student.usn 
    }); 
 
    res.json({  
      message: 'Registration successful, awaiting admin approval',  
      student: { 
        _id: student._id, 
        name: student.name, 
        usn: student.usn, 
        status: student.status 
      } 
    }); 
  } catch (e) { 
    console.error('Registration error:', e); 
    res.status(500).json({ message: 'Error registering student', error: e.message }); 
  } 
}); 
 
// ---------------- LOGIN ---------------- 
router.post('/login', async (req, res) => { 
  try { 
    const { name, usn } = req.body; 
 
    // Validate input 
    if (!name || !usn) { 
      return res.status(400).json({ message: 'Name and USN are required' }); 
    } 
 
    const student = await Student.findOne({ name, usn }); 
    if (!student) return res.status(404).json({ message: 'Student not found' }); 
 
    if (student.status === 'pending') 
      return res.status(403).json({  
        status: 'pending',  
        message: 'Your registration is pending admin approval'  
      }); 
 
    if (student.status === 'rejected') 
      return res.status(403).json({ 
        status: 'rejected', 
        reason: student.rejectionReason || 'Registration rejected by admin' 
      }); 

    student.isLoggedIn = true;
    student.lastLoginAt = new Date();
    await student.save();
    await req.app.get('logStudentTable')?.();
 
    res.json({  
      status: 'approved',  
      student: { 
        _id: student._id, 
        name: student.name, 
        usn: student.usn, 
        status: student.status, 
        certificateStatus: student.certificateStatus 
      } 
    }); 
  } catch (e) { 
    console.error('Login error:', e); 
    res.status(500).json({ message: 'Login error', error: e.message }); 
  } 
}); 

// ---------------- LOGOUT ----------------
router.post('/logout', async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({ message: 'Valid student ID is required' });
    }

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    student.isLoggedIn = false;
    student.lastLogoutAt = new Date();
    await student.save();
    await req.app.get('logStudentTable')?.();

    res.json({ message: 'Logged out successfully' });
  } catch (e) {
    console.error('Logout error:', e);
    res.status(500).json({ message: 'Logout error' });
  }
});
// ---------------- LIST ----------------
router.get('/list', async (req, res) => { 
  try { 
    const students = await Student.find().sort({ createdAt: -1 }); 
    res.json(students); 
  } catch (e) { 
    console.error('List error:', e); 
    res.status(500).json({ message: 'Error fetching students' }); 
  } 
}); 
 
// ---------------- CERTIFICATE UPLOAD ---------------- 
router.post('/:id/uploadCertificate', (req, res) => { 
  uploadPDF.single('certificate')(req, res, async (err) => { 
    if (err) { 
      console.error('Upload error:', err); 
      return res.status(400).json({  
        message: err.message || 'Invalid file upload', 
        details: 'File might be too large or wrong format' 
      }); 
    } 
 
    try { 
      if (!mongoose.isValidObjectId(req.params.id)) { 
        return res.status(400).json({ message: 'Invalid student ID format' }); 
      } 
 
      const student = await Student.findById(req.params.id); 
      if (!student) return res.status(404).json({ message: 'Student not found' }); 
 
      if (!req.file) return res.status(400).json({ message: 'Certificate file is required' }); 
 
      console.log('[CERT] Upload received', { 
        studentId: req.params.id, 
        name: student.name, 
        usn: student.usn, 
        mimetype: req.file.mimetype, 
        originalname: req.file.originalname, 
        path: req.file.path, 
        size: req.file.size 
      }); 
 
      let qrJson = null; 
      const mime = (req.file.mimetype || '').toLowerCase(); 
       
      if (mime.startsWith('image/')) { 
        console.log('[CERT] Processing as IMAGE file'); 
        qrJson = await extractQrFromImage(req.file.path); 
      } else { 
        console.log('[CERT] Processing as PDF file'); 
        const buffer = fs.readFileSync(req.file.path); 
        qrJson = await extractQrJson(buffer); 
      } 
 
      console.log('[CERT] QR extraction result:', { 
        success: !!qrJson, 
        type: qrJson ? typeof qrJson : 'null', 
        hasIssuedTo: qrJson && qrJson.issuedTo ? true : false, 
        issuedTo: qrJson && qrJson.issuedTo, 
        isRawText: qrJson && qrJson.raw ? true : false, 
        rawPreview: qrJson && qrJson.raw ? qrJson.raw.substring(0, 100) : 'N/A' 
      }); 
 
      let status = 'fake'; 
      let note = ''; 
      let issuedTo = null; 
 
      // Extract issuedTo from QR result 
      if (qrJson) { 
        if (qrJson.issuedTo) { 
          issuedTo = qrJson.issuedTo; 
        } else if (qrJson.raw && typeof qrJson.raw === 'string') { 
          // Try to extract name from raw text 
          const nameMatch = qrJson.raw.match(/issuedTo[:\s]+([^\n\r,;]+)/i) ||  
                           qrJson.raw.match(/name[:\s]+([^\n\r,;]+)/i) || 
                           qrJson.raw.match(/student[:\s]+([^\n\r,;]+)/i) || 
                           qrJson.raw.match(/to[:\s]+([^\n\r,;]+)/i); 
           
          if (nameMatch && nameMatch[1]) { 
            issuedTo = nameMatch[1].trim(); 
            console.log('[CERT] Extracted issuedTo from raw text:', issuedTo); 
          } 
        } 
      } 
 
      // Validation logic 
      if (issuedTo && student.name) { 
        const studentNameNormalized = student.name.toString().trim().toLowerCase(); 
        const issuedToNormalized = issuedTo.toString().trim().toLowerCase(); 
         
        console.log('[CERT] Name comparison:', { 
          studentName: studentNameNormalized, 
          issuedTo: issuedToNormalized, 
          match: studentNameNormalized === issuedToNormalized 
        }); 
         
        if (studentNameNormalized === issuedToNormalized) { 
          status = 'valid'; 
          note = 'Certificate verified successfully - Name matches QR code data'; 
        } else { 
          // Check for partial match (e.g., "Ryan Tom" vs "Ryan Tom Ryan Tom") 
          if (issuedToNormalized.includes(studentNameNormalized) ||  
              studentNameNormalized.includes(issuedToNormalized)) { 
            status = 'valid'; 
            note = 'Certificate verified - Name partially matches QR code data'; 
          } else { 
            note = `QR code issued to "${issuedTo}" doesn't match student name 
"${student.name}"`; 
          } 
        } 
      } else if (qrJson && qrJson.isUrl) { 
        // Check if URL is from trusted domain 
        const trustedDomains = [ 
          'onwingspan.com', 
          'infosys.com', 
          'springboard.com', 
          'verify.', 
          'credential.', 
          'certificate.' 
        ]; 
         
        const url = qrJson.raw.toLowerCase(); 
        const isTrusted = trustedDomains.some(domain => url.includes(domain)); 
         
        if (isTrusted) { 
          status = 'valid'; 
          note = 'Certificate verified - Contains trusted verification URL'; 
        } else { 
          note = 'QR contains URL but not from trusted source'; 
        } 
      } else if (!qrJson) { 
        note = 'No QR code found in the uploaded file'; 
      } else { 
        note = 'QR code found but could not extract name information'; 
      } 
 
      // Update student record 
      student.certificateStatus = status; 
      student.certificateData = qrJson || null; 
      student.certificateFile = `/uploads/certificates/${req.file.filename}`; 
      student.certificateUploadedAt = new Date(); 
       
      await student.save(); 
 
      // Emit socket event 
      req.app.get('io').emit('certificate_updated', { 
        id: student._id, 
        name: student.name, 
        usn: student.usn, 
        status: status, 
        certificateData: qrJson || null, 
        note: note 
      }); 
 
      console.log('[CERT] Final decision:', {  
        status,  
        note, 
        studentName: student.name, 
        issuedTo: issuedTo 
      }); 
 
      res.json({ 
        message: note || 'Certificate processed', 
        status: status, 
        certificateData: qrJson || null, 
        issuedTo: issuedTo, 
        studentName: student.name 
      }); 
 
    } catch (e) { 
      console.error('Certificate upload error:', e); 
      res.status(500).json({  
        message: 'Error processing certificate',  
        error: e.message, 
        details: 'Please try again with a clearer image' 
      }); 
    } 
  }); 
}); 
 
// ---------------- GET STUDENT BY ID ---------------- 
router.get('/:id', async (req, res) => { 
  try { 
    if (!mongoose.isValidObjectId(req.params.id)) { 
      return res.status(400).json({ message: 'Invalid student ID' }); 
    } 
 
    const student = await Student.findById(req.params.id); 
    if (!student) return res.status(404).json({ message: 'Student not found' }); 
res.json(student); 
} catch (e) { 
console.error('Get student error:', e); 
res.status(500).json({ message: 'Error fetching student' }); 
} 
}); 
module.exports = router;