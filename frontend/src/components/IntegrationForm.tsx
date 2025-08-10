import React, { useState } from 'react';
import { IntegrationPlatform, AuthorizeRequest } from '../types';
import { integrationService } from '../services/IntegrationService';

interface IntegrationFormProps {
  onSubmit: (platform: IntegrationPlatform, data: AuthorizeRequest) => void;
  loading: boolean;
}

const IntegrationForm: React.FC<IntegrationFormProps> = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState<AuthorizeRequest>({
    org_id: '',
    user_id: ''
  });
  const [selectedPlatform, setSelectedPlatform] = useState<IntegrationPlatform>('hubspot');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPlatform(e.target.value as IntegrationPlatform);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.org_id.trim() && formData.user_id.trim()) {
      localStorage.setItem(`${selectedPlatform}_org_id`, formData.org_id);
      localStorage.setItem(`${selectedPlatform}_user_id`, formData.user_id);

      onSubmit(selectedPlatform, formData);
    }
  };

  const isFormValid = formData.org_id.trim() && formData.user_id.trim();
  const integrations = integrationService.getAllIntegrations();

  return (
    <div style={{
      background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 50%, #e0e7ff 100%)',
      borderRadius: '20px',
      padding: '35px',
      boxShadow: '0 20px 50px rgba(0,0,0,0.1), 0 10px 30px rgba(99, 102, 241, 0.05)',
      border: '1px solid rgba(255,255,255,0.8)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative elements */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '120px',
        height: '120px',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.15))',
        borderRadius: '50%'
      }}></div>
      
      <div style={{
        position: 'absolute',
        bottom: '-40px',
        left: '-40px',
        width: '100px',
        height: '100px',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.15))',
        borderRadius: '50%'
      }}></div>

      <div style={{ textAlign: 'center', marginBottom: '35px', position: 'relative' }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #1e293b, #7c3aed, #3730a3)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: '0 0 12px 0'
        }}>
          🔗 Connect Integration
        </h2>
        <p style={{
          color: '#64748b',
          fontSize: '16px',
          margin: '0'
        }}>
          Choose your platform and enter your credentials
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
        <div style={{ marginBottom: '25px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '12px'
          }}>
            🌐 Integration Platform
          </label>
          <select
            id="platform"
            value={selectedPlatform}
            onChange={handlePlatformChange}
            style={{
              width: '100%',
              padding: '15px',
              border: '2px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '16px',
              background: 'rgba(255,255,255,0.9)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              outline: 'none'
            }}
            onFocus={(e) => {
              const target = e.target as HTMLSelectElement;
              target.style.borderColor = '#8b5cf6';
              target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
            }}
            onBlur={(e) => {
              const target = e.target as HTMLSelectElement;
              target.style.borderColor = '#e2e8f0';
              target.style.boxShadow = 'none';
            }}
          >
            {integrations.map((integration) => (
              <option key={integration.name} value={integration.name}>
                {integration.displayName}
              </option>
            ))}
          </select>
          <div style={{
            marginTop: '12px',
            padding: '15px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(59, 130, 246, 0.05))',
            borderRadius: '10px',
            border: '1px solid rgba(139, 92, 246, 0.15)'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#475569',
              margin: '0'
            }}>
              ℹ️ {integrationService.getIntegrationConfig(selectedPlatform).description}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '12px'
            }}>
              🏢 Organization ID
            </label>
            <input
              type="text"
              id="org_id"
              name="org_id"
              value={formData.org_id}
              onChange={handleInputChange}
              placeholder="e.g., org_12345"
              style={{
                width: '100%',
                padding: '15px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '16px',
                background: 'rgba(255,255,255,0.9)',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              onFocus={(e) => {
                const target = e.target as HTMLInputElement;
                target.style.borderColor = '#8b5cf6';
                target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
              }}
              onBlur={(e) => {
                const target = e.target as HTMLInputElement;
                target.style.borderColor = '#e2e8f0';
                target.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '12px'
            }}>
              👤 User ID
            </label>
            <input
              type="text"
              id="user_id"
              name="user_id"
              value={formData.user_id}
              onChange={handleInputChange}
              placeholder="e.g., user_67890"
              style={{
                width: '100%',
                padding: '15px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '16px',
                background: 'rgba(255,255,255,0.9)',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              onFocus={(e) => {
                const target = e.target as HTMLInputElement;
                target.style.borderColor = '#8b5cf6';
                target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
              }}
              onBlur={(e) => {
                const target = e.target as HTMLInputElement;
                target.style.borderColor = '#e2e8f0';
                target.style.boxShadow = 'none';
              }}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!isFormValid || loading}
          style={{
            width: '100%',
            padding: '18px 25px',
            borderRadius: '12px',
            color: 'white',
            fontSize: '16px',
            fontWeight: '600',
            border: 'none',
            cursor: (!isFormValid || loading) ? 'not-allowed' : 'pointer',
            background: (!isFormValid || loading) 
              ? 'linear-gradient(45deg, #94a3b8, #64748b)'
              : 'linear-gradient(135deg, #8b5cf6, #7c3aed, #6366f1)',
            boxShadow: (!isFormValid || loading) 
              ? 'none'
              : '0 8px 25px rgba(139, 92, 246, 0.3)',
            transition: 'all 0.3s ease',
            transform: 'scale(1)'
          }}
          onMouseEnter={(e) => {
            if (!(!isFormValid || loading)) {
              const target = e.target as HTMLButtonElement;
              target.style.transform = 'scale(1.02)';
              target.style.boxShadow = '0 12px 35px rgba(139, 92, 246, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!(!isFormValid || loading)) {
              const target = e.target as HTMLButtonElement;
              target.style.transform = 'scale(1)';
              target.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.3)';
            }
          }}
        >
          {loading ? '⏳ Connecting...' : `🚀 Connect to ${integrationService.getIntegrationConfig(selectedPlatform).displayName}`}
        </button>
      </form>

      <div style={{
        marginTop: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: formData.org_id ? '#10b981' : '#cbd5e1',
          boxShadow: formData.org_id ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none',
          transition: 'all 0.3s ease'
        }}></div>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: formData.user_id ? '#10b981' : '#cbd5e1',
          boxShadow: formData.user_id ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none',
          transition: 'all 0.3s ease'
        }}></div>
        <span style={{
          fontSize: '12px',
          color: '#64748b',
          marginLeft: '8px'
        }}>
          {isFormValid ? '✅ Ready to connect' : '📝 Fill in all fields'}
        </span>
      </div>
    </div>
  );
};

export default IntegrationForm;