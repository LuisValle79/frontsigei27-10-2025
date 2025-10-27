/**
 * Componente de Prueba de Configuración
 * Para verificar que las variables de entorno estén funcionando correctamente
 */

import React from 'react';
import { INTEGRATION_CONFIG, checkServiceConfiguration } from '../config/integration.config';

export const ConfigTest: React.FC = () => {
  const configCheck = checkServiceConfiguration();

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '2px solid #ccc', 
      padding: '10px', 
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999,
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>🔧 Config Status</h4>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Mock Data:</strong> 
        <span style={{ 
          color: INTEGRATION_CONFIG.USE_MOCK_DATA ? 'green' : 'red',
          marginLeft: '5px'
        }}>
          {INTEGRATION_CONFIG.USE_MOCK_DATA ? '✅ Enabled' : '❌ Disabled'}
        </span>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <strong>Enrollment API:</strong> 
        <div style={{ fontSize: '10px', color: '#666' }}>
          {INTEGRATION_CONFIG.ENROLLMENT_SERVICE_URL}
        </div>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <strong>Student API:</strong> 
        <div style={{ fontSize: '10px', color: '#666' }}>
          {INTEGRATION_CONFIG.STUDENT_SERVICE_URL}
        </div>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <strong>Institution API:</strong> 
        <div style={{ fontSize: '10px', color: '#666' }}>
          {INTEGRATION_CONFIG.INSTITUTION_SERVICE_URL}
        </div>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <strong>Logging:</strong> 
        <span style={{ 
          color: INTEGRATION_CONFIG.ENABLE_LOGGING ? 'blue' : 'gray',
          marginLeft: '5px'
        }}>
          {INTEGRATION_CONFIG.ENABLE_LOGGING ? '📝 On' : '📝 Off'}
        </span>
      </div>

      <div style={{ 
        marginTop: '10px', 
        padding: '5px', 
        background: configCheck.isValid ? '#e8f5e8' : '#ffe8e8',
        borderRadius: '4px'
      }}>
        <strong>Status:</strong> 
        <span style={{ color: configCheck.isValid ? 'green' : 'red', marginLeft: '5px' }}>
          {configCheck.isValid ? '✅ OK' : '❌ Issues'}
        </span>
        {!configCheck.isValid && (
          <div style={{ fontSize: '10px', color: 'red', marginTop: '5px' }}>
            {configCheck.issues.join(', ')}
          </div>
        )}
      </div>

      <div style={{ 
        marginTop: '8px', 
        fontSize: '10px', 
        color: '#666',
        textAlign: 'center'
      }}>
        Refresh page after .env changes
      </div>
    </div>
  );
};

export default ConfigTest;