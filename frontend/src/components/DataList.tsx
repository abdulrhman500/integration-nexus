import React from 'react';
import { IntegrationItem, IntegrationPlatform } from '../types';
import { integrationService } from '../services/IntegrationService';

interface DataListProps {
  items: IntegrationItem[];
  platform: IntegrationPlatform;
  loading: boolean;
  error?: string;
  onRefresh?: () => void;
}

const DataList: React.FC<DataListProps> = ({ 
  items, 
  platform, 
  loading, 
  error, 
  onRefresh 
}) => {
  const config = integrationService.getIntegrationConfig(platform);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-3 text-gray-600">Loading {config.displayName} data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4">!</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">&#128203;</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Found</h3>
          <p className="text-gray-600">
            No items found in your {config.displayName} integration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="mr-2">{config.icon}</span>
            {config.displayName} Data ({items.length} items)
          </h3>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Refresh
            </button>
          )}
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {items.map((item, index) => (
          <div key={item.id || index} className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">
                  {item.name || `Item ${index + 1}`}
                </h4>
                {item.type && (
                  <p className="text-sm text-gray-600 mt-1">
                    Type: <span className="font-medium">{item.type}</span>
                  </p>
                )}
                {item.parent_path_or_name && (
                  <p className="text-sm text-gray-600 mt-1">
                    Parent: {item.parent_path_or_name}
                  </p>
                )}
                <div className="flex space-x-4 mt-2 text-xs text-gray-500">
                  {item.creation_time && (
                    <span>Created: {formatDate(item.creation_time)}</span>
                  )}
                  {item.last_modified_time && (
                    <span>Modified: {formatDate(item.last_modified_time)}</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                {item.directory && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    Directory
                  </span>
                )}
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    View
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataList;