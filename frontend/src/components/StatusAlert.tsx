import React, { useEffect, useState } from 'react';

interface StatusAlertProps {
  status?: string;
  onDismiss?: () => void;
}

const StatusAlert: React.FC<StatusAlertProps> = ({ status, onDismiss }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (status) {
      setVisible(true);
      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  if (!status || !visible) return null;

  const getAlertConfig = () => {
    switch (status) {
      case 'hubspot_pending':
        return {
          title: 'HubSpot Authorization Pending',
          message: 'Your HubSpot integration is being processed. Please wait...',
          bgColor: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
          borderColor: '#60a5fa',
          textColor: '#1e3a8a',
          buttonColor: '#3b82f6',
          emoji: '⏳'
        };
      case 'success':
        return {
          title: 'Integration Successful',
          message: 'Your integration has been connected successfully!',
          bgColor: 'linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%)',
          borderColor: '#34d399',
          textColor: '#065f46',
          buttonColor: '#10b981',
          emoji: '✅'
        };
      case 'error':
        return {
          title: 'Integration Failed',
          message: 'There was an error connecting your integration. Please try again.',
          bgColor: 'linear-gradient(135deg, #fef2f2 0%, #fce7e7 100%)',
          borderColor: '#f87171',
          textColor: '#7f1d1d',
          buttonColor: '#ef4444',
          emoji: '❌'
        };
      default:
        return {
          title: 'Notification',
          message: status,
          bgColor: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderColor: '#94a3b8',
          textColor: '#334155',
          buttonColor: '#64748b',
          emoji: '📢'
        };
    }
  };

  const config = getAlertConfig();

  return (
    <div style={{
      background: config.bgColor,
      borderRadius: '16px',
      padding: '25px',
      border: `2px solid ${config.borderColor}`,
      marginBottom: '30px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1), 0 4px 15px rgba(0,0,0,0.05)',
      backdropFilter: 'blur(10px)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Subtle background decoration */}
      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        width: '60px',
        height: '60px',
        background: `radial-gradient(circle, ${config.borderColor}20, transparent)`,
        borderRadius: '50%'
      }}></div>

      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '15px'
      }}>
        {/* Icon */}
        <div style={{
          fontSize: '24px',
          flexShrink: 0,
          marginTop: '2px'
        }}>
          {config.emoji}
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: config.textColor,
            margin: '0 0 8px 0'
          }}>
            {config.title}
          </h3>
          <div style={{
            fontSize: '14px',
            color: config.textColor,
            opacity: 0.9,
            lineHeight: '1.5'
          }}>
            <p style={{ margin: '0' }}>{config.message}</p>
          </div>
        </div>

        {/* Dismiss Button */}
        <div style={{ marginLeft: 'auto', paddingLeft: '15px' }}>
          <button
            type="button"
            onClick={handleDismiss}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              padding: '8px',
              color: config.buttonColor,
              background: 'rgba(255,255,255,0.5)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.2s ease',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.background = 'rgba(255,255,255,0.8)';
              target.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.background = 'rgba(255,255,255,0.5)';
              target.style.transform = 'scale(1)';
            }}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusAlert;