import React, { useState, useEffect } from 'react';

const styles = {
  container: {
    background: 'rgba(30, 41, 59, 0.8)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    padding: '24px',
    marginBottom: '24px',
    animation: 'slideDown 0.5s ease-out'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    background: 'linear-gradient(90deg, #60a5fa 0%, #3b82f6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  refreshButton: {
    padding: '10px 20px',
    background: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#cbd5e1',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'rgba(15, 23, 42, 0.8)',
      transform: 'translateY(-2px)'
    },
    '&:active': {
      transform: 'translateY(0)'
    }
  },
  announcementList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxHeight: '400px',
    overflowY: 'auto',
    paddingRight: '10px'
  },
  announcementItem: {
    background: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '20px',
    transition: 'all 0.3s ease',
    animation: 'fadeIn 0.5s ease-out forwards',
    opacity: 0,
    cursor: 'pointer',
    '&:hover': {
      background: 'rgba(15, 23, 42, 0.8)',
      transform: 'translateY(-3px)',
      borderColor: 'rgba(59, 130, 246, 0.3)',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
    }
  },
  announcementContent: {
    fontSize: '15px',
    color: '#f1f5f9',
    lineHeight: '1.6',
    marginBottom: '12px'
  },
  announcementMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
    color: '#94a3b8'
  },
  announcementDate: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  priorityBadge: (priority) => ({
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    background: priority === 'high' 
      ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)' 
      : priority === 'medium' 
        ? 'linear-gradient(90deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)'
        : 'linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)',
    color: priority === 'high' ? '#fca5a5' : priority === 'medium' ? '#fcd34d' : '#93c5fd',
    border: `1px solid ${priority === 'high' ? 'rgba(239, 68, 68, 0.2)' : priority === 'medium' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`
  }),
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#64748b',
    fontSize: '16px',
    background: 'rgba(15, 23, 42, 0.3)',
    borderRadius: '16px',
    border: '2px dashed rgba(255, 255, 255, 0.05)',
    animation: 'pulse 2s infinite'
  },
  announcementIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    color: 'white',
    marginBottom: '16px'
  },
  expandButton: {
    background: 'none',
    border: 'none',
    color: '#60a5fa',
    cursor: 'pointer',
    fontSize: '13px',
    padding: '4px 8px',
    borderRadius: '6px',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    '&:hover': {
      background: 'rgba(59, 130, 246, 0.1)'
    }
  },
  expandedContent: {
    marginTop: '12px',
    padding: '16px',
    background: 'rgba(15, 23, 42, 0.4)',
    borderRadius: '12px',
    borderLeft: '4px solid #3b82f6',
    fontSize: '14px',
    color: '#cbd5e1',
    lineHeight: '1.6',
    animation: 'scaleIn 0.3s ease-out'
  }
};

// Add animations
const animationStyles = document.createElement('style');
animationStyles.innerHTML = `
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  
  @keyframes slideInRight {
    from { transform: translateX(100px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;
document.head.appendChild(animationStyles);

export default function AnnouncementComponent({ announcements, onRefresh }) {
  const [expandedAnnouncements, setExpandedAnnouncements] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const toggleExpand = (id) => {
    setExpandedAnnouncements(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getPriority = (message) => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('urgent') || lowerMessage.includes('important') || lowerMessage.includes('emergency')) {
      return 'high';
    } else if (lowerMessage.includes('reminder') || lowerMessage.includes('deadline')) {
      return 'medium';
    }
    return 'low';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (!announcements || announcements.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.title}>
            <span>📢</span> Announcements
          </div>
          {onRefresh && (
            <button 
              style={styles.refreshButton}
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Refreshing...
                </>
              ) : (
                <>
                  <span>🔄</span> Refresh
                </>
              )}
            </button>
          )}
        </div>
        <div style={styles.emptyState}>
          <div style={{fontSize: '48px', marginBottom: '20px'}}>📝</div>
          No announcements at the moment
          <div style={{fontSize: '14px', marginTop: '12px', color: '#94a3b8'}}>
            Check back later for updates
          </div>
        </div>
      </div>
    );
  }

  // Sort announcements by date (newest first)
  const sortedAnnouncements = [...announcements].sort((a, b) => 
    new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0)
  );

  // Limit to latest 5 announcements for better UI
  const displayedAnnouncements = sortedAnnouncements.slice(0, 5);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>
          <span>📢</span> Announcements ({announcements.length})
        </div>
        {onRefresh && (
          <button 
            style={{
              ...styles.refreshButton,
              animation: isRefreshing ? 'pulse 1s infinite' : 'none'
            }}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <div style={{
                  width: '14px',
                  height: '14px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Refreshing...
              </>
            ) : (
              <>
                <span>🔄</span> Refresh
              </>
            )}
          </button>
        )}
      </div>
      
      <div style={styles.announcementList}>
        {displayedAnnouncements.map((announcement, index) => {
          const priority = getPriority(announcement.message);
          const isImportant = announcement.important === true;
          const isExpanded = expandedAnnouncements[announcement._id];
          const showExpandButton = announcement.message.length > 150;
          const displayMessage = isExpanded || !showExpandButton 
            ? announcement.message 
            : `${announcement.message.substring(0, 150)}...`;
          
          return (
            <div 
              key={announcement._id} 
              style={{
                ...styles.announcementItem,
                animationDelay: `${index * 0.1}s`,
                animation: 'slideInRight 0.5s ease-out forwards',
                ...(isImportant ? {
                  background: 'rgba(120, 83, 15, 0.28)',
                  border: '1px solid rgba(245, 158, 11, 0.5)',
                  boxShadow: '0 0 0 1px rgba(245, 158, 11, 0.12)'
                } : {})
              }}
            >
              <div style={styles.announcementIcon}>
                {isImportant ? '⭐' : priority === 'high' ? '🚨' : priority === 'medium' ? '⚠️' : '📢'}
              </div>
              {isImportant && (
                <div style={{fontSize: '12px', color: '#fcd34d', fontWeight: '700', marginBottom: '8px'}}>
                  Important announcement
                </div>
              )}
              
              <div style={styles.announcementContent}>
                {displayMessage}
              </div>
              
              {showExpandButton && (
                <button 
                  style={styles.expandButton}
                  onClick={() => toggleExpand(announcement._id)}
                >
                  {isExpanded ? 'Show less' : 'Read more'}
                  <span>{isExpanded ? '↑' : '↓'}</span>
                </button>
              )}
              
              <div style={styles.announcementMeta}>
                <div style={styles.announcementDate}>
                  <span>📅</span>
                  {formatDate(announcement.createdAt || announcement.date)}
                  <span style={{margin: '0 8px'}}>•</span>
                  <span>🕒</span>
                  {formatTime(announcement.createdAt || announcement.date)}
                </div>
                <span style={styles.priorityBadge(priority)}>
                  {priority === 'high' ? 'High Priority' : 
                   priority === 'medium' ? 'Medium Priority' : 
                   'Low Priority'}
                </span>
              </div>
              
              {announcement.author && (
                <div style={{
                  fontSize: '12px',
                  color: '#64748b',
                  marginTop: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span>👤</span>
                  Posted by: {announcement.author}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {announcements.length > 5 && (
        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          color: '#94a3b8',
          fontSize: '14px'
        }}>
          Showing latest 5 of {announcements.length} announcements
        </div>
      )}
    </div>
  );
}