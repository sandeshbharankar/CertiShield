import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
const BASE_URL = API;

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
  floatingElement: (top, left, size, delay, color) => ({
    position: 'absolute',
    top: `${top}%`,
    left: `${left}%`,
    width: size,
    height: size,
    background: `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 70%)`,
    borderRadius: '50%',
    animation: `float 10s ease-in-out infinite ${delay}s`,
    filter: 'blur(3px)',
    opacity: 0.1
  }),
  content: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '20px',
    position: 'relative',
    zIndex: 10
  },
  header: {
    background: 'rgba(30, 41, 59, 0.8)',
    backdropFilter: 'blur(15px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    padding: '24px',
    marginBottom: '30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 15px 50px rgba(0, 0, 0, 0.4)',
    animation: 'slideDown 0.6s ease-out'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  headerIcon: {
    width: '70px',
    height: '70px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    color: '#1e293b',
    boxShadow: '0 8px 30px rgba(245, 158, 11, 0.5)'
  },
  headerText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  headerTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  headerSubtitle: {
    fontSize: '14px',
    color: '#94a3b8'
  },
  logoutButton: {
    padding: '14px 28px',
    background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: '0 12px 30px rgba(239, 68, 68, 0.4)'
    }
  },
  tabs: {
    display: 'flex',
    gap: '12px',
    marginBottom: '30px',
    flexWrap: 'wrap'
  },
  tab: (active) => ({
    padding: '16px 28px',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
    background: active ? 'rgba(245, 158, 11, 0.2)' : 'rgba(30, 41, 59, 0.6)',
    color: active ? '#fbbf24' : '#cbd5e1',
    fontWeight: active ? '600' : '500',
    fontSize: '15px',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minWidth: '180px',
    justifyContent: 'center',
    '&:hover': {
      transform: 'translateY(-3px)',
      background: active ? 'rgba(245, 158, 11, 0.3)' : 'rgba(30, 41, 59, 0.8)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
    }
  }),
  tabBadge: (count) => ({
    background: count > 0 ? '#ef4444' : '#64748b',
    color: 'white',
    fontSize: '12px',
    padding: '4px 10px',
    borderRadius: '20px',
    minWidth: '24px',
    textAlign: 'center'
  }),
  card: {
    background: 'rgba(30, 41, 59, 0.7)',
    backdropFilter: 'blur(15px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    padding: '30px',
    marginBottom: '25px',
    animation: 'fadeIn 0.5s ease-out',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
    }
  },
  studentCard: {
    background: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '18px',
    padding: '24px',
    marginBottom: '20px',
    transition: 'all 0.3s ease',
    animation: 'slideIn 0.4s ease-out forwards',
    opacity: 0,
    '&:hover': {
      background: 'rgba(15, 23, 42, 0.8)',
      borderColor: 'rgba(245, 158, 11, 0.3)',
      transform: 'translateY(-5px)'
    }
  },
  badge: (status) => ({
    padding: '8px 18px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: status === 'valid' 
      ? 'linear-gradient(90deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)' 
      : status === 'fake' 
        ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)'
        : 'linear-gradient(90deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)',
    color: status === 'valid' ? '#86efac' : status === 'fake' ? '#fca5a5' : '#fcd34d',
    border: `1px solid ${status === 'valid' ? 'rgba(34, 197, 94, 0.2)' : status === 'fake' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
  }),
  actionButtons: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px',
    flexWrap: 'wrap'
  },
  approveButton: {
    padding: '12px 24px',
    background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
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
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)'
    }
  },
  rejectButton: {
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
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(239, 68, 68, 0.4)'
    }
  },
  textarea: {
    width: '100%',
    minHeight: '100px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '16px',
    background: 'rgba(15, 23, 42, 0.6)',
    color: '#f1f5f9',
    fontSize: '14px',
    marginTop: '12px',
    resize: 'vertical',
    transition: 'all 0.3s ease',
    '&:focus': {
      outline: 'none',
      borderColor: '#f59e0b',
      boxShadow: '0 0 0 3px rgba(245, 158, 11, 0.1)'
    }
  },
  announcementInput: {
    width: '100%',
    padding: '18px',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(15, 23, 42, 0.6)',
    color: '#f1f5f9',
    fontSize: '15px',
    marginBottom: '16px',
    transition: 'all 0.3s ease',
    '&:focus': {
      outline: 'none',
      borderColor: '#f59e0b',
      boxShadow: '0 0 0 3px rgba(245, 158, 11, 0.1)'
    }
  },
  postButton: {
    padding: '14px 32px',
    background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '15px',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)'
    }
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '24px',
    marginTop: '20px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#64748b',
    fontSize: '16px',
    background: 'rgba(15, 23, 42, 0.3)',
    borderRadius: '16px',
    border: '2px dashed rgba(255, 255, 255, 0.05)'
  },
  statsCard: {
    background: 'rgba(15, 23, 42, 0.6)',
    borderRadius: '16px',
    padding: '20px',
    textAlign: 'center',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      borderColor: 'rgba(245, 158, 11, 0.3)'
    }
  },
  statNumber: {
    fontSize: '36px',
    fontWeight: 'bold',
    background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '8px'
  },
  statLabel: {
    fontSize: '14px',
    color: '#94a3b8'
  },
  glowEffect: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0) 70%)',
    borderRadius: '50%',
    filter: 'blur(80px)',
    zIndex: 1,
    pointerEvents: 'none'
  }
};

// Add global styles
const globalStyles = document.createElement('style');
globalStyles.innerHTML = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
    25% { transform: translateY(-20px) translateX(15px) rotate(5deg); }
    50% { transform: translateY(10px) translateX(-10px) rotate(-5deg); }
    75% { transform: translateY(-10px) translateX(-15px) rotate(3deg); }
  }
  
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-40px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
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
    width: 12px;
  }
  
  ::-webkit-scrollbar-track {
    background: rgba(30, 41, 59, 0.5);
  }
  
  ::-webkit-scrollbar-thumb {
    background: rgba(245, 158, 11, 0.5);
    border-radius: 6px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(245, 158, 11, 0.8);
  }
`;
document.head.appendChild(globalStyles);

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('requests');
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [fake, setFake] = useState([]);
  const [anns, setAnns] = useState([]);
  const [message, setMessage] = useState('');
  const [reasons, setReasons] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    try {
      const [all, appr, fak, an] = await Promise.all([
        axios.get(`${API}/student/list`),
        axios.get(`${API}/teacher/approved`),
        axios.get(`${API}/teacher/fake-attempts`),
        axios.get(`${API}/announcement`)
      ]);
      setPending(all.data.filter(s => s.status === 'pending'));
      setApproved(appr.data);
      setFake(fak.data);
      setAnns(an.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    load(); 
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const logout = () => {
    localStorage.removeItem('teacher');
    navigate('/teacher');
  };

  const approve = async (id) => { 
    await axios.post(`${API}/teacher/${id}/approve`); 
    load(); 
  };
  
  const reject = async (id) => { 
    await axios.post(`${API}/teacher/${id}/reject`, { reason: reasons[id] || 'Not specified' }); 
    load(); 
  };
  
  const postAnn = async () => { 
    if (!message.trim()) return; 
    await axios.post(`${API}/teacher/announcement`, { message }); 
    setMessage(''); 
    load(); 
  };

  const FloatingElements = () => (
    <div style={styles.floatingElements}>
      <div style={styles.floatingElement(15, 10, '150px', 0, 'rgba(245, 158, 11, 0.1)')}></div>
      <div style={styles.floatingElement(80, 85, '200px', 2, 'rgba(59, 130, 246, 0.1)')}></div>
      <div style={styles.floatingElement(40, 90, '120px', 1, 'rgba(34, 197, 94, 0.1)')}></div>
      <div style={styles.floatingElement(70, 15, '180px', 3, 'rgba(239, 68, 68, 0.1)')}></div>
      <div style={styles.floatingElement(25, 70, '130px', 4, 'rgba(139, 92, 246, 0.1)')}></div>
    </div>
  );

  const stats = {
    pending: pending.length,
    approved: approved.length,
    fake: fake.length,
    announcements: anns.length
  };

  return (
    <div style={styles.container}>
      <FloatingElements />
      <div style={{...styles.glowEffect, top: '10%', left: '5%'}}></div>
      <div style={{...styles.glowEffect, top: '70%', right: '5%'}}></div>
      
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.headerIcon}>
              👨‍🏫
            </div>
            <div style={styles.headerText}>
              <div style={styles.headerTitle}>Teacher Dashboard</div>
              <div style={styles.headerSubtitle}>
                Manage students, certificates, and announcements
              </div>
            </div>
          </div>
          <button style={styles.logoutButton} onClick={logout}>
            <span>🚪</span> Logout
          </button>
        </div>

        {/* Quick Stats */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px'}}>
          <div style={styles.statsCard}>
            <div style={styles.statNumber}>{stats.pending}</div>
            <div style={styles.statLabel}>Pending Requests</div>
          </div>
          <div style={styles.statsCard}>
            <div style={styles.statNumber}>{stats.approved}</div>
            <div style={styles.statLabel}>Approved Students</div>
          </div>
          <div style={styles.statsCard}>
            <div style={styles.statNumber}>{stats.fake}</div>
            <div style={styles.statLabel}>Fake Attempts</div>
          </div>
          <div style={styles.statsCard}>
            <div style={styles.statNumber}>{stats.announcements}</div>
            <div style={styles.statLabel}>Announcements</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <div style={styles.tab(tab === 'requests')} onClick={() => setTab('requests')}>
            <span>📋</span> Join Requests
            <span style={styles.tabBadge(pending.length)}>{pending.length}</span>
          </div>
          <div style={styles.tab(tab === 'approved')} onClick={() => setTab('approved')}>
            <span>✅</span> Approved Students
            <span style={styles.tabBadge(0)}>{approved.length}</span>
          </div>
          <div style={styles.tab(tab === 'fake')} onClick={() => setTab('fake')}>
            <span>⚠️</span> Fake Attempts
            <span style={styles.tabBadge(fake.length)}>{fake.length}</span>
          </div>
          <div style={styles.tab(tab === 'announcements')} onClick={() => setTab('announcements')}>
            <span>📢</span> Announcements
            <span style={styles.tabBadge(0)}>{anns.length}</span>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div style={styles.card}>
            <div style={{textAlign: 'center', padding: '60px', color: '#64748b'}}>
              <div style={{fontSize: '48px', marginBottom: '20px'}}>⏳</div>
              Loading dashboard data...
            </div>
          </div>
        ) : (
          <>
            {/* Pending Requests Tab */}
            {tab === 'requests' && (
              <div style={styles.card}>
                <div style={{fontSize: '22px', fontWeight: 'bold', marginBottom: '24px', color: '#f1f5f9'}}>
                  📋 Pending Join Requests
                </div>
                {pending.length === 0 ? (
                  <div style={styles.emptyState}>
                    <div style={{fontSize: '48px', marginBottom: '20px'}}>🎉</div>
                    No pending requests at the moment
                  </div>
                ) : (
                  <div style={styles.grid}>
                    {pending.map((s, index) => (
                      <div key={s._id} style={{...styles.studentCard, animationDelay: `${index * 0.05}s`}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px'}}>
                          <div>
                            <div style={{fontSize: '20px', fontWeight: '600', color: '#f1f5f9', marginBottom: '4px'}}>
                              {s.name}
                            </div>
                            <div style={{fontSize: '14px', color: '#94a3b8'}}>USN: {s.usn}</div>
                          </div>
                          {s.idCardImage && (
                            <img 
                              alt="id" 
                              src={`${BASE_URL}${s.idCardImage}`} 
                              style={{
                                width: '100px',
                                height: '70px',
                                objectFit: 'cover',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                              }} 
                            />
                          )}
                        </div>
                        
                        <textarea 
                          placeholder="Reason for rejection (optional)"
                          style={styles.textarea}
                          value={reasons[s._id] || ''}
                          onChange={e => setReasons({ ...reasons, [s._id]: e.target.value })}
                        />
                        
                        <div style={styles.actionButtons}>
                          <button style={styles.approveButton} onClick={() => approve(s._id)}>
                            <span>✅</span> Approve
                          </button>
                          <button style={styles.rejectButton} onClick={() => reject(s._id)}>
                            <span>❌</span> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Approved Students Tab */}
            {tab === 'approved' && (
              <div style={styles.card}>
                <div style={{fontSize: '22px', fontWeight: 'bold', marginBottom: '24px', color: '#f1f5f9'}}>
                  ✅ Approved Students ({approved.length})
                </div>
                {approved.length === 0 ? (
                  <div style={styles.emptyState}>
                    <div style={{fontSize: '48px', marginBottom: '20px'}}>📝</div>
                    No approved students yet
                  </div>
                ) : (
                  <div style={styles.grid}>
                    {approved.map((s, index) => (
                      <div key={s._id} style={{...styles.studentCard, animationDelay: `${index * 0.05}s`}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
                          <div>
                            <div style={{fontSize: '18px', fontWeight: '600', color: '#f1f5f9'}}>
                              {s.name}
                            </div>
                            <div style={{fontSize: '14px', color: '#94a3b8'}}>USN: {s.usn}</div>
                          </div>
                          <span style={styles.badge(s.certificateStatus)}>
                            {s.certificateStatus === 'valid' ? '✅ Verified' : 
                             s.certificateStatus === 'fake' ? '❌ Fake' : 
                             '⏳ Pending'}
                          </span>
                        </div>
                        {s.certificateStatus === 'fake' && s.certificateData && s.certificateData.issuedTo && (
                          <div style={{fontSize: '13px', color: '#fca5a5', marginTop: '8px', padding: '8px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px'}}>
                            <strong>Issued To:</strong> {s.certificateData.issuedTo}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Fake Attempts Tab */}
            {tab === 'fake' && (
              <div style={styles.card}>
                <div style={{fontSize: '22px', fontWeight: 'bold', marginBottom: '24px', color: '#f1f5f9'}}>
                  ⚠️ Fake Certificate Attempts ({fake.length})
                </div>
                {fake.length === 0 ? (
                  <div style={styles.emptyState}>
                    <div style={{fontSize: '48px', marginBottom: '20px'}}>🎯</div>
                    No fake attempts detected
                  </div>
                ) : (
                  <div style={styles.grid}>
                    {fake.map((s, index) => (
                      <div key={s._id} style={{...styles.studentCard, animationDelay: `${index * 0.05}s`}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
                          <div>
                            <div style={{fontSize: '18px', fontWeight: '600', color: '#f1f5f9'}}>
                              {s.name}
                            </div>
                            <div style={{fontSize: '14px', color: '#94a3b8'}}>USN: {s.usn}</div>
                          </div>
                          <span style={styles.badge('fake')}>
                            ❌ Fake
                          </span>
                        </div>
                        <div style={{fontSize: '14px', color: '#fca5a5', marginTop: '8px'}}>
                          <strong>Certificate issued to:</strong> {(s.certificateData && s.certificateData.issuedTo) || 'N/A'}
                        </div>
                        {s.certificateFile && (
                          <a 
                            href={`${BASE_URL}${s.certificateFile}`} 
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
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Announcements Tab */}
            {tab === 'announcements' && (
              <div style={styles.card}>
                <div style={{fontSize: '22px', fontWeight: 'bold', marginBottom: '24px', color: '#f1f5f9'}}>
                  📢 Announcements ({anns.length})
                </div>
                
                {/* Post Announcement */}
                <div style={{marginBottom: '30px'}}>
                  <textarea 
                    placeholder="Type your announcement here..."
                    style={styles.announcementInput}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows="3"
                  />
                  <button style={styles.postButton} onClick={postAnn}>
                    <span>📤</span> Post Announcement
                  </button>
                </div>
                
                {/* Announcements List */}
                {anns.length === 0 ? (
                  <div style={styles.emptyState}>
                    <div style={{fontSize: '48px', marginBottom: '20px'}}>📝</div>
                    No announcements posted yet
                  </div>
                ) : (
                  <div style={styles.grid}>
                    {anns.map((a, index) => (
                      <div key={a._id} style={{...styles.studentCard, animationDelay: `${index * 0.05}s`}}>
                        <div style={{fontSize: '16px', color: '#f1f5f9', marginBottom: '12px', lineHeight: '1.6'}}>
                          {a.message}
                        </div>
                        {a.createdAt && (
                          <div style={{fontSize: '13px', color: '#64748b'}}>
                            Posted: {new Date(a.createdAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}