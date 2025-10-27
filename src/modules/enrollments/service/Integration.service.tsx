/**
 * Servicio de Integración - Estudiantes e Instituciones
 * Basado en la documentación de integración del microservicio de matrículas
 */

import type {
  StudentResponse,
  InstitutionWithUsersResponse,
  Classroom,
  EnrollmentValidationResponse,
  InstitutionSummary,
  ApiError
} from '../models/integration.model';

import { INTEGRATION_CONFIG, logConfigurationInfo } from '../config/integration.config';

// Inicializar configuración
logConfigurationInfo();





// Helper function para manejar requests con timeout
const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout: number = 10000
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error instanceof Error ? error : new Error('Request failed');
  }
};

// Helper function para manejar requests con fallback a mock data
const handleIntegrationRequest = async <T,>(
  url: string,
  options: RequestInit = {},
  mockData?: T,
  timeout: number = 10000
): Promise<T> => {
  // Si está en modo mock, devolver mock data directamente
  if (INTEGRATION_CONFIG.USE_MOCK_DATA && mockData !== undefined) {
    if (INTEGRATION_CONFIG.ENABLE_LOGGING) {
      console.log(`🔧 Using mock data for ${url}:`, mockData);
    }
    return Promise.resolve(mockData);
  }

  try {
    if (INTEGRATION_CONFIG.ENABLE_LOGGING) {
      console.log(`🚀 Integration Request: ${options.method || 'GET'} ${url}`);
    }

    const response = await fetchWithTimeout(url, {
      ...options,
      headers: {
        ...INTEGRATION_CONFIG.DEFAULT_HEADERS,
        ...options.headers,
      },
    }, timeout);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorData: ApiError | null = null;

      try {
        errorData = await response.json();
        errorMessage = errorData?.message || errorMessage;
      } catch (e) {
        // Si no se puede parsear el JSON, usar el mensaje por defecto
      }

      throw new Error(errorMessage);
    }

    // Manejar respuestas 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error(`❌ Integration Request Failed for ${url}:`, error);
    
    // Fallback a mock data si está disponible
    if (mockData !== undefined && !INTEGRATION_CONFIG.USE_MOCK_DATA) {
      console.warn(`🔄 Falling back to mock data for ${url}:`, mockData);
      return mockData;
    }
    
    throw error instanceof Error ? error : new Error('Integration request failed');
  }
};

// ========================================
// SERVICIOS DE ESTUDIANTES
// ========================================

export const studentIntegrationService = {
  /**
   * Obtener estudiante por ID
   * Endpoint: GET /api/students/{studentId}
   */
  getStudentById: async (studentId: string): Promise<StudentResponse> => {
    if (!studentId) {
      throw new Error('ID de estudiante es requerido');
    }

    const url = `${INTEGRATION_CONFIG.STUDENT_SERVICE_URL}/api/students/${studentId}`;
    return handleIntegrationRequest<StudentResponse>(
      url,
      { method: 'GET' },
      undefined,
      INTEGRATION_CONFIG.DEFAULT_TIMEOUT
    );
  },

  /**
   * Obtener estudiante por CUI
   * Endpoint: GET /api/students/cui/{cui}
   */
  getStudentByCui: async (cui: string): Promise<StudentResponse> => {
    if (!cui) {
      throw new Error('CUI es requerido');
    }

    const url = `${INTEGRATION_CONFIG.STUDENT_SERVICE_URL}/api/students/cui/${cui}`;
    return handleIntegrationRequest<StudentResponse>(
      url,
      { method: 'GET' },
      undefined,
      INTEGRATION_CONFIG.DEFAULT_TIMEOUT
    );
  },

  /**
   * Validar estudiante para institución
   * Endpoint: Validación local basada en datos obtenidos
   */
  validateStudentForInstitution: async (studentId: string, institutionId: string): Promise<boolean> => {
    if (!studentId || !institutionId) {
      throw new Error('ID de estudiante e institución son requeridos');
    }

    try {
      const studentResponse = await studentIntegrationService.getStudentById(studentId);
      if (!studentResponse.success || !studentResponse.data) {
        return false;
      }

      // Validar que el estudiante esté activo
      if (studentResponse.data.status !== 'A') {
        return false;
      }

      // Validar que el estudiante pertenezca a la institución (si ya está matriculado)
      if (studentResponse.data.institutionId && studentResponse.data.institutionId !== institutionId) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating student for institution:', error);
      return false;
    }
  },
};

