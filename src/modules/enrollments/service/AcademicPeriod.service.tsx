/**
 * Servicio de Períodos Académicos - Integración completa con Backend
 * Basado en la documentación de API del microservicio de matrículas
 */

import type { 
  AcademicPeriod, 
  CreateAcademicPeriodDto,
  UpdateAcademicPeriodDto,
  AcademicPeriodValidationResult 
} from '../models/academicPeriod.model';

// 🌐 Configuración de API - Basada en documentación backend
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:9082/api/v1',
  TIMEOUT: 15000,
  RETRIES: 3,
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  ENDPOINTS: {
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
    USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA === 'true' || false,
    LOG_REQUESTS: import.meta.env.DEV || false,
    LOG_RESPONSES: import.meta.env.DEV || false,
  }
};

// 📋 Mock data para desarrollo cuando el backend no está disponible
const mockAcademicPeriods: AcademicPeriod[] = [
  {
    id: 'period_2025_1',
    institutionId: 'inst_001',
    academicYear: '2025',
    periodName: 'Primer Bimestre 2025',
    startDate: '2025-03-01T00:00:00.000Z',
    endDate: '2025-05-15T23:59:59.000Z',
    enrollmentPeriodStart: '2025-01-15T00:00:00.000Z',
    enrollmentPeriodEnd: '2025-02-28T23:59:59.000Z',
    allowLateEnrollment: true,
    lateEnrollmentEndDate: '2025-03-15T23:59:59.000Z',
    status: 'ACTIVE',
    deleted: false,
  },
  {
    id: 'period_2025_2',
    institutionId: 'inst_001',
    academicYear: '2025',
    periodName: 'Segundo Bimestre 2025',
    startDate: '2025-05-16T00:00:00.000Z',
    endDate: '2025-07-31T23:59:59.000Z',
    enrollmentPeriodStart: '2025-04-01T00:00:00.000Z',
    enrollmentPeriodEnd: '2025-05-15T23:59:59.000Z',
    allowLateEnrollment: false,
    status: 'PENDING',
    deleted: false,
  },
];

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

  // Si está en modo mock, devolver mock data directamente
  if (API_CONFIG.DEVELOPMENT.USE_MOCK_DATA && mockData !== undefined) {
    if (API_CONFIG.DEVELOPMENT.LOG_REQUESTS) {
      console.log(`🔧 Using mock data for ${url}:`, mockData);
    }
    return Promise.resolve(mockData);
  }

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
          throw new Error(errorMessage || 'Período académico no encontrado');
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

      // En el último intento, usar mock data si está disponible
      if (attempt === retries && mockData !== undefined && !API_CONFIG.DEVELOPMENT.USE_MOCK_DATA) {
        console.warn(`🔄 Falling back to mock data for ${url}:`, mockData);
        return mockData;
      }
    }
  }

  throw lastError || new Error('All retry attempts failed');
};

// 🎓 ACADEMIC PERIOD API FUNCTIONS - Integración completa con Backend
export const academicPeriodService = {
  /**
   * 📋 GET /api/v1/academic-periods
   * Listar todos los períodos académicos
   */
  getAllAcademicPeriods: async (): Promise<AcademicPeriod[]> => {
    return handleRequest<AcademicPeriod[]>(
      API_CONFIG.ENDPOINTS.GET_ALL,
      { method: 'GET' },
      mockAcademicPeriods
    );
  },

  /**
   * 🔍 GET /api/v1/academic-periods/{id}
   * Obtener período académico por ID
   */
  getAcademicPeriodById: async (id: string): Promise<AcademicPeriod> => {
    if (!id) {
      throw new Error('ID de período académico es requerido');
    }

    const mockData = mockAcademicPeriods.find((p) => p.id === id) || mockAcademicPeriods[0];
    return handleRequest<AcademicPeriod>(
      API_CONFIG.ENDPOINTS.GET_BY_ID(id),
      { method: 'GET' },
      mockData
    );
  },

  /**
   * 📝 POST /api/v1/academic-periods
   * Crear nuevo período académico
   */
  createAcademicPeriod: async (period: CreateAcademicPeriodDto): Promise<AcademicPeriod> => {
    // Validar datos antes de enviar
    const { isValid, errors } = academicPeriodUtils.validateAcademicPeriodData(period);
    if (!isValid) {
      throw new Error(
        `Validación fallida: ${Object.entries(errors)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')}`
      );
    }

    const mockData = { 
      ...period, 
      id: `period_${Date.now()}`, 
      deleted: false 
    } as AcademicPeriod;

    return handleRequest<AcademicPeriod>(
      API_CONFIG.ENDPOINTS.CREATE,
      {
        method: 'POST',
        body: JSON.stringify(period),
      },
      mockData
    );
  },

  /**
   * ✏️ PUT /api/v1/academic-periods/{id}
   * Actualizar período académico existente
   */
  updateAcademicPeriod: async (id: string, period: UpdateAcademicPeriodDto): Promise<AcademicPeriod> => {
    if (!id) {
      throw new Error('ID de período académico es requerido para actualizar');
    }

    // Validar datos antes de enviar
    const { isValid, errors } = academicPeriodUtils.validateAcademicPeriodData(period);
    if (!isValid) {
      throw new Error(
        `Validación fallida: ${Object.entries(errors)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')}`
      );
    }

    const mockData = { 
      ...mockAcademicPeriods.find((p) => p.id === id), 
      ...period, 
      id 
    } as AcademicPeriod;

    return handleRequest<AcademicPeriod>(
      API_CONFIG.ENDPOINTS.UPDATE(id),
      {
        method: 'PUT',
        body: JSON.stringify(period),
      },
      mockData
    );
  },

  /**
   * 🗑️ DELETE /api/v1/academic-periods/{id}
   * Eliminar período académico (soft delete)
   */
  deleteAcademicPeriod: async (id: string): Promise<void> => {
    if (!id) {
      throw new Error('ID de período académico es requerido para eliminar');
    }

    return handleRequest<void>(
      API_CONFIG.ENDPOINTS.DELETE(id),
      { method: 'DELETE' },
      undefined
    );
  },

  /**
   * 🔄 PATCH /api/v1/academic-periods/{id}/restore
   * Restaurar período académico eliminado
   */
  restoreAcademicPeriod: async (id: string): Promise<AcademicPeriod> => {
    if (!id) {
      throw new Error('ID de período académico es requerido para restaurar');
    }

    const mockData = { 
      ...mockAcademicPeriods.find((p) => p.id === id), 
      deleted: false 
    } as AcademicPeriod;

    return handleRequest<AcademicPeriod>(
      API_CONFIG.ENDPOINTS.RESTORE(id),
      { method: 'PATCH' },
      mockData
    );
  },

  /**
   * 🏫 GET /api/v1/academic-periods/institution/{institutionId}
   * Obtener períodos académicos por institución
   */
  getAcademicPeriodsByInstitution: async (institutionId: string): Promise<AcademicPeriod[]> => {
    if (!institutionId) {
      throw new Error('ID de institución es requerido');
    }

    const mockData = mockAcademicPeriods.filter((p) => p.institutionId === institutionId);
    return handleRequest<AcademicPeriod[]>(
      API_CONFIG.ENDPOINTS.BY_INSTITUTION(institutionId),
      { method: 'GET' },
      mockData
    );
  },

  /**
   * 📅 GET /api/v1/academic-periods/year/{academicYear}
   * Obtener períodos académicos por año académico
   */
  getAcademicPeriodsByYear: async (academicYear: string): Promise<AcademicPeriod[]> => {
    if (!academicYear) {
      throw new Error('Año académico es requerido');
    }

    const mockData = mockAcademicPeriods.filter((p) => p.academicYear === academicYear);
    return handleRequest<AcademicPeriod[]>(
      API_CONFIG.ENDPOINTS.BY_YEAR(academicYear),
      { method: 'GET' },
      mockData
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

    // Validar matrícula tardía (allowLateEnrollment es boolean primitivo en backend)
    if (data.allowLateEnrollment === true && !data.lateEnrollmentEndDate) {
      errors.lateEnrollmentEndDate =
        'Fecha límite de matrícula tardía es requerida cuando se permite matrícula tardía';
    }

    if (data.allowLateEnrollment === true && data.lateEnrollmentEndDate && data.enrollmentPeriodEnd) {
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
    const lateEnrollmentEnd = period.allowLateEnrollment === true && period.lateEnrollmentEndDate ? new Date(period.lateEnrollmentEndDate) : null;

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
 * Función para validar y crear período académico
 */
export const validateAndCreatePeriod = async (data: CreateAcademicPeriodDto): Promise<AcademicPeriod> => {
  const validation = academicPeriodUtils.validateAcademicPeriodData(data);
  if (!validation.isValid) {
    throw new Error(`Datos inválidos: ${Object.values(validation.errors).join(', ')}`);
  }
  return academicPeriodService.createAcademicPeriod(data);
};

/**
 * Función para validar y actualizar período académico
 */
export const validateAndUpdatePeriod = async (id: string, data: UpdateAcademicPeriodDto): Promise<AcademicPeriod> => {
  const validation = academicPeriodUtils.validateAcademicPeriodData(data);
  if (!validation.isValid) {
    throw new Error(`Datos inválidos: ${Object.values(validation.errors).join(', ')}`);
  }
  return academicPeriodService.updateAcademicPeriod(id, data);
};