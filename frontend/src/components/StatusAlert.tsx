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
      // Auto dismiss after 5 seconds
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
          type: 'info',
          icon: '🔄',
          title: 'HubSpot Authorization Pending',
          message: 'Your HubSpot integration is being processed. Please wait...',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          buttonColor: 'text-blue-600'
        };
      case 'success':
        return {
          type: 'success',
          icon: '✅',
          title: 'Integration Successful',
          message: 'Your integration has been connected successfully!',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          buttonColor: 'text-green-600'
        };
      case 'error':
        return {
          type: 'error',
          icon: '❌',
          title: 'Integration Failed',
          message: 'There was an error connecting your integration. Please try again.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          buttonColor: 'text-red-600'
        };
      default:
        return {
          type: 'info',
          icon: 'ℹ️',
          title: 'Notification',
          message: status,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          buttonColor: 'text-gray-600'
        };
    }
  };

  const config = getAlertConfig();

  return (
    <div className={`rounded-lg p-4 border ${config.bgColor} ${config.borderColor} mb-6`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-lg">{config.icon}</span>
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${config.textColor}`}>
            {config.title}
          </h3>
          <div className={`mt-1 text-sm ${config.textColor}`}>
            <p>{config.message}</p>
          </div>
        </div>
        <div className="ml-auto pl-3">
          <button
            type="button"
            onClick={handleDismiss}
            className={`inline-flex rounded-md p-1.5 ${config.buttonColor} hover:bg-white hover:bg-opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-gray-600`}
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusAlert; 