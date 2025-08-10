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
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Loading {config.displayName} data
          </h3>
          <p className="text-gray-600">
            Please wait while we fetch your data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100">
        <div className="text-center py-12">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Error Loading Data</h3>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">{error}</p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
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
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center py-16">
          <h3 className="text-xl font-bold text-gray-900 mb-3">No Data Found</h3>
          <p className="text-gray-600 max-w-sm mx-auto">
            No items found in your {config.displayName} integration. Try connecting first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-bold text-gray-900">
              {config.displayName} Data
            </div>
            <div className="text-sm font-normal text-gray-600">
              {items.length} {items.length === 1 ? 'item' : 'items'} found
            </div>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-4 py-2 text-sm bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 border border-gray-200 shadow-sm hover:shadow-md font-medium"
            >
              Refresh
            </button>
          )}
        </div>
      </div>
      
      <div className="divide-y divide-gray-100">
        {items.map((item, index) => (
          <div
            key={item.id || index}
            className="px-8 py-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                    {item.name || `Item ${index + 1}`}
                  </h4>
                  {item.directory && (
                    <span className="ml-3 px-3 py-1 text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-medium">
                      Directory
                    </span>
                  )}
                </div>
                
                {item.type && (
                  <div className="mb-2 text-sm text-gray-600">
                    Type: <span className="font-medium text-gray-800">{item.type}</span>
                  </div>
                )}
                
                {item.parent_path_or_name && (
                  <div className="mb-3 text-sm text-gray-600">
                    Parent: <span className="font-medium text-gray-800">{item.parent_path_or_name}</span>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  {item.creation_time && (
                    <div className="bg-gray-100 px-2 py-1 rounded-md">
                      Created: {formatDate(item.creation_time)}
                    </div>
                  )}
                  {item.last_modified_time && (
                    <div className="bg-gray-100 px-2 py-1 rounded-md">
                      Modified: {formatDate(item.last_modified_time)}
                    </div>
                  )}
                </div>
              </div>
              
              {item.url && (
                <div className="flex items-center ml-6">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg text-sm font-medium"
                  >
                    View
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataList;