// ========================================
// SERVICIOS DE INSTITUCIONES
// ========================================

export const institutionIntegrationService = {
  /**
   * Obtener instituciones activas disponibles para matrícula
   * Endpoint: GET /api/v1/institutions/activos
   */
  getAvailableInstitutions: async (): Promise<InstitutionSummary[]> => {
    const url = `${INTEGRATION_CONFIG.INSTITUTION_SERVICE_URL}/api/v1/institutions/activos`;
    
    // Según la documentación, este endpoint devuelve instituciones con aulas incluidas
    const institutions = await handleIntegrationRequest<InstitutionWithUsersResponse[]>(
      url,
      { method: 'GET' },
      undefined,
      INTEGRATION_CONFIG.DEFAULT_TIMEOUT
    );

    // Convertir a formato InstitutionSummary
    return institutions.map(institution => ({
      institutionId: institution.institutionId,
      institutionName: institution.institutionInformation.institutionName,
      institutionType: institution.institutionInformation.institutionType,
      institutionLevel: institution.institutionInformation.institutionLevel,
      address: institution.address,
      availableClassrooms: institution.classrooms ? institution.classrooms.length : 0,
      logoUrl: institution.institutionInformation.logoUrl
    }));
  },

  /**
   * Obtener institución por ID con información completa
   * Endpoint: GET /api/v1/institutions/{institutionId}
   */
  getInstitutionById: async (institutionId: string): Promise<InstitutionWithUsersResponse> => {
    if (!institutionId) {
      throw new Error('ID de institución es requerido');
    }

    const url = `${INTEGRATION_CONFIG.INSTITUTION_SERVICE_URL}/api/v1/institutions/${institutionId}`;

    return handleIntegrationRequest<InstitutionWithUsersResponse>(
      url,
      { method: 'GET' },
      undefined,
      INTEGRATION_CONFIG.DEFAULT_TIMEOUT
    );
  },

  /**
   * Obtener aula por ID
   * Endpoint: GET /api/v1/classrooms/{classroomId}
   */
  getClassroomById: async (classroomId: string): Promise<Classroom> => {
    if (!classroomId) {
      throw new Error('ID de aula es requerido');
    }

    const url = `${INTEGRATION_CONFIG.INSTITUTION_SERVICE_URL}/api/v1/classrooms/${classroomId}`;

    return handleIntegrationRequest<Classroom>(
      url,
      { method: 'GET' },
      undefined,
      INTEGRATION_CONFIG.DEFAULT_TIMEOUT
    );
  },

  /**
   * Obtener aulas activas
   * Endpoint: GET /api/v1/classrooms/activos
   */
  getActiveClassrooms: async (): Promise<Classroom[]> => {
    const url = `${INTEGRATION_CONFIG.INSTITUTION_SERVICE_URL}/api/v1/classrooms/activos`;

    return handleIntegrationRequest<Classroom[]>(
      url,
      { method: 'GET' },
      undefined,
      INTEGRATION_CONFIG.DEFAULT_TIMEOUT
    );
  },

  /**
   * Validar institución y aula
   * Validación local basada en datos obtenidos
   */
  validateInstitutionAndClassroom: async (institutionId: string, classroomId: string): Promise<boolean> => {
    if (!institutionId || !classroomId) {
      throw new Error('ID de institución y aula son requeridos');
    }

    try {
      // Obtener institución y verificar que esté activa
      const institution = await institutionIntegrationService.getInstitutionById(institutionId);
      if (!institution || institution.status !== 'ACTIVE') {
        return false;
      }

      // Obtener aula y verificar que esté activa
      const classroom = await institutionIntegrationService.getClassroomById(classroomId);
      if (!classroom || classroom.status !== 'ACTIVE') {
        return false;
      }

      // Verificar que el aula pertenezca a la institución
      if (classroom.institutionId !== institutionId) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating institution and classroom:', error);
      return false;
    }
  },
};

// ========================================
// SERVICIOS DE VALIDACIÓN DE MATRÍCULA
// ========================================

export const enrollmentValidationService = {
  /**
   * Validar datos completos de matrícula
   * Validación local usando los microservicios individuales
   */
  validateEnrollmentData: async (
    studentId: string,
    institutionId: string,
    classroomId: string
  ): Promise<EnrollmentValidationResponse> => {
    if (!studentId || !institutionId || !classroomId) {
      throw new Error('ID de estudiante, institución y aula son requeridos');
    }

    try {
      // Validar estudiante
      const studentResponse = await studentIntegrationService.getStudentById(studentId);
      const studentValid = studentResponse.success && 
                          studentResponse.data && 
                          integrationUtils.isStudentActive(studentResponse.data.status);

      // Validar institución
      const institution = await institutionIntegrationService.getInstitutionById(institutionId);
      const institutionValid = institution && integrationUtils.isInstitutionActive(institution.status);

      // Validar aula
      const classroom = await institutionIntegrationService.getClassroomById(classroomId);
      const classroomValid = classroom && 
                            integrationUtils.isClassroomActive(classroom.status) &&
                            classroom.institutionId === institutionId;

      const result: EnrollmentValidationResponse = {
        studentValid,
        institutionValid,
        classroomValid,
        studentName: studentValid ? integrationUtils.formatStudentName(studentResponse.data.personalInfo) : undefined,
        institutionName: institutionValid ? institution.institutionInformation.institutionName : undefined,
        classroomName: classroomValid ? classroom.classroomName : undefined,
        classroomCapacity: classroomValid ? classroom.capacity : undefined,
        validationMessage: '',
        valid: studentValid && institutionValid && classroomValid
      };

      // Generar mensaje de validación
      if (!result.valid) {
        const issues = [];
        if (!studentValid) issues.push('estudiante no válido o inactivo');
        if (!institutionValid) issues.push('institución no válida o inactiva');
        if (!classroomValid) issues.push('aula no válida o no pertenece a la institución');
        result.validationMessage = `Problemas encontrados: ${issues.join(', ')}`;
      } else {
        result.validationMessage = 'Todos los datos son válidos para la matrícula';
      }

      return result;
    } catch (error) {
      console.error('Error validating enrollment data:', error);
      return {
        studentValid: false,
        institutionValid: false,
        classroomValid: false,
        validationMessage: 'Error al validar datos: ' + (error instanceof Error ? error.message : 'Error desconocido'),
        valid: false
      };
    }
  },
};

// ========================================
// UTILIDADES DE INTEGRACIÓN
// ========================================

export const integrationUtils = {
  /**
   * Formatear nombre completo del estudiante
   */
  formatStudentName: (personalInfo: { names: string; lastNames: string }): string => {
    return `${personalInfo.names} ${personalInfo.lastNames}`.trim();
  },

  /**
   * Formatear dirección completa
   */
  formatAddress: (address: { street: string; district: string; province: string; department: string }): string => {
    return `${address.street}, ${address.district}, ${address.province}, ${address.department}`;
  },

  /**
   * Verificar si un estudiante está activo
   */
  isStudentActive: (status: string): boolean => {
    return status === 'A';
  },

  /**
   * Verificar si una institución está activa
   */
  isInstitutionActive: (status: string): boolean => {
    return status === 'ACTIVE';
  },

  /**
   * Verificar si un aula está activa
   */
  isClassroomActive: (status: string): boolean => {
    return status === 'ACTIVE';
  },

  /**
   * Obtener color de estado
   */
  getStatusColor: (status: string): string => {
    switch (status) {
      case 'A':
      case 'ACTIVE':
        return '#4CAF50'; // Verde
      case 'I':
      case 'INACTIVE':
        return '#F44336'; // Rojo
      case 'T':
        return '#FF9800'; // Naranja
      case 'G':
        return '#2196F3'; // Azul
      default:
        return '#9E9E9E'; // Gris
    }
  },

  /**
   * Obtener texto de estado
   */
  getStatusText: (status: string): string => {
    switch (status) {
      case 'A':
        return 'Activo';
      case 'I':
        return 'Inactivo';
      case 'T':
        return 'Transferido';
      case 'G':
        return 'Graduado';
      case 'ACTIVE':
        return 'Activa';
      case 'INACTIVE':
        return 'Inactiva';
      default:
        return 'Desconocido';
    }
  },
};

// Exportar servicios principales
export const integrationService = {
  student: studentIntegrationService,
  institution: institutionIntegrationService,
  validation: enrollmentValidationService,
  utils: integrationUtils,
};