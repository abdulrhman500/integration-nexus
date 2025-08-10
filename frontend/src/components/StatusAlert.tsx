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
          bgColor: 'bg-gradient-to-r from-blue-50 to-indigo-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-900',
          buttonColor: 'text-blue-600 hover:text-blue-800'
        };
      case 'success':
        return {
          title: 'Integration Successful',
          message: 'Your integration has been connected successfully!',
          bgColor: 'bg-gradient-to-r from-green-50 to-emerald-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-900',
          buttonColor: 'text-green-600 hover:text-green-800'
        };
      case 'error':
        return {
          title: 'Integration Failed',
          message: 'There was an error connecting your integration. Please try again.',
          bgColor: 'bg-gradient-to-r from-red-50 to-pink-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-900',
          buttonColor: 'text-red-600 hover:text-red-800'
        };
      default:
        return {
          title: 'Notification',
          message: status,
          bgColor: 'bg-gradient-to-r from-gray-50 to-slate-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-900',
          buttonColor: 'text-gray-600 hover:text-gray-800'
        };
    }
  };

  const config = getAlertConfig();

  return (
    <div className={`rounded-2xl p-6 border-2 ${config.bgColor} ${config.borderColor} mb-8 shadow-lg backdrop-blur-sm`}>
      <div className="flex items-start">
        <div className="flex-1">
          <h3 className={`text-lg font-bold ${config.textColor} mb-1`}>
            {config.title}
          </h3>
          <div className={`text-sm ${config.textColor} opacity-90`}>
            <p>{config.message}</p>
          </div>
        </div>
        <div className="ml-auto pl-3">
          <button
            type="button"
            onClick={handleDismiss}
            className={`inline-flex rounded-xl p-2 ${config.buttonColor} hover:bg-white hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-gray-400 transition-all duration-200 transform hover:scale-110`}
          >
            <span className="sr-only">Dismiss</span>
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusAlert;
