import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const styles = {
  container: { 
    display: 'flex', 
    minHeight: '100vh', 
    alignItems: 'center', 
    justifyContent: 'center', 
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
    overflow: 'hidden',
    position: 'relative'
  },
  floatingElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    zIndex: 0
  },
  floatingElement: (top, left, size, delay) => ({
    position: 'absolute',
    top: `${top}%`,
    left: `${left}%`,
    width: size,
    height: size,
    background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0) 70%)',
    borderRadius: '50%',
    animation: `float 8s ease-in-out infinite ${delay}s`,
    filter: 'blur(1px)'
  }),
  card: { 
    background: 'rgba(30, 41, 59, 0.85)', 
    backdropFilter: 'blur(10px)',
    padding: '40px', 
    width: '450px', 
    borderRadius: '24px', 
    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    zIndex: 10,
    position: 'relative',
    animation: 'slideUp 0.7s ease-out'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '30px'
  },
  logoIcon: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    color: 'white',
    boxShadow: '0 8px 30px rgba(245, 158, 11, 0.4)',
    marginBottom: '20px'
  },
  title: { 
    fontSize: '32px', 
    fontWeight: 800, 
    marginBottom: '10px',
    background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textAlign: 'center',
    letterSpacing: '-0.5px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#94a3b8',
    marginBottom: '40px',
    textAlign: 'center',
    lineHeight: '1.6'
  },
  inputGroup: {
    marginBottom: '24px'
  },
  inputLabel: {
    display: 'block',
    marginBottom: '8px',
    color: '#cbd5e1',
    fontSize: '14px',
    fontWeight: 500
  },
  input: { 
    width: '100%', 
    padding: '16px 20px', 
    borderRadius: '14px', 
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(15, 23, 42, 0.6)',
    color: '#f1f5f9',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    outline: 'none'
  },
  inputFocus: {
    borderColor: '#f59e0b',
    boxShadow: '0 0 0 3px rgba(245, 158, 11, 0.2)',
    transform: 'translateY(-2px)',
    background: 'rgba(15, 23, 42, 0.8)'
  },
  button: { 
    width: '100%', 
    padding: '18px', 
    marginTop: '10px', 
    background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)', 
    color: '#1e293b', 
    border: 'none', 
    borderRadius: '14px', 
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 700,
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px'
  },
  buttonHover: {
    transform: 'translateY(-3px)',
    boxShadow: '0 15px 35px rgba(245, 158, 11, 0.4)'
  },
  buttonActive: {
    transform: 'translateY(-1px)'
  },
  buttonIcon: {
    fontSize: '20px'
  },
  msg: { 
    marginTop: '20px',
    padding: '16px',
    borderRadius: '12px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    animation: 'shake 0.5s ease-in-out'
  },
  securityNote: {
    marginTop: '30px',
    padding: '16px',
    background: 'rgba(15, 23, 42, 0.5)',
    borderRadius: '12px',
    border: '1px solid rgba(245, 158, 11, 0.2)',
    fontSize: '13px',
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: '1.6'
  },
  glowEffect: {
    position: 'absolute',
    width: '250px',
    height: '250px',
    background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0) 70%)',
    borderRadius: '50%',
    filter: 'blur(50px)',
    zIndex: 1
  },
  backButton: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    padding: '10px 16px',
    background: 'rgba(30, 41, 59, 0.7)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    color: '#cbd5e1',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease'
  },
  backButtonHover: {
    background: 'rgba(30, 41, 59, 0.9)',
    transform: 'translateX(-3px)'
  }
};

// Add global styles
const globalStyles = document.createElement('style');
globalStyles.innerHTML = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
    33% { transform: translateY(-15px) translateX(15px) rotate(5deg); }
    66% { transform: translateY(10px) translateX(-10px) rotate(-5deg); }
  }
  
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(40px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.05); }
  }
  
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    background: #0f172a;
    color: #f1f5f9;
    overflow-x: hidden;
  }
  
  input, button, textarea {
    font-family: inherit;
  }
  
  input:focus {
    outline: none;
  }
`;
document.head.appendChild(globalStyles);

export default function TeacherLogin() {
  const API = (process.env.REACT_APP_API_BASE || 'http://localhost:5000').replace(/\/+$/, '');
  const [loginID, setLoginID] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isHoveringBack, setIsHoveringBack] = useState(false);
  const navigate = useNavigate();

  const login = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      await axios.post(`${API}/teacher/login`, { loginID, password });
      localStorage.setItem('teacher', '1');
      navigate('/teacher/dashboard');
    } catch (e) {
      setError('Invalid credentials. Please check your login ID and password.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      login();
    }
  };

  const FloatingElements = () => (
    <div style={styles.floatingElements}>
      <div style={styles.floatingElement(15, 15, '120px', 0)}></div>
      <div style={styles.floatingElement(75, 80, '180px', 2)}></div>
      <div style={styles.floatingElement(40, 85, '90px', 1)}></div>
      <div style={styles.floatingElement(85, 25, '150px', 3)}></div>
      <div style={styles.floatingElement(25, 65, '100px', 4)}></div>
    </div>
  );

  return (
    <div style={styles.container}>
      <FloatingElements />
      <div style={{...styles.glowEffect, top: '15%', left: '15%'}}></div>
      <div style={{...styles.glowEffect, top: '65%', right: '15%'}}></div>
      
      {/* Back Button */}
      <div 
        style={{
          ...styles.backButton,
          ...(isHoveringBack && styles.backButtonHover)
        }}
        onClick={() => window.history.back()}
        onMouseEnter={() => setIsHoveringBack(true)}
        onMouseLeave={() => setIsHoveringBack(false)}
      >
        <span>←</span> Back
      </div>
      
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            👨‍🏫
          </div>
        </div>
        
        <div style={styles.title}>Teacher Portal</div>
        <div style={styles.subtitle}>
          Secure access to student management dashboard<br />
          Manage certificates, announcements, and approvals
        </div>
        
        {/* Login Form */}
        <div style={styles.inputGroup}>
          <div style={styles.inputLabel}>Login ID</div>
          <input 
            style={styles.input} 
            placeholder="Enter your teacher ID" 
            value={loginID} 
            onChange={e => setLoginID(e.target.value)}
           
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
        </div>
        
        <div style={styles.inputGroup}>
          <div style={styles.inputLabel}>Password</div>
          <input 
            style={styles.input} 
            placeholder="Enter your password" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
           
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
        </div>
        
        <button 
          style={{
            ...styles.button,
            ...(isHovering && styles.buttonHover),
            opacity: isLoading ? 0.7 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            animation: isLoading ? 'pulse 1.5s infinite' : 'none'
          }} 
          onClick={login}
          disabled={isLoading}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onMouseDown={() => setIsHovering(false)}
          onMouseUp={() => setIsHovering(true)}
        >
          <span style={styles.buttonIcon}>🔐</span>
          {isLoading ? 'Authenticating...' : 'Login to Dashboard'}
        </button>
        
        {/* Error Message */}
        {error && (
          <div style={{
            ...styles.msg, 
            background: 'rgba(239, 68, 68, 0.1)', 
            color: '#fca5a5', 
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            <span style={{fontSize: '18px'}}>⚠️</span> {error}
          </div>
        )}
        
        {/* Security Note */}
        <div style={styles.securityNote}>
          <strong>🔒 Secure Access Only</strong><br />
          This portal is restricted to authorized faculty members only.
          Unauthorized access is prohibited.
        </div>
        
        {/* Additional Info */}
        <div style={{
          marginTop: '30px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#64748b',
          opacity: 0.7
        }}>
          Need help? Contact system administrator
        </div>
      </div>
    </div>
  );
}