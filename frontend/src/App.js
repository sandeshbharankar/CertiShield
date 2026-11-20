import './App.css'; 
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'; 
import StudentHome from './Component/StudentHome'; 
import StudentLogin from './Component/StudentLogin'; 
import TeacherLogin from './Component/TeacherLogin'; 
import TeacherDashboard from './Component/TeacherDashboard'; 
import { useEffect, useState } from 'react'; // ← ADD THIS IMPORT 
 
// Add global styles for animations and transitions 
const globalStyles = document.createElement('style'); 
globalStyles.innerHTML = ` 
  @keyframes fadeIn { 
    from { opacity: 0; } 
    to { opacity: 1; } 
  } 
   
  @keyframes slideInFromRight { 
    from { transform: translateX(100px); opacity: 0; } 
    to { transform: translateX(0); opacity: 1; } 
  } 
   
  @keyframes slideInFromLeft { 
    from { transform: translateX(-100px); opacity: 0; } 
    to { transform: translateX(0); opacity: 1; } 
  } 
   
  @keyframes scaleIn { 
    from { transform: scale(0.95); opacity: 0; } 
    to { transform: scale(1); opacity: 1; } 
  } 
   
  .page-transition { 
    animation: fadeIn 0.5s ease-out; 
  } 
   
  .slide-right { 
    animation: slideInFromRight 0.6s ease-out; 
  } 
   
  .slide-left { 
    animation: slideInFromLeft 0.6s ease-out; 
  } 
   
  .scale-in { 
    animation: scaleIn 0.4s ease-out; 
  } 
   
  body { 
    margin: 0; 
    padding: 0; 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, 
sans-serif; 
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%); 
    color: #f1f5f9; 
    min-height: 100vh; 
    overflow-x: hidden; 
  } 
   
  * { 
    box-sizing: border-box; 
  } 
   
  ::-webkit-scrollbar { 
    width: 10px; 
    height: 10px; 
  } 
   
  ::-webkit-scrollbar-track { 
    background: rgba(30, 41, 59, 0.5); 
    border-radius: 10px; 
  } 
   
  ::-webkit-scrollbar-thumb { 
    background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%); 
    border-radius: 10px; 
  } 
   
  ::-webkit-scrollbar-thumb:hover { 
    background: linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%); 
  } 
   
  ::selection { 
    background: rgba(59, 130, 246, 0.5); 
    color: white; 
  } 
   
  /* Smooth transitions */ 
  a, button, input, textarea { 
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
  } 
   
  /* Loading spinner */ 
  .loading-spinner { 
    display: inline-block; 
    width: 40px; 
    height: 40px; 
    border: 3px solid rgba(255, 255, 255, 0.1); 
    border-top-color: #3b82f6; 
    border-radius: 50%; 
    animation: spin 1s linear infinite; 
  } 
   
  @keyframes spin { 
    to { transform: rotate(360deg); } 
  } 
   
  /* Toast notification style */ 
  .toast { 
    position: fixed; 
    bottom: 20px; 
    right: 20px; 
    background: rgba(30, 41, 59, 0.95); 
    backdrop-filter: blur(10px); 
    border: 1px solid rgba(255, 255, 255, 0.1); 
    border-radius: 12px; 
    padding: 16px 20px; 
    color: white; 
    z-index: 9999; 
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3); 
    animation: slideInFromRight 0.3s ease-out; 
    display: flex; 
    align-items: center; 
    gap: 12px; 
    max-width: 400px; 
  } 
   
  .toast.success { 
    border-left: 4px solid #10b981; 
  } 
   
  .toast.error { 
    border-left: 4px solid #ef4444; 
  } 
   
  .toast.warning { 
    border-left: 4px solid #f59e0b; 
  } 
   
  .toast.info { 
    border-left: 4px solid #3b82f6; 
  } 
   
  /* Floating particles */ 
  .floating-particles { 
    position: fixed; 
    width: 100%; 
    height: 100%; 
    overflow: hidden; 
    z-index: 0; 
    pointer-events: none; 
  } 
   
  .floating-particle { 
    position: absolute; 
    background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0) 70%); 
    border-radius: 50%; 
    animation: float 20s linear infinite; 
  } 
   
  @keyframes float { 
    0% { 
      transform: translateY(100vh) translateX(0) rotate(0deg); 
      opacity: 0; 
    } 
    10% { 
      opacity: 0.3; 
    } 
    90% { 
      opacity: 0.3; 
    } 
    100% { 
      transform: translateY(-100px) translateX(100px) rotate(360deg); 
      opacity: 0; 
    } 
  } 
`; 
document.head.appendChild(globalStyles); 
 
// Floating Particles Component 
const FloatingParticles = () => { 
  const particles = Array.from({ length: 20 }, (_, i) => ({ 
    id: i, 
    size: Math.random() * 100 + 50, 
    left: Math.random() * 100, 
    delay: Math.random() * 20, 
    duration: Math.random() * 20 + 10 
  })); 
 
  return ( 
    <div className="floating-particles"> 
      {particles.map(particle => ( 
        <div 
          key={particle.id} 
          className="floating-particle" 
          style={{ 
            width: particle.size, 
            height: particle.size, 
            left: `${particle.left}%`, 
            animationDelay: `${particle.delay}s`, 
            animationDuration: `${particle.duration}s` 
          }} 
        /> 
      ))} 
    </div> 
  ); 
}; 
 
// Route transition wrapper 
const AnimatedRoute = ({ children }) => { 
  const location = useLocation(); 
   
  useEffect(() => { 
    // Add smooth scroll to top on route change 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  }, [location]); 
   
  return ( 
    <div className="page-transition" style={{ minHeight: '100vh' }}> 
      {children} 
    </div> 
  ); 
}; 
 
// Loading component 
const LoadingScreen = () => ( 
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '100vh', 
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)', 
    flexDirection: 'column', 
    gap: '20px' 
  }}> 
    <div className="loading-spinner"></div> 
    <div style={{ 
      color: '#94a3b8', 
      fontSize: '16px', 
      fontWeight: '500', 
      animation: 'pulse 2s infinite' 
    }}> 
      Loading application... 
    </div> 
  </div> 
); 

const StudentRoute = () => (
  localStorage.getItem('student') ? (
    <AnimatedRoute>
      <StudentHome />
    </AnimatedRoute>
  ) : (
    <Navigate to="/" replace />
  )
);
 
function App() { 
  const [isLoading, setIsLoading] = useState(true); 
 
  useEffect(() => { 
    // Simulate loading for better UX 
    const timer = setTimeout(() => setIsLoading(false), 1000); 
    return () => clearTimeout(timer); 
  }, []); 
 
  if (isLoading) { 
    return <LoadingScreen />; 
  } 
 
  return ( 
    <> 
      <FloatingParticles /> 
      <BrowserRouter> 
        <Routes> 
          <Route 
            path="/" 
            element={ 
              <AnimatedRoute> 
                <StudentLogin /> 
              </AnimatedRoute> 
            } 
          /> 
          <Route 
            path="/student" 
            element={<StudentRoute />}
          /> 
          <Route 
            path="/teacher" 
            element={ 
              <AnimatedRoute> 
                <TeacherLogin /> 
              </AnimatedRoute> 
            } 
          /> 
          <Route 
            path="/teacher/dashboard" 
            element={ 
              localStorage.getItem('teacher') ? ( 
                <AnimatedRoute> 
                  <TeacherDashboard /> 
                </AnimatedRoute> 
              ) : ( 
                <Navigate to="/teacher" replace /> 
              ) 
            } 
          /> 
          {/* 404 Route */} 
          <Route 
            path="*" 
            element={ 
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh', 
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)', 
                flexDirection: 'column', 
                padding: '20px', 
                textAlign: 'center' 
              }}> 
                <div style={{ 
                  fontSize: '120px', 
                  marginBottom: '20px', 
                  background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)', 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent' 
                }}> 
                  404 
                </div> 
                <div style={{ 
                  fontSize: '28px', 
                  fontWeight: 'bold', 
                  marginBottom: '16px', 
                  color: '#f1f5f9' 
                }}> 
                  Page Not Found 
                </div> 
                <div style={{ 
                  fontSize: '16px', 
                  color: '#94a3b8', 
                  marginBottom: '32px', 
                  maxWidth: '500px' 
                }}> 
                  The page you're looking for doesn't exist or has been moved. 
                </div> 
                <button 
                  onClick={() => window.history.back()} 
                  style={{ 
                    padding: '14px 32px', 
                    background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '12px', 
                    cursor: 'pointer', 
                    fontWeight: '600', 
                    fontSize: '16px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    transition: 'all 0.3s ease', 
                    ':hover': { 
                      transform: 'translateY(-2px)', 
                      boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)' 
                    } 
                  }} 
                > 
                  ← Go Back 
                </button> 
              </div> 
            } 
          /> 
        </Routes> 
      </BrowserRouter> 
    </> 
  ); 
} 
 
export default App;