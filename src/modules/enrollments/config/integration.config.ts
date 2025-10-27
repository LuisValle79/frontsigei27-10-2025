/**
 * Configuración de Integración para Microservicios
 */

export const INTEGRATION_CONFIG = {
  // URLs de los microservicios
  ENROLLMENT_SERVICE_URL: import.meta.env.VITE_ENROLLMENT_API_URL || 'http://localhost:9082/api/v1',
  STUDENT_SERVICE_URL: import.meta.env.VITE_STUDENT_API_URL || 'http://localhost:8085',
  INSTITUTION_SERVICE_URL: import.meta.env.VITE_INSTITUTION_API_URL || 'http://localhost:9080',
  
  // Configuración de desarrollo
  USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA === 'true',
  
  // Configuración de timeouts y reintentos
  DEFAULT_TIMEOUT: 10000,
  MAX_RETRIES: 3,
  
  // Headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Configuración de logging
  ENABLE_LOGGING: import.meta.env.DEV === true,
} as const;

// Función para verificar si los servicios están configurados
export const checkServiceConfiguration = () => {
  const issues: string[] = [];
  
  if (!INTEGRATION_CONFIG.ENROLLMENT_SERVICE_URL) {
    issues.push('VITE_ENROLLMENT_API_URL no está configurada');
  }
  
  if (!INTEGRATION_CONFIG.STUDENT_SERVICE_URL) {
    issues.push('VITE_STUDENT_API_URL no está configurada');
  }
  
  if (!INTEGRATION_CONFIG.INSTITUTION_SERVICE_URL) {
    issues.push('VITE_INSTITUTION_API_URL no está configurada');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    config: INTEGRATION_CONFIG
  };
};

// Función para mostrar información de configuración en consola
export const logConfigurationInfo = () => {
  if (INTEGRATION_CONFIG.ENABLE_LOGGING) {
    console.group('🔧 Configuración de Integración de Microservicios');
    console.log('📊 Servicio de Matrículas:', INTEGRATION_CONFIG.ENROLLMENT_SERVICE_URL);
    console.log('👨‍🎓 Servicio de Estudiantes:', INTEGRATION_CONFIG.STUDENT_SERVICE_URL);
    console.log('🏫 Servicio de Instituciones:', INTEGRATION_CONFIG.INSTITUTION_SERVICE_URL);
    console.log('🧪 Modo Mock Data:', INTEGRATION_CONFIG.USE_MOCK_DATA ? 'Activado' : 'Desactivado');
    console.log('⏱️ Timeout por defecto:', INTEGRATION_CONFIG.DEFAULT_TIMEOUT + 'ms');
    console.log('🔄 Máximo de reintentos:', INTEGRATION_CONFIG.MAX_RETRIES);
    console.groupEnd();
  }
};