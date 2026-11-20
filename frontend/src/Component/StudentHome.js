import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
    color: '#f1f5f9',
    position: 'relative',
    overflow: 'hidden'
  },
  floatingElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    zIndex: 0,
    pointerEvents: 'none'
  },
  floatingElement: (top, left, size, delay) => ({
    position: 'absolute',
    top: `${top}%`,
    left: `${left}%`,
    width: size,
    height: size,
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0) 70%)',
    borderRadius: '50%',
    animation: `float 8s ease-in-out infinite ${delay}s`,
    filter: 'blur(2px)'
  }),
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    position: 'relative',
    zIndex: 10
  },
  header: {
    background: 'rgba(30, 41, 59, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    padding: '24px',
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
    animation: 'slideDown 0.6s ease-out'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  avatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)'
  },
  userText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  welcome: {
    fontSize: '14px',
    color: '#94a3b8'
  },
  name: {
    fontSize: '24px',
    fontWeight: 'bold',
    background: 'linear-gradient(90deg, #60a5fa 0%, #3b82f6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  logoutButton: {
    padding: '12px 24px',
    background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(239, 68, 68, 0.4)'
    }
  },
  card: {
    background: 'rgba(30, 41, 59, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px',
    animation: 'fadeIn 0.5s ease-out',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 15px 40px rgba(0, 0, 0, 0.4)'
    }
  },
  badge: (status) => ({
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: status === 'valid' 
      ? 'linear-gradient(90deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)' 
      : status === 'fake' 
        ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)'
        : 'linear-gradient(90deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)',
    color: status === 'valid' ? '#86efac' : status === 'fake' ? '#fca5a5' : '#fcd34d',
    border: `1px solid ${status === 'valid' ? 'rgba(34, 197, 94, 0.2)' : status === 'fake' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
  }),
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#f1f5f9'
  },
  announcementItem: {
    padding: '16px',
    background: 'rgba(15, 23, 42, 0.5)',
    borderRadius: '12px',
    marginBottom: '12px',
    borderLeft: '4px solid #60a5fa',
    transition: 'all 0.3s ease',
    ':hover': {
      background: 'rgba(15, 23, 42, 0.8)',
      transform: 'translateX(4px)'
    }
  },
  studentCard: {
    background: 'rgba(15, 23, 42, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '16px',
    transition: 'all 0.3s ease',
    animation: 'slideIn 0.5s ease-out forwards',
    opacity: 0,
    ':hover': {
      background: 'rgba(15, 23, 42, 0.8)',
      borderColor: 'rgba(59, 130, 246, 0.3)',
      transform: 'translateY(-4px)'
    }
  },
  uploadArea: {
    border: '2px dashed rgba(59, 130, 246, 0.3)',
    borderRadius: '16px',
    padding: '20px',
    textAlign: 'center',
    marginTop: '20px',
    transition: 'all 0.3s ease',
    background: 'rgba(15, 23, 42, 0.3)',
    ':hover': {
      borderColor: '#3b82f6',
      background: 'rgba(15, 23, 42, 0.5)'
    }
  },
  uploadButton: {
    padding: '14px 28px',
    background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: '0 auto',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)'
    },
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
      transform: 'none'
    }
  },
  fileInfo: {
    marginTop: '12px',
    fontSize: '14px',
    color: '#94a3b8'
  },
  statusMessage: {
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    fontWeight: '500',
    animation: 'slideIn 0.3s ease-out'
  },
  loadingSpinner: {
    display: 'inline-block',
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: '#3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px',
    marginTop: '20px'
  },
  glowEffect: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0) 70%)',
    borderRadius: '50%',
    filter: 'blur(60px)',
    zIndex: 1,
    pointerEvents: 'none'
  }
};

// Add global styles
const globalStyles = document.createElement('style');
globalStyles.innerHTML = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
    33% { transform: translateY(-20px) translateX(10px) scale(1.05); }
    66% { transform: translateY(10px) translateX(-10px) scale(0.95); }
  }
  
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    background: #0f172a;
    overflow-x: hidden;
  }
  
  * {
    box-sizing: border-box;
  }
  
  ::-webkit-scrollbar {
    width: 10px;
  }
  
  ::-webkit-scrollbar-track {
    background: rgba(30, 41, 59, 0.5);
  }
  
  ::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.5);
    border-radius: 5px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(59, 130, 246, 0.8);
  }
`;
document.head.appendChild(globalStyles);

export default function StudentHome() {
  const API = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
  const [student, setStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [anns, setAnns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadMsg, setUploadMsg] = useState('');
  const [uploadErr, setUploadErr] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const s = localStorage.getItem('student');
    if (s) setStudent(JSON.parse(s));
    fetchAll();
    const i = setInterval(fetchAll, 10000);
    return () => clearInterval(i);
  }, []);

  const fetchAll = async () => {
    try {
      const [{ data: stus }, { data: an }] = await Promise.all([
        axios.get(`${API}/student/list`),
        axios.get(`${API}/announcement`)
      ]);
      setStudents(stus);
      setAnns(an);
      setLoading(false);
    } catch (_) {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadErr('File size too large. Maximum size is 10MB.');
      setSelectedFile(null);
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/x-pdf'];
    const mime = file.type || '';
    const fileName = file.name || '';
    const ext = fileName.slice((fileName.lastIndexOf(".") - 1 >>> 0) + 2);
    const isImage = mime.startsWith('image/') || ['jpg', 'jpeg', 'png'].includes(ext.toLowerCase());
    const isPdf = mime.includes('pdf') || ['pdf'].includes(ext.toLowerCase());

    if (!isImage && !isPdf) {
      setUploadErr('Invalid file type. Please upload JPG, PNG, or PDF files.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setUploadErr('');
  };

  const uploadPdf = async (sid, file) => {
    if (!file) {
      setUploadErr('Please select a file first');
      return;
    }

    const form = new FormData();
    form.append('certificate', file);
    
    setUploadMsg('');
    setUploadErr('');
    setIsUploading(true);
    setUploadedFileName(file.name);
    
    try {
      const { data } = await axios.post(`${API}/student/${sid}/uploadCertificate`, form, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
      });
      
      if (data && data.status === 'valid') {
        setUploadMsg(`🎉 ${data.message || 'Certificate verified successfully!'}`);
      } else if (data && data.status === 'fake') {
        let msg = '❌ Certificate verification failed.';
        if (data.message && data.message.includes('QR/JSON not found')) {
            msg = `❌ QR code not found. Ensure it's visible in the bottom-left corner.`;
        } else if (data.certificateData && data.certificateData.issuedTo) {
            msg = `⚠️ Certificate issued to "${data.certificateData.issuedTo}" doesn't match your name.`;
        } else if (data.message) {
             msg = `${data.message}`;
        }
        setUploadMsg(msg);
      } else {
        setUploadMsg(data && data.message ? data.message : 'Upload completed.');
      }
      
      setSelectedFile(null);
      document.querySelector('input[type="file"]').value = '';
      
    } catch (e) {
      let errorMessage = 'Upload failed';
      if (e.response && e.response.data) {
        if (e.response.data.message) {
          errorMessage = e.response.data.message;
        } else if (e.response.data.error) {
          errorMessage = e.response.data.error;
        }
      } else if (e.message) {
        errorMessage = e.message;
      }
      setUploadErr(`Error: ${errorMessage}`);
    } finally {
      setIsUploading(false);
      fetchAll();
      
      setTimeout(() => {
        setUploadMsg('');
        setUploadErr('');
      }, 7000);
    }
  };

  const logout = async () => {
    localStorage.removeItem('student');
    navigate('/', { replace: true });

    try {
      await axios.post(`${API}/student/logout`, { studentId: student._id });
    } catch (error) {
      console.error('Could not record student logout:', error);
    }
  };

  const FloatingElements = () => (
    <div style={styles.floatingElements}>
      <div style={styles.floatingElement(10, 5, '120px', 0)}></div>
      <div style={styles.floatingElement(85, 90, '180px', 2)}></div>
      <div style={styles.floatingElement(30, 85, '90px', 1)}></div>
      <div style={styles.floatingElement(75, 15, '150px', 3)}></div>
      <div style={styles.floatingElement(50, 60, '100px', 4)}></div>
    </div>
  );

  if (!student) return <div style={styles.container}>Please login first.</div>;
  if (loading) return (
    <div style={{...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={styles.loadingSpinner}></div>
    </div>
  );

  const getStatusBadge = (status) => {
    const config = {
      valid: { text: '✅ Verified', color: 'bg-green-100 text-green-800 border-green-300' },
      fake: { text: '❌ Not Verified', color: 'bg-red-100 text-red-800 border-red-300' },
      pending: { text: '⏳ Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    };
    
    const { text, color } = config[status] || config.pending;
    return { text, color };
  };

  const currentStudent = students.find(s => s._id === student._id);
  

  return (
    <div style={styles.container}>
      <FloatingElements />
      <div style={{...styles.glowEffect, top: '10%', left: '5%'}}></div>
      <div style={{...styles.glowEffect, top: '70%', right: '5%'}}></div>
      
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div style={styles.userText}>
              <div style={styles.welcome}>Welcome back</div>
              <div style={styles.name}>{student.name}</div>
              <div style={{fontSize: '14px', color: '#94a3b8'}}>USN: {student.usn}</div>
            </div>
          </div>
          <button 
            style={styles.logoutButton} 
            onClick={logout}
          >
            <span>🚪</span> Logout
          </button>
        </div>

        {/* Status Messages */}
        {(uploadMsg || uploadErr || isUploading) && (
          <div style={{
            ...styles.statusMessage,
            background: uploadErr ? 'rgba(239, 68, 68, 0.1)' : 
                      uploadMsg.startsWith('🎉') ? 'rgba(34, 197, 94, 0.1)' : 
                      uploadMsg.startsWith('❌') || uploadMsg.startsWith('⚠️') ? 'rgba(245, 158, 11, 0.1)' : 
                      'rgba(59, 130, 246, 0.1)',
            border: `1px solid ${uploadErr ? 'rgba(239, 68, 68, 0.2)' : 
                      uploadMsg.startsWith('🎉') ? 'rgba(34, 197, 94, 0.2)' : 
                      uploadMsg.startsWith('❌') || uploadMsg.startsWith('⚠️') ? 'rgba(245, 158, 11, 0.2)' : 
                      'rgba(59, 130, 246, 0.2)'}`,
            color: uploadErr ? '#fca5a5' : 
                   uploadMsg.startsWith('🎉') ? '#86efac' : 
                   uploadMsg.startsWith('❌') || uploadMsg.startsWith('⚠️') ? '#fcd34d' : 
                   '#93c5fd'
          }}>
            {isUploading ? (
              <>
                <div style={styles.loadingSpinner}></div>
                Processing {uploadedFileName}...
              </>
            ) : (
              <>
                {uploadErr ? '❌' : uploadMsg.startsWith('🎉') ? '🎉' : uploadMsg.startsWith('❌') ? '❌' : uploadMsg.startsWith('⚠️') ? '⚠️' : 'ℹ️'}
                {uploadErr || uploadMsg}
              </>
            )}
          </div>
        )}

        {/* Announcements */}
        <div style={styles.card}>
          <div style={styles.sectionTitle}>
            <span>📢</span> Announcements
          </div>
          {anns.length === 0 ? (
            <div style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
              No announcements yet
            </div>
          ) : (
            anns.map((a, index) => (
              <div key={a._id} style={{
                ...styles.announcementItem,
                animationDelay: `${index * 0.1}s`,
                ...(a.important ? {
                  background: 'rgba(120, 83, 15, 0.24)',
                  borderLeft: '4px solid #f59e0b',
                  boxShadow: '0 0 0 1px rgba(245, 158, 11, 0.18)'
                } : {})
              }}>
                {a.important && (
                  <div style={{fontSize: '12px', color: '#fcd34d', fontWeight: '700', marginBottom: '8px'}}>
                    ⭐ Important announcement
                  </div>
                )}
                <div>{a.message}</div>
                {a.createdAt && (
                  <div style={{fontSize: '12px', color: '#64748b', marginTop: '8px'}}>
                    {new Date(a.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Class Students */}
        <div style={styles.card}>
          <div style={styles.sectionTitle}>
            <span>👥</span> Class Students ({students.length})
          </div>
          <div style={styles.grid}>
            {students.map((s, index) => {
              const isCurrentUser = student._id === s._id;
              const badge = getStatusBadge(s.certificateStatus);
              
              return (
                <div 
                  key={s._id} 
                  style={{
                    ...styles.studentCard,
                    animationDelay: `${index * 0.05}s`,
                    border: isCurrentUser 
                      ? '2px solid #3b82f6' 
                      : '1px solid rgba(255, 255, 255, 0.05)',
                    background: isCurrentUser 
                      ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)' 
                      : 'rgba(15, 23, 42, 0.6)',
                    boxShadow: isCurrentUser 
                      ? '0 10px 40px rgba(59, 130, 246, 0.3)' 
                      : 'none',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Add a subtle glow effect for current user */}
                  {isCurrentUser && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '100px',
                      height: '100px',
                      background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0) 70%)',
                      filter: 'blur(20px)',
                      zIndex: 0
                    }}></div>
                  )}
                  
                  <div style={{position: 'relative', zIndex: 1}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px'}}>
                      <div>
                        <div style={{
                          fontSize: '18px', 
                          fontWeight: '600', 
                          color: isCurrentUser ? '#60a5fa' : '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          {s.name}
                          {isCurrentUser && (
                            <span style={{
                              fontSize: '12px',
                              padding: '4px 10px',
                              background: 'rgba(59, 130, 246, 0.2)',
                              color: '#60a5fa',
                              borderRadius: '12px',
                              fontWeight: '600'
                            }}>
                              👤 You
                            </span>
                          )}
                        </div>
                        <div style={{fontSize: '14px', color: '#94a3b8', marginTop: '4px'}}>USN: {s.usn}</div>
                      </div>
                      <span style={styles.badge(s.certificateStatus)}>
                        {s.certificateStatus === 'valid' ? '✅ Verified' : 
                         s.certificateStatus === 'fake' ? '❌ Not Verified' : 
                         '⏳ Pending'}
                      </span>
                    </div>

                    {/* Add an upload prompt for current user */}
                    {isCurrentUser && !s.certificateFile && (
                      <div style={{
                        marginTop: '12px',
                        padding: '12px',
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px dashed rgba(59, 130, 246, 0.3)',
                        borderRadius: '10px',
                        fontSize: '14px',
                        color: '#93c5fd',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        <span>📤</span>
                        <div>
                          <strong>Upload your certificate here!</strong>
                          <div style={{fontSize: '12px', color: '#cbd5e1', marginTop: '4px'}}>
                            Click the button below to upload and verify your certificate
                          </div>
                        </div>
                      </div>
                    )}

                    {s.certificateStatus === 'fake' && s.certificateData && s.certificateData.issuedTo && (
                      <div style={{fontSize: '13px', color: '#fca5a5', marginTop: '8px', padding: '8px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px'}}>
                        <strong>Issued To:</strong> {s.certificateData.issuedTo}
                      </div>
                    )}

                    {/* Upload section - ONLY show for current user */}
                    {isCurrentUser && (
                      <div style={styles.uploadArea}>
                        <input 
                          type="file" 
                          accept="image/*,application/pdf" 
                          style={{display: 'none'}} 
                          id={`file-upload-${s._id}`}
                          onChange={handleFileSelect}
                          disabled={isUploading}
                        />
                        <label 
                          htmlFor={`file-upload-${s._id}`}
                          style={{
                            ...styles.uploadButton,
                            background: isCurrentUser 
                              ? 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)' 
                              : styles.uploadButton.background
                          }}
                        >
                          <span>📁</span> Choose Certificate
                        </label>
                        
                        {selectedFile && (
                          <div style={styles.fileInfo}>
                            Selected: {selectedFile.name}
                            <button 
                              style={{
                                ...styles.uploadButton, 
                                marginTop: '12px', 
                                padding: '10px 20px',
                                background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                              }}
                              onClick={() => uploadPdf(s._id, selectedFile)}
                              disabled={isUploading}
                            >
                              {isUploading ? (
                                <>
                                  <div style={styles.loadingSpinner}></div>
                                  Uploading...
                                </>
                              ) : (
                                '📤 Upload & Verify'
                              )}
                            </button>
                          </div>
                        )}
                        
                        {!selectedFile && (
                          <div style={styles.fileInfo}>
                            Supports: JPG, PNG, PDF (Max 10MB)
                          </div>
                        )}
                      </div>
                    )}

                    {s.certificateFile && (
                      <a 
                        href={`${API}${s.certificateFile}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginTop: '12px',
                          color: '#60a5fa',
                          textDecoration: 'none',
                          fontSize: '14px'
                        }}
                      >
                        <span>👁️</span> View Certificate
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}