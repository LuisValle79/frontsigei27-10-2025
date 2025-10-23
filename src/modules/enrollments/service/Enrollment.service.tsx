import type { Enrollment } from '../models/enrollments.model';

// 🌐 Configuración de API integrada
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:9082/api/v1',
  TIMEOUT: 15000,
  RETRIES: 3,
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  ENDPOINTS: {
    ENROLLMENTS: {
      BASE: '/enrollments',
      GET_ALL: '/enrollments',
      GET_BY_ID: (id: string) => `/enrollments/${id}`,
      CREATE: '/enrollments',
      UPDATE: (id: string) => `/enrollments/${id}`,
      DELETE: (id: string) => `/enrollments/${id}`,
      RESTORE: (id: string) => `/enrollments/${id}/restore`,
      BY_INSTITUTION: (institutionId: string) => `/enrollments/institution/${institutionId}`,
      BY_STUDENT: (studentId: string) => `/enrollments/student/${studentId}`,
    },

  },
  DEVELOPMENT: {
    USE_MOCK_DATA: false,
    LOG_REQUESTS: true,
    LOG_RESPONSES: true,
  }
};

// Development flag to skip API calls and use mock data directly
const USE_MOCK_DATA_ONLY = API_CONFIG.DEVELOPMENT.USE_MOCK_DATA;

// Mock data for development when backend is not available
const mockEnrollments: Enrollment[] = [
  {
    id: 'enr_a1b2c3d4',
    studentId: 'std_001',
    institutionId: 'inst_001',
    classroomId: 'cls_001',
    academicYear: '2025',
    academicPeriodId: 'period_2025_1',
    enrollmentDate: '2024-10-15T10:30:00',
    enrollmentStatus: 'ACTIVE',
    enrollmentType: 'NUEVA',
    ageGroup: '3_AÑOS',
    shift: 'MAÑANA',
    section: 'A',
    modality: 'PRESENCIAL',
    educationalLevel: 'INITIAL',
    studentAge: 3,
    enrollmentCode: 'MAT2025001',
    birthCertificate: true,
    studentDni: true,
    guardianDni: false,
    vaccinationCard: true,
    disabilityCertificate: false,
    utilityBill: false,
    psychologicalReport: false,
    studentPhoto: false,
    healthRecord: false,
    signedEnrollmentForm: false,
    dniVerification: false,
    observations: 'Primera matrícula del estudiante',
    previousInstitution: undefined,
    deleted: false,
  },
  {
    id: 'enr_b2c3d4e5',
    studentId: 'std_002',
    institutionId: 'inst_001',
    classroomId: 'cls_002',
    academicYear: '2025',
    academicPeriodId: 'period_2025_1',
    enrollmentDate: '2024-10-16T14:20:00',
    enrollmentStatus: 'ACTIVE',
    enrollmentType: 'REINSCRIPCION',
    ageGroup: '4_AÑOS',
    shift: 'TARDE',
    section: 'B',
    modality: 'PRESENCIAL',
    educationalLevel: 'INITIAL',
    studentAge: 4,
    enrollmentCode: 'MAT2025002',
    birthCertificate: true,
    studentDni: true,
    guardianDni: true,
    vaccinationCard: true,
    disabilityCertificate: false,
    utilityBill: true,
    psychologicalReport: false,
    studentPhoto: true,
    healthRecord: true,
    signedEnrollmentForm: true,
    dniVerification: true,
    observations: 'Reinscripción - Documentos completos',
    previousInstitution: 'inst_002',
    deleted: false,
  },
  {
    id: 'enr_c3d4e5f6',
    studentId: 'std_003',
    institutionId: 'inst_001',
    classroomId: 'cls_003',
    academicYear: '2025',
    academicPeriodId: 'period_2025_1',
    enrollmentDate: '2024-10-17T09:15:00',
    enrollmentStatus: 'PENDING',
    enrollmentType: 'NUEVA',
    ageGroup: '5_AÑOS',
    shift: 'MAÑANA',
    section: 'C',
    modality: 'PRESENCIAL',
    educationalLevel: 'INITIAL',
    studentAge: 5,
    enrollmentCode: 'MAT2025003',
    birthCertificate: true,
    studentDni: false,
    guardianDni: false,
    vaccinationCard: false,
    disabilityCertificate: false,
    utilityBill: false,
    psychologicalReport: false,
    studentPhoto: false,
    healthRecord: false,
    signedEnrollmentForm: false,
    dniVerification: false,
    observations: 'Pendiente de documentos',
    previousInstitution: undefined,
    deleted: false,
  },
];



// Helper function to implement a timeout for fetch requests
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

// Helper function to handle fetch errors and fallback to mock data
const handleFetch = async <T,>(
  url: string,
  options: RequestInit = {},
  mockData?: T,
  retries: number = API_CONFIG.RETRIES
): Promise<T> => {
  // If in development mode with mock data only, skip API call
  if (USE_MOCK_DATA_ONLY && mockData !== undefined) {
    if (API_CONFIG.DEVELOPMENT.LOG_REQUESTS) {
      console.log(`🔧 Using mock data for ${url}:`, mockData);
    }
    return Promise.resolve(mockData);
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (API_CONFIG.DEVELOPMENT.LOG_REQUESTS) {
        console.log(`🚀 API Call (Attempt ${attempt}): ${options.method || 'GET'} ${url}`);
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
        let errors: Record<string, string> | undefined;

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          errors = errorData.errors;
          if (API_CONFIG.DEVELOPMENT.LOG_RESPONSES) {
            console.error(`❌ API Error:`, errorData);
          }
        } catch (e) {
          if (API_CONFIG.DEVELOPMENT.LOG_RESPONSES) {
            console.error(`❌ API Error: ${response.status} ${response.statusText}`);
          }
        }

        if (response.status === 404) {
          throw new Error(errorMessage || 'Resource not found');
        } else if (response.status === 400 && errors) {
          throw new Error(
            `${errorMessage}: ${Object.entries(errors)
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ')}`
          );
        } else if (response.status === 500) {
          throw new Error(errorMessage || 'Internal server error');
        } else {
          throw new Error(errorMessage);
        }
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        if (API_CONFIG.DEVELOPMENT.LOG_RESPONSES) {
          console.log(`✅ API Success: ${response.status} No Content`);
        }
        return undefined as T;
      }

      const data = await response.json();
      if (API_CONFIG.DEVELOPMENT.LOG_RESPONSES) {
        console.log(`✅ API Success:`, data);
      }
      return data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.error(`❌ API Failed for ${url} (Attempt ${attempt}):`, lastError);

      if (attempt === retries && mockData !== undefined && !USE_MOCK_DATA_ONLY) {
        console.warn(`🔄 Falling back to mock data for ${url}:`, mockData);
        return mockData;
      }
    }
  }

  throw lastError || new Error('All retry attempts failed');
};

// 📝 ENROLLMENT API FUNCTIONS - Complete Backend Integration
export const enrollmentService = {
  /**
   * 📋 GET /api/v1/enrollments
   * Listar todas las matrículas
   * @returns Array de matrículas
   */
  getAllEnrollments: async (): Promise<Enrollment[]> => {
    return handleFetch<Enrollment[]>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ENROLLMENTS.GET_ALL}`,
      { method: 'GET' },
      mockEnrollments
    );
  },

  /**
   * 🔍 GET /api/v1/enrollments/{id}
   * Obtener matrícula por ID
   * @param id ID de la matrícula
   * @returns Matrícula encontrada
   * @throws Error si el ID no es proporcionado o la matrícula no existe
   */
  getEnrollmentById: async (id: string): Promise<Enrollment> => {
    if (!id) {
      throw new Error('ID de matrícula es requerido');
    }

    return handleFetch<Enrollment>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ENROLLMENTS.GET_BY_ID(id)}`,
      { method: 'GET' },
      mockEnrollments.find((e) => e.id === id) || mockEnrollments[0]
    );
  },

  /**
   * 📝 POST /api/v1/enrollments
   * Crear nueva matrícula
   * @param enrollment Datos de la matrícula
   * @returns Matrícula creada
   * @throws Error si faltan campos requeridos o los datos son inválidos
   */
  createEnrollment: async (enrollment: Omit<Enrollment, 'id'>): Promise<Enrollment> => {
    const { isValid, errors } = enrollmentUtils.validateEnrollmentData(enrollment);
    if (!isValid) {
      throw new Error(
        `Validación fallida: ${Object.entries(errors)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')}`
      );
    }

    return handleFetch<Enrollment>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ENROLLMENTS.CREATE}`,
      {
        method: 'POST',
        body: JSON.stringify(enrollment),
      },
      { ...enrollment, id: `enr_${Date.now()}`, deleted: false } as Enrollment
    );
  },

  /**
   * ✏️ PUT /api/v1/enrollments/{id}
   * Actualizar matrícula existente
   * @param id ID de la matrícula
   * @param enrollment Datos a actualizar
   * @returns Matrícula actualizada
   * @throws Error si el ID no es proporcionado o la matrícula no existe
   */
  updateEnrollment: async (id: string, enrollment: Partial<Enrollment>): Promise<Enrollment> => {
    if (!id) {
      throw new Error('ID de matrícula es requerido para actualizar');
    }

    const { isValid, errors } = enrollmentUtils.validateEnrollmentData(enrollment);
    if (!isValid) {
      throw new Error(
        `Validación fallida: ${Object.entries(errors)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')}`
      );
    }

    return handleFetch<Enrollment>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ENROLLMENTS.UPDATE(id)}`,
      {
        method: 'PUT',
        body: JSON.stringify(enrollment),
      },
      { ...mockEnrollments.find((e) => e.id === id), ...enrollment, id } as Enrollment
    );
  },

  /**
   * 🗑️ DELETE /api/v1/enrollments/{id}
   * Eliminar matrícula (soft delete)
   * @param id ID de la matrícula
   * @returns void
   * @throws Error si el ID no es proporcionado o la matrícula no existe
   */
  deleteEnrollment: async (id: string): Promise<void> => {
    if (!id) {
      throw new Error('ID de matrícula es requerido para eliminar');
    }

    return handleFetch<void>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ENROLLMENTS.DELETE(id)}`,
      { method: 'DELETE' },
      undefined
    );
  },

  /**
   * 🔄 PATCH /api/v1/enrollments/{id}/restore
   * Restaurar matrícula eliminada
   * @param id ID de la matrícula
   * @returns Matrícula restaurada
   * @throws Error si el ID no es proporcionado o la matrícula no existe
   */
  restoreEnrollment: async (id: string): Promise<Enrollment> => {
    if (!id) {
      throw new Error('ID de matrícula es requerido para restaurar');
    }

    return handleFetch<Enrollment>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ENROLLMENTS.RESTORE(id)}`,
      { method: 'PATCH' },
      { ...mockEnrollments.find((e) => e.id === id), deleted: false } as Enrollment
    );
  },

  /**
   * 🏫 GET /api/v1/enrollments/institution/{institutionId}
   * Obtener matrículas por institución
   * @param institutionId ID de la institución
   * @returns Array de matrículas
   * @throws Error si el ID no es proporcionado
   */
  getEnrollmentsByInstitution: async (institutionId: string): Promise<Enrollment[]> => {
    if (!institutionId) {
      throw new Error('ID de institución es requerido');
    }

    return handleFetch<Enrollment[]>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ENROLLMENTS.BY_INSTITUTION(institutionId)}`,
      { method: 'GET' },
      mockEnrollments.filter((e) => e.institutionId === institutionId)
    );
  },

  /**
   * 👨‍🎓 GET /api/v1/enrollments/student/{studentId}
   * Obtener matrículas por estudiante
   * @param studentId ID del estudiante
   * @returns Array de matrículas
   * @throws Error si el ID no es proporcionado
   */
  getEnrollmentsByStudent: async (studentId: string): Promise<Enrollment[]> => {
    if (!studentId) {
      throw new Error('ID de estudiante es requerido');
    }

    return handleFetch<Enrollment[]>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ENROLLMENTS.BY_STUDENT(studentId)}`,
      { method: 'GET' },
      mockEnrollments.filter((e) => e.studentId === studentId)
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

    // Campos requeridos
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

    // Validar valores permitidos
    const allowedValues = {
      enrollmentStatus: ['ACTIVE', 'INACTIVE', 'PENDING'],
      enrollmentType: ['NUEVA', 'REINSCRIPCION'],
      ageGroup: ['3_AÑOS', '4_AÑOS', '5_AÑOS'],
      shift: ['MAÑANA', 'TARDE'],
      modality: ['PRESENCIAL', 'VIRTUAL', 'HIBRIDA'],
      educationalLevel: ['INITIAL', 'PRIMARY', 'SECONDARY'],
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

// 🔧 API CONFIGURATION
export const apiConfig = {
  baseUrl: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  retries: API_CONFIG.RETRIES,

  /**
   * Cambiar entre modo mock y API real
   * @param useMock Activar/desactivar modo mock
   */
  setMockMode: (useMock: boolean) => {
    console.log(`Mock mode ${useMock ? 'enabled' : 'disabled'}`);
    // Nota: USE_MOCK_DATA_ONLY es constante, por lo que este método solo registra el cambio
  },

  /**
   * Verificar disponibilidad del backend
   * @returns Boolean indicando si el backend está disponible
   */
  checkBackendHealth: async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/health`, {
        method: 'GET',
        headers: API_CONFIG.DEFAULT_HEADERS,
      });
      return response.ok;
    } catch (error) {
      console.warn('Backend health check failed:', error);
      return false;
    }
  },
};

// 🎯 FUNCIONES DE ESTADO Y MANEJO (anteriormente en useEnrollmentApi hook)
// Estas funciones pueden ser usadas directamente en los componentes

/**
 * Función para crear un estado de carga simple
 */
export const createLoadingState = <T,>(initialData: T) => {
  return {
    data: initialData,
    loading: false,
    error: null as string | null,
    setLoading: (loading: boolean) => ({ loading }),
    setError: (error: string | null) => ({ error }),
    setData: (data: T) => ({ data, loading: false, error: null })
  };
};

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
 * Función para validar datos antes de enviar
 */
export const validateAndCreate = async (data: Omit<Enrollment, 'id'>) => {
  const validation = enrollmentUtils.validateEnrollmentData(data);
  if (!validation.isValid) {
    throw new Error(`Datos inválidos: ${Object.values(validation.errors).join(', ')}`);
  }
  return enrollmentService.createEnrollment(data);
};

/**
 * Función para validar y actualizar
 */
export const validateAndUpdate = async (id: string, data: Partial<Enrollment>) => {
  const validation = enrollmentUtils.validateEnrollmentData(data);
  if (!validation.isValid) {
    throw new Error(`Datos inválidos: ${Object.values(validation.errors).join(', ')}`);
  }
  return enrollmentService.updateEnrollment(id, data);
};



// Legacy service for backward compatibility
export const enrollmentsService = enrollmentService;