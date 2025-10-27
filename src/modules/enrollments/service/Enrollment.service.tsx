/**
 * Servicio de Matrículas - Integración completa con Backend
 * Basado en la documentación de API del microservicio de matrículas
 */

import type { Enrollment, CreateEnrollmentDto, UpdateEnrollmentDto } from '../models/enrollments.model';

import { INTEGRATION_CONFIG } from '../config/integration.config';

// 🌐 Configuración de API - Basada en documentación backend
const API_CONFIG = {
  BASE_URL: INTEGRATION_CONFIG.ENROLLMENT_SERVICE_URL,
  TIMEOUT: INTEGRATION_CONFIG.DEFAULT_TIMEOUT,
  RETRIES: INTEGRATION_CONFIG.MAX_RETRIES,
  DEFAULT_HEADERS: INTEGRATION_CONFIG.DEFAULT_HEADERS,
  ENDPOINTS: {
    GET_ALL: '/enrollments',
    GET_BY_ID: (id: string) => `/enrollments/${id}`,
    CREATE: '/enrollments',
    UPDATE: (id: string) => `/enrollments/${id}`,
    DELETE: (id: string) => `/enrollments/${id}`,
    RESTORE: (id: string) => `/enrollments/${id}/restore`,
    BY_INSTITUTION: (institutionId: string) => `/enrollments/institution/${institutionId}`,
    BY_STUDENT: (studentId: string) => `/enrollments/student/${studentId}`,
  },
  DEVELOPMENT: {
    USE_MOCK_DATA: INTEGRATION_CONFIG.USE_MOCK_DATA,
    LOG_REQUESTS: INTEGRATION_CONFIG.ENABLE_LOGGING,
    LOG_RESPONSES: INTEGRATION_CONFIG.ENABLE_LOGGING,
  }
};





// Helper function para manejar requests con timeout
const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout: number = API_CONFIG.TIMEOUT
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

// Helper function para manejar requests con reintentos y fallback
const handleRequest = async <T,>(
  endpoint: string,
  options: RequestInit = {},
  mockData?: T,
  retries: number = API_CONFIG.RETRIES
): Promise<T> => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  const method = options.method || 'GET';

  // Mock data desactivado - usar siempre APIs reales
  // if (API_CONFIG.DEVELOPMENT.USE_MOCK_DATA && mockData !== undefined) {
  //   if (API_CONFIG.DEVELOPMENT.LOG_REQUESTS) {
  //     console.log(`🔧 Using mock data for ${url}:`, mockData);
  //   }
  //   return Promise.resolve(mockData);
  // }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (API_CONFIG.DEVELOPMENT.LOG_REQUESTS) {
        console.log(`🚀 API Request (Attempt ${attempt}): ${method} ${url}`);
      }

      const response = await fetchWithTimeout(url, {
        ...options,
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          ...options.headers,
        },
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        let errorData: any = null;

        try {
          errorData = await response.json();
          errorMessage = errorData?.message || errorMessage;
        } catch (e) {
          // Si no se puede parsear el JSON, usar el mensaje por defecto
        }

        if (API_CONFIG.DEVELOPMENT.LOG_RESPONSES) {
          console.error(`❌ API Error: ${response.status} ${url}`, errorData);
        }

        // Manejar diferentes tipos de errores
        if (response.status === 400 && errorData && 'errors' in errorData) {
          const validationErrors = errorData.errors as Record<string, string>;
          const errorMessages = Object.entries(validationErrors)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
          throw new Error(`${errorMessage}: ${errorMessages}`);
        } else if (response.status === 404) {
          throw new Error(errorMessage || 'Recurso no encontrado');
        } else if (response.status === 500) {
          throw new Error(errorMessage || 'Error interno del servidor');
        } else {
          throw new Error(errorMessage);
        }
      }

      // Manejar respuestas 204 No Content
      if (response.status === 204) {
        if (API_CONFIG.DEVELOPMENT.LOG_RESPONSES) {
          console.log(`✅ API Success: ${response.status} No Content`);
        }
        return undefined as T;
      }

      const data = await response.json();
      if (API_CONFIG.DEVELOPMENT.LOG_RESPONSES) {
        console.log(`✅ API Success: ${response.status} ${url}`, data);
      }
      return data;

    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.error(`❌ API Failed for ${url} (Attempt ${attempt}):`, lastError);

      // No usar mock data - solo APIs reales
      // if (attempt === retries && mockData !== undefined && !API_CONFIG.DEVELOPMENT.USE_MOCK_DATA) {
      //   console.warn(`🔄 Falling back to mock data for ${url}:`, mockData);
      //   return mockData;
      // }
    }
  }

  throw lastError || new Error('All retry attempts failed');
};

// 📝 ENROLLMENT API FUNCTIONS - Integración completa con Backend
export const enrollmentService = {
  /**
   * 📋 GET /api/v1/enrollments
   * Listar todas las matrículas
   */
  getAllEnrollments: async (): Promise<Enrollment[]> => {
    return handleRequest<Enrollment[]>(
      API_CONFIG.ENDPOINTS.GET_ALL,
      { method: 'GET' }
    );
  },

  /**
   * 🔍 GET /api/v1/enrollments/{id}
   * Obtener matrícula por ID
   */
  getEnrollmentById: async (id: string): Promise<Enrollment> => {
    if (!id) {
      throw new Error('ID de matrícula es requerido');
    }

    return handleRequest<Enrollment>(
      API_CONFIG.ENDPOINTS.GET_BY_ID(id),
      { method: 'GET' }
    );
  },

  /**
   * 📝 POST /api/v1/enrollments
   * Crear nueva matrícula
   */
  createEnrollment: async (enrollment: CreateEnrollmentDto): Promise<Enrollment> => {
    // Log para debug
    if (API_CONFIG.DEVELOPMENT.LOG_REQUESTS) {
      console.log('🎯 Creating enrollment with config:', {
        useMockData: API_CONFIG.DEVELOPMENT.USE_MOCK_DATA,
        baseUrl: API_CONFIG.BASE_URL,
        enrollment
      });
    }

    // Validar datos antes de enviar
    const { isValid, errors } = enrollmentUtils.validateEnrollmentData(enrollment);
    if (!isValid) {
      throw new Error(
        `Validación fallida: ${Object.entries(errors)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')}`
      );
    }



    return handleRequest<Enrollment>(
      API_CONFIG.ENDPOINTS.CREATE,
      {
        method: 'POST',
        body: JSON.stringify(enrollment),
      }
    );
  },

  /**
   * ✏️ PUT /api/v1/enrollments/{id}
   * Actualizar matrícula existente
   */
  updateEnrollment: async (id: string, enrollment: UpdateEnrollmentDto): Promise<Enrollment> => {
    if (!id) {
      throw new Error('ID de matrícula es requerido para actualizar');
    }

    // Validar datos antes de enviar
    const { isValid, errors } = enrollmentUtils.validateEnrollmentData(enrollment);
    if (!isValid) {
      throw new Error(
        `Validación fallida: ${Object.entries(errors)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')}`
      );
    }



    return handleRequest<Enrollment>(
      API_CONFIG.ENDPOINTS.UPDATE(id),
      {
        method: 'PUT',
        body: JSON.stringify(enrollment),
      }
    );
  },

  /**
   * 🗑️ DELETE /api/v1/enrollments/{id}
   * Eliminar matrícula (soft delete)
   */
  deleteEnrollment: async (id: string): Promise<void> => {
    if (!id) {
      throw new Error('ID de matrícula es requerido para eliminar');
    }

    return handleRequest<void>(
      API_CONFIG.ENDPOINTS.DELETE(id),
      { method: 'DELETE' },
      undefined
    );
  },

  /**
   * 🔄 PATCH /api/v1/enrollments/{id}/restore
   * Restaurar matrícula eliminada
   */
  restoreEnrollment: async (id: string): Promise<Enrollment> => {
    if (!id) {
      throw new Error('ID de matrícula es requerido para restaurar');
    }

    return handleRequest<Enrollment>(
      API_CONFIG.ENDPOINTS.RESTORE(id),
      { method: 'PATCH' }
    );
  },

  /**
   * 🏫 GET /api/v1/enrollments/institution/{institutionId}
   * Obtener matrículas por institución
   */
  getEnrollmentsByInstitution: async (institutionId: string): Promise<Enrollment[]> => {
    if (!institutionId) {
      throw new Error('ID de institución es requerido');
    }

    return handleRequest<Enrollment[]>(
      API_CONFIG.ENDPOINTS.BY_INSTITUTION(institutionId),
      { method: 'GET' }
    );
  },

  /**
   * 👨‍🎓 GET /api/v1/enrollments/student/{studentId}
   * Obtener matrículas por estudiante
   */
  getEnrollmentsByStudent: async (studentId: string): Promise<Enrollment[]> => {
    if (!studentId) {
      throw new Error('ID de estudiante es requerido');
    }

    return handleRequest<Enrollment[]>(
      API_CONFIG.ENDPOINTS.BY_STUDENT(studentId),
      { method: 'GET' }
    );
  },
};



// 🔧 UTILITY FUNCTIONS
export const enrollmentUtils = {
  /**
   * Validar datos de matrícula antes de enviar al backend
   * @param data Datos de la matrícula
   * @returns Objeto con resultado de validación y errores
   */
  validateEnrollmentData: (data: Partial<Enrollment>) => {
    const errors: Record<string, string> = {};

    // Campos requeridos según la documentación de la API
    const requiredFields = [
      { key: 'studentId', label: 'ID del estudiante' },
      { key: 'institutionId', label: 'ID de la institución' },
      { key: 'classroomId', label: 'ID del aula' },
      { key: 'academicYear', label: 'Año académico' },
      { key: 'academicPeriodId', label: 'ID del período académico' },
      { key: 'ageGroup', label: 'Grupo de edad' },
      { key: 'shift', label: 'Turno' },
      { key: 'section', label: 'Sección' },
      { key: 'modality', label: 'Modalidad' },
    ];

    for (const field of requiredFields) {
      const value = data[field.key as keyof Enrollment];
      if (!value || (typeof value === 'string' && !value.trim())) {
        errors[field.key] = `${field.label} es requerido`;
      }
    }

    // Validar valores permitidos según la documentación
    const allowedValues = {
      enrollmentStatus: ['ACTIVE', 'INACTIVE', 'PENDING', 'CANCELLED'],
      enrollmentType: ['NUEVA', 'REINSCRIPCION'],
    };

    for (const [field, values] of Object.entries(allowedValues)) {
      const value = data[field as keyof Enrollment];
      if (value && !values.includes(value as string)) {
        errors[field] = `Valor no válido para ${field}: debe ser uno de ${values.join(', ')}`;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },



  /**
   * Calcular progreso de documentos de una matrícula
   * @param enrollment Matrícula
   * @returns Objeto con número de documentos completados, total y porcentaje
   */
  calculateDocumentProgress: (enrollment: Enrollment) => {
    const documents = [
      enrollment.birthCertificate ?? false,
      enrollment.studentDni ?? false,
      enrollment.guardianDni ?? false,
      enrollment.vaccinationCard ?? false,
      enrollment.disabilityCertificate ?? false,
      enrollment.utilityBill ?? false,
      enrollment.psychologicalReport ?? false,
      enrollment.studentPhoto ?? false,
      enrollment.healthRecord ?? false,
      enrollment.signedEnrollmentForm ?? false,
      enrollment.dniVerification ?? false,
    ];

    const completed = documents.filter(Boolean).length;
    const total = documents.length;
    const percentage = Math.round((completed / total) * 100);

    return { completed, total, percentage };
  },


};

// 🎯 FUNCIONES DE UTILIDAD Y HELPERS

/**
 * Función helper para manejar errores de API de forma consistente
 */
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Error desconocido';
};

/**
 * Función para validar y crear matrícula
 */
export const validateAndCreate = async (data: CreateEnrollmentDto): Promise<Enrollment> => {
  const validation = enrollmentUtils.validateEnrollmentData(data);
  if (!validation.isValid) {
    throw new Error(`Datos inválidos: ${Object.values(validation.errors).join(', ')}`);
  }
  return enrollmentService.createEnrollment(data);
};

/**
 * Función para validar y actualizar matrícula
 */
export const validateAndUpdate = async (id: string, data: UpdateEnrollmentDto): Promise<Enrollment> => {
  const validation = enrollmentUtils.validateEnrollmentData(data);
  if (!validation.isValid) {
    throw new Error(`Datos inválidos: ${Object.values(validation.errors).join(', ')}`);
  }
  return enrollmentService.updateEnrollment(id, data);
};

// 🔄 Compatibilidad con versiones anteriores
export const enrollmentsService = enrollmentService;