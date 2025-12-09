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
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0) 70%)',
    borderRadius: '50%',
    animation: `float 6s ease-in-out infinite ${delay}s`,
    filter: 'blur(1px)'
  }),
  card: { 
    background: 'rgba(30, 41, 59, 0.85)', 
    backdropFilter: 'blur(10px)',
    padding: '32px', 
    width: '420px', 
    borderRadius: '20px', 
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    zIndex: 10,
    position: 'relative',
    animation: 'slideUp 0.6s ease-out'
  },
  title: { 
    fontSize: '28px', 
    fontWeight: 700, 
    marginBottom: '20px',
    background: 'linear-gradient(90deg, #60a5fa 0%, #3b82f6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textAlign: 'center'
  },
  subtitle: {
    fontSize: '16px',
    color: '#94a3b8',
    marginBottom: '24px',
    textAlign: 'center'
  },
  input: { 
    width: '100%', 
    padding: '14px 16px', 
    marginTop: '12px', 
    borderRadius: '12px', 
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(15, 23, 42, 0.6)',
    color: '#f1f5f9',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    outline: 'none'
  },
  inputFocus: {
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.2)',
    background: 'rgba(15, 23, 42, 0.8)'
  },
  button: { 
    width: '100%', 
    padding: '16px', 
    marginTop: '20px', 
    background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '12px', 
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 600,
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden'
  },
  buttonHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 25px rgba(59, 130, 246, 0.4)'
  },
  buttonActive: {
    transform: 'translateY(0)'
  },
  link: { 
    marginTop: '16px', 
    color: '#60a5fa', 
    cursor: 'pointer', 
    textAlign: 'center',
    fontSize: '14px',
    transition: 'color 0.3s ease'
  },
  linkHover: {
    color: '#3b82f6'
  },
  msg: { 
    marginTop: '16px',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  separator: {
    display: 'flex',
    alignItems: 'center',
    margin: '20px 0',
    color: '#64748b'
  },
  separatorLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(255, 255, 255, 0.1)'
  },
  separatorText: {
    padding: '0 12px',
    fontSize: '14px'
  },
  glowEffect: {
    position: 'absolute',
    width: '200px',
    height: '200px',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0) 70%)',
    borderRadius: '50%',
    filter: 'blur(40px)',
    zIndex: 1
  }
};

// Add global styles
const globalStyles = document.createElement('style');
globalStyles.innerHTML = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) translateX(0px); }
    50% { transform: translateY(-20px) translateX(10px); }
  }
  
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
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
    color: #f1f5f9;
  }
  
  input, button, textarea {
    font-family: inherit;
  }
  
  input:focus {
    outline: none;
  }
`;
document.head.appendChild(globalStyles);

export default function StudentLogin() {
  const API = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
  const [name, setName] = useState('');
  const [usn, setUsn] = useState('');
  const [message, setMessage] = useState('');
  const [rejection, setRejection] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHoveringLogin, setIsHoveringLogin] = useState(false);
  const [isHoveringRegister, setIsHoveringRegister] = useState(false);
  const navigate = useNavigate();

  const login = async () => {
    setMessage('');
    setRejection('');
    setIsLoading(true);
    
    try {
      const { data } = await axios.post(`${API}/student/login`, { name, usn });
      if (data.status === 'approved') {
        localStorage.setItem('student', JSON.stringify(data.student));
        navigate('/student');
      }
    } catch (e) {
      if (e.response) {
        const s = e.response.data.status;
        if (s === 'pending') setMessage('Your application is pending.');
        else if (s === 'rejected') setRejection(e.response.data.reason || 'Rejected');
        else setMessage(e.response.data.message || 'Login failed');
      } else setMessage('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const form = new FormData(e.target);
    try {
      await axios.post(`${API}/student/register`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage('Registered. Await teacher approval.');
    } catch (err) {
      setMessage((err.response && err.response.data && err.response.data.message) || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const FloatingElements = () => (
    <div style={styles.floatingElements}>
      <div style={styles.floatingElement(10, 10, '100px', 0)}></div>
      <div style={styles.floatingElement(80, 85, '150px', 1)}></div>
      <div style={styles.floatingElement(40, 75, '80px', 2)}></div>
      <div style={styles.floatingElement(70, 20, '120px', 3)}></div>
      <div style={styles.floatingElement(20, 60, '90px', 4)}></div>
    </div>
  );

  return (
    <div style={styles.container}>
      <FloatingElements />
      <div style={{...styles.glowEffect, top: '20%', left: '10%'}}></div>
      <div style={{...styles.glowEffect, top: '60%', left: '80%'}}></div>
      
      <div style={styles.card}>
        <div style={styles.title}>Student Portal</div>
        <div style={styles.subtitle}>Login to access your certificate dashboard</div>
        
        {/* Login Section */}
        <input 
          style={styles.input} 
          placeholder="Enter your full name" 
          value={name} 
          onChange={e => setName(e.target.value)} 
         
        />
        <input 
          style={styles.input} 
          placeholder="Enter your USN" 
          value={usn} 
          onChange={e => setUsn(e.target.value)}
          
        />
        <button 
          style={{
            ...styles.button,
            ...(isHoveringLogin && styles.buttonHover),
            opacity: isLoading ? 0.7 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }} 
          onClick={login}
          disabled={isLoading}
          onMouseEnter={() => setIsHoveringLogin(true)}
          onMouseLeave={() => setIsHoveringLogin(false)}
          onMouseDown={() => setIsHoveringLogin(false)}
          onMouseUp={() => setIsHoveringLogin(true)}
        >
          {isLoading ? (
            <>
              <span style={{marginRight: '8px'}}></span> Logging in...
            </>
          ) : 'Login'}
        </button>
        
        {/* Messages */}
        {message && (
          <div style={{...styles.msg, background: 'rgba(34, 197, 94, 0.1)', color: '#86efac', border: '1px solid rgba(34, 197, 94, 0.2)'}}>
            <span></span> {message}
          </div>
        )}
        {rejection && (
          <div style={{...styles.msg, background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.2)'}}>
            <span>âš ï¸</span> {rejection}
          </div>
        )}
        
        {/* Separator */}
        <div style={styles.separator}>
          <div style={styles.separatorLine}></div>
          <div style={styles.separatorText}>New Student?</div>
          <div style={styles.separatorLine}></div>
        </div>
        
        {/* Registration Section */}
        <div style={{...styles.title, fontSize: '20px', marginBottom: '16px', marginTop: '8px'}}>Register Here</div>
        <form onSubmit={register}>
          <input 
            name="name" 
            style={styles.input} 
            placeholder="Full name" 
            required
           
          />
          <input 
            name="usn" 
            style={styles.input} 
            placeholder="USN" 
            required
          
          />
          <div style={{marginTop: '12px', color: '#94a3b8', fontSize: '14px'}}>
            Upload ID Card (Image)
          </div>
          <input 
            name="idCardImage" 
            type="file" 
            accept="image/*" 
            style={{
              ...styles.input,
              padding: '10px',
              background: 'rgba(15, 23, 42, 0.6)',
              cursor: 'pointer'
            }} 
            required
            
          />
          <button 
            style={{
              ...styles.button,
              background: 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)',
              ...(isHoveringRegister && styles.buttonHover),
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }} 
            type="submit"
            disabled={isLoading}
            onMouseEnter={() => setIsHoveringRegister(true)}
            onMouseLeave={() => setIsHoveringRegister(false)}
            onMouseDown={() => setIsHoveringRegister(false)}
            onMouseUp={() => setIsHoveringRegister(true)}
          >
            {isLoading ? 'Processing...' : 'Register Now'}
          </button>
        </form>
        
        <div style={{...styles.link, ':hover': styles.linkHover}} onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          
        </div>
      </div>
    </div>
  );
}
