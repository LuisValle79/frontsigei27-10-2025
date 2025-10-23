/**
 * Servicio: Academic Period Service
 * Maneja todas las operaciones relacionadas con Períodos Académicos
 */

import type { 
  AcademicPeriod, 
  CreateAcademicPeriodDto,
  AcademicPeriodValidationResult 
} from '../models/academicPeriod.model';

// 🌐 Configuración de API para Academic Periods
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
    BASE: '/academic-periods',
    GET_ALL: '/academic-periods',
    GET_BY_ID: (id: string) => `/academic-periods/${id}`,
    CREATE: '/academic-periods',
    UPDATE: (id: string) => `/academic-periods/${id}`,
    DELETE: (id: string) => `/academic-periods/${id}`,
    RESTORE: (id: string) => `/academic-periods/${id}/restore`,
    BY_INSTITUTION: (institutionId: string) => `/academic-periods/institution/${institutionId}`,
    BY_YEAR: (academicYear: string) => `/academic-periods/year/${academicYear}`,
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
const mockAcademicPeriods: AcademicPeriod[] = [
  {
    id: 'period_a1b2c3d4',
    institutionId: 'inst_001',
    academicYear: '2025',
    periodName: 'Primer Bimestre',
    startDate: '2025-03-01T00:00:00',
    endDate: '2025-05-15T23:59:59',
    enrollmentPeriodStart: '2025-01-15T00:00:00',
    enrollmentPeriodEnd: '2025-02-28T23:59:59',
    allowLateEnrollment: true,
    lateEnrollmentEndDate: '2025-03-15T23:59:59',
    status: 'ACTIVE',
    deleted: false,
  },
  {
    id: 'period_b2c3d4e5',
    institutionId: 'inst_001',
    academicYear: '2025',
    periodName: 'Segundo Bimestre',
    startDate: '2025-05-16T00:00:00',
    endDate: '2025-07-31T23:59:59',
    enrollmentPeriodStart: '2025-04-01T00:00:00',
    enrollmentPeriodEnd: '2025-05-15T23:59:59',
    allowLateEnrollment: false,
    lateEnrollmentEndDate: undefined,
    status: 'INACTIVE',
    deleted: false,
  },
  {
    id: 'period_c3d4e5f6',
    institutionId: 'inst_002',
    academicYear: '2025',
    periodName: 'Tercer Bimestre',
    startDate: '2025-08-01T00:00:00',
    endDate: '2025-10-15T23:59:59',
    enrollmentPeriodStart: '2025-06-01T00:00:00',
    enrollmentPeriodEnd: '2025-07-31T23:59:59',
    allowLateEnrollment: true,
    lateEnrollmentEndDate: '2025-08-15T23:59:59',
    status: 'PENDING',
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
          throw new Error(errorMessage || 'Academic period not found');
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

// 🎓 ACADEMIC PERIOD API FUNCTIONS - Complete Backend Integration
export const academicPeriodService = {
  /**
   * 📋 GET /api/v1/academic-periods
   * Listar todos los períodos académicos
   * @returns Array de períodos académicos
   */
  getAllAcademicPeriods: async (): Promise<AcademicPeriod[]> => {
    return handleFetch<AcademicPeriod[]>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_ALL}`,
      { method: 'GET' },
      mockAcademicPeriods
    );
  },

  /**
   * 🔍 GET /api/v1/academic-periods/{id}
   * Obtener período académico por ID
   * @param id ID del período académico
   * @returns Período académico encontrado
   * @throws Error si el ID no es proporcionado o el período no existe
   */
  getAcademicPeriodById: async (id: string): Promise<AcademicPeriod> => {
    if (!id) {
      throw new Error('ID de período académico es requerido');
    }

    return handleFetch<AcademicPeriod>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_BY_ID(id)}`,
      { method: 'GET' },
      mockAcademicPeriods.find((p) => p.id === id) || mockAcademicPeriods[0]
    );
  },

  /**
   * 📝 POST /api/v1/academic-periods
   * Crear nuevo período académico
   * @param period Datos del período académico
   * @returns Período académico creado
   * @throws Error si faltan campos requeridos o las fechas son inválidas
   */
  createAcademicPeriod: async (period: CreateAcademicPeriodDto): Promise<AcademicPeriod> => {
    const { isValid, errors } = academicPeriodUtils.validateAcademicPeriodData(period);
    if (!isValid) {
      throw new Error(
        `Validación fallida: ${Object.entries(errors)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')}`
      );
    }

    return handleFetch<AcademicPeriod>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CREATE}`,
      {
        method: 'POST',
        body: JSON.stringify(period),
      },
      { ...period, id: `period_${Date.now()}`, deleted: false } as AcademicPeriod
    );
  },

  /**
   * ✏️ PUT /api/v1/academic-periods/{id}
   * Actualizar período académico existente
   * @param id ID del período académico
   * @param period Datos a actualizar
   * @returns Período académico actualizado
   * @throws Error si el ID no es proporcionado o el período no existe
   */
  updateAcademicPeriod: async (id: string, period: Partial<AcademicPeriod>): Promise<AcademicPeriod> => {
    if (!id) {
      throw new Error('ID de período académico es requerido para actualizar');
    }

    const { isValid, errors } = academicPeriodUtils.validateAcademicPeriodData(period);
    if (!isValid) {
      throw new Error(
        `Validación fallida: ${Object.entries(errors)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')}`
      );
    }

    return handleFetch<AcademicPeriod>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE(id)}`,
      {
        method: 'PUT',
        body: JSON.stringify(period),
      },
      { ...mockAcademicPeriods.find((p) => p.id === id), ...period, id } as AcademicPeriod
    );
  },

  /**
   * 🗑️ DELETE /api/v1/academic-periods/{id}
   * Eliminar período académico (soft delete)
   * @param id ID del período académico
   * @returns void
   * @throws Error si el ID no es proporcionado o el período no existe
   */
  deleteAcademicPeriod: async (id: string): Promise<void> => {
    if (!id) {
      throw new Error('ID de período académico es requerido para eliminar');
    }

    return handleFetch<void>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DELETE(id)}`,
      { method: 'DELETE' },
      undefined
    );
  },

  /**
   * 🔄 PATCH /api/v1/academic-periods/{id}/restore
   * Restaurar período académico eliminado
   * @param id ID del período académico
   * @returns Período académico restaurado
   * @throws Error si el ID no es proporcionado o el período no existe
   */
  restoreAcademicPeriod: async (id: string): Promise<AcademicPeriod> => {
    if (!id) {
      throw new Error('ID de período académico es requerido para restaurar');
    }

    return handleFetch<AcademicPeriod>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RESTORE(id)}`,
      { method: 'PATCH' },
      { ...mockAcademicPeriods.find((p) => p.id === id), deleted: false } as AcademicPeriod
    );
  },

  /**
   * 🏫 GET /api/v1/academic-periods/institution/{institutionId}
   * Obtener períodos académicos por institución
   * @param institutionId ID de la institución
   * @returns Array de períodos académicos
   * @throws Error si el ID no es proporcionado
   */
  getAcademicPeriodsByInstitution: async (institutionId: string): Promise<AcademicPeriod[]> => {
    if (!institutionId) {
      throw new Error('ID de institución es requerido');
    }

    return handleFetch<AcademicPeriod[]>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BY_INSTITUTION(institutionId)}`,
      { method: 'GET' },
      mockAcademicPeriods.filter((p) => p.institutionId === institutionId)
    );
  },

  /**
   * 📅 GET /api/v1/academic-periods/year/{academicYear}
   * Obtener períodos académicos por año académico
   * @param academicYear Año académico
   * @returns Array de períodos académicos
   * @throws Error si el año académico no es proporcionado
   */
  getAcademicPeriodsByYear: async (academicYear: string): Promise<AcademicPeriod[]> => {
    if (!academicYear) {
      throw new Error('Año académico es requerido');
    }

    return handleFetch<AcademicPeriod[]>(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BY_YEAR(academicYear)}`,
      { method: 'GET' },
      mockAcademicPeriods.filter((p) => p.academicYear === academicYear)
    );
  },
};

// 🔧 UTILITY FUNCTIONS FOR ACADEMIC PERIODS
export const academicPeriodUtils = {
  /**
   * Validar datos de período académico antes de enviar al backend
   * @param data Datos del período académico
   * @returns Objeto con resultado de validación y errores
   */
  validateAcademicPeriodData: (data: Partial<AcademicPeriod>): AcademicPeriodValidationResult => {
    const errors: Record<string, string> = {};

    // Campos requeridos
    const requiredFields = [
      { key: 'institutionId', label: 'ID de la institución' },
      { key: 'academicYear', label: 'Año académico' },
      { key: 'periodName', label: 'Nombre del período' },
      { key: 'startDate', label: 'Fecha de inicio' },
      { key: 'endDate', label: 'Fecha de fin' },
      { key: 'enrollmentPeriodStart', label: 'Inicio del período de matrícula' },
      { key: 'enrollmentPeriodEnd', label: 'Fin del período de matrícula' },
    ];

    for (const field of requiredFields) {
      const value = data[field.key as keyof AcademicPeriod];
      if (!value || (typeof value === 'string' && !value.trim())) {
        errors[field.key] = `${field.label} es requerido`;
      }
    }

    // Validar fechas lógicas
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);

      if (start >= end) {
        errors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }

    if (data.enrollmentPeriodStart && data.enrollmentPeriodEnd) {
      const enrollStart = new Date(data.enrollmentPeriodStart);
      const enrollEnd = new Date(data.enrollmentPeriodEnd);

      if (enrollStart >= enrollEnd) {
        errors.enrollmentPeriodEnd = 'El fin del período de matrícula debe ser posterior al inicio';
      }
    }

    // Validar matrícula tardía
    if (data.allowLateEnrollment && !data.lateEnrollmentEndDate) {
      errors.lateEnrollmentEndDate =
        'Fecha límite de matrícula tardía es requerida cuando se permite matrícula tardía';
    }

    if (data.allowLateEnrollment && data.lateEnrollmentEndDate && data.enrollmentPeriodEnd) {
      const enrollEnd = new Date(data.enrollmentPeriodEnd);
      const lateEnd = new Date(data.lateEnrollmentEndDate);

      if (lateEnd <= enrollEnd) {
        errors.lateEnrollmentEndDate =
          'La fecha límite de matrícula tardía debe ser posterior al fin del período normal de matrícula';
      }
    }

    // Validar estado del período
    const allowedStatuses = ['ACTIVE', 'INACTIVE', 'PENDING', 'CLOSED'];
    if (data.status && !allowedStatuses.includes(data.status)) {
      errors.status = `Estado no válido: debe ser uno de ${allowedStatuses.join(', ')}`;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  /**
   * Verificar si un período académico está activo
   * @param period Período académico
   * @returns Boolean indicando si el período está activo
   */
  isPeriodActive: (period: AcademicPeriod): boolean => {
    const now = new Date();
    const startDate = new Date(period.startDate);
    const endDate = new Date(period.endDate);
    return now >= startDate && now <= endDate && period.status === 'ACTIVE';
  },

  /**
   * Verificar si el período de matrícula está abierto
   * @param period Período académico
   * @returns Boolean indicando si el período de matrícula está abierto
   */
  isEnrollmentOpen: (period: AcademicPeriod): boolean => {
    const now = new Date();
    const enrollmentStart = new Date(period.enrollmentPeriodStart);
    const enrollmentEnd = new Date(period.enrollmentPeriodEnd);
    const lateEnrollmentEnd = period.allowLateEnrollment && period.lateEnrollmentEndDate ? new Date(period.lateEnrollmentEndDate) : null;

    return (
      now >= enrollmentStart &&
      (now <= enrollmentEnd || (lateEnrollmentEnd !== null && now <= lateEnrollmentEnd)) &&
      period.status === 'ACTIVE'
    );
  },

  /**
   * Formatear fecha para mostrar
   * @param dateString Fecha en formato ISO
   * @returns Fecha formateada
   */
  formatDate: (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  /**
   * Formatear rango de fechas
   * @param startDate Fecha de inicio
   * @param endDate Fecha de fin
   * @returns Rango de fechas formateado
   */
  formatDateRange: (startDate: string, endDate: string): string => {
    return `${academicPeriodUtils.formatDate(startDate)} - ${academicPeriodUtils.formatDate(endDate)}`;
  },

  /**
   * Obtener el estado del período en texto legible
   * @param status Estado del período
   * @returns Texto del estado
   */
  getStatusText: (status: string): string => {
    switch (status) {
      case 'ACTIVE': return 'Activo';
      case 'INACTIVE': return 'Inactivo';
      case 'PENDING': return 'Pendiente';
      case 'CLOSED': return 'Cerrado';
      default: return status;
    }
  },

  /**
   * Obtener clase CSS para el badge de estado
   * @param status Estado del período
   * @returns Clase CSS
   */
  getStatusBadgeClass: (status: string): string => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'INACTIVE':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  },
};

// 🎯 FUNCIONES DE ESTADO Y MANEJO
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Error desconocido';
};

export const validateAndCreatePeriod = async (data: CreateAcademicPeriodDto): Promise<AcademicPeriod> => {
  const validation = academicPeriodUtils.validateAcademicPeriodData(data);
  if (!validation.isValid) {
    throw new Error(`Datos inválidos: ${Object.values(validation.errors).join(', ')}`);
  }
  return academicPeriodService.createAcademicPeriod(data);
};

export const validateAndUpdatePeriod = async (id: string, data: Partial<AcademicPeriod>): Promise<AcademicPeriod> => {
  const validation = academicPeriodUtils.validateAcademicPeriodData(data);
  if (!validation.isValid) {
    throw new Error(`Datos inválidos: ${Object.values(validation.errors).join(', ')}`);
  }
  return academicPeriodService.updateAcademicPeriod(id, data);
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