import type {
  Address,
  Classroom,
  ClassroomCreate,
  ContactMethod,
  Institution,
  InstitutionCompleteResponse,
  InstitutionCreateWithUsersRequest,
  InstitutionInformation,
  InstitutionStatus,
  InstitutionUpdateRequest,
  InstitutionWithUsersAndClassroomsResponse,
  Schedule,
  UserCreateRequest,
  UserResponse,
} from '../models/Institution.interface';

// Configuración de la API
const API_BASE_URL = 'http://localhost:9080/api/v1/institutions';
const API_CLASSROOM_URL = 'http://localhost:9080/api/v1/classrooms';

// Servicio para manejar las peticiones HTTP
class InstitutionService {
  // Método privado para hacer peticiones con mejor manejo de errores
  private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    try {
      console.log(`🚀 Haciendo petición a: ${url}`);
      console.log('📋 Opciones:', options);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
      });

      console.log(`📡 Respuesta del servidor: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error del servidor:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}${errorText ? ` - ${errorText}` : ''}`);
      }

      const data = await response.json();
      console.log('✅ Datos recibidos:', data);
      return data;
    } catch (error) {
      console.error('💥 Error en la petición:', error);
      
      // Verificar si es un error de red/CORS
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Error de conexión: Verifica que el backend esté ejecutándose en http://localhost:8080 y que CORS esté configurado correctamente.');
      }
      
      throw error;
    }
  }

  // Listar todas las instituciones con información completa
  async getAllInstitutions(): Promise<InstitutionCompleteResponse[]> {
    return this.makeRequest<InstitutionCompleteResponse[]>(`${API_BASE_URL}`);
  }

  // Listar instituciones activas
  async getActiveInstitutions(): Promise<InstitutionCompleteResponse[]> {
    return this.makeRequest<InstitutionCompleteResponse[]>(`${API_BASE_URL}/activos`);
  }

  // Listar instituciones inactivas
  async getInactiveInstitutions(): Promise<InstitutionCompleteResponse[]> {
    return this.makeRequest<InstitutionCompleteResponse[]>(`${API_BASE_URL}/inactivos`);
  }

  // Obtener institución por ID con información completa
  async getInstitutionById(id: string): Promise<InstitutionWithUsersAndClassroomsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Institución no encontrada');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener institución por ID:', error);
      throw error;
    }
  }

  // Crear institución con usuarios (director y auxiliares)
  async createInstitutionWithUsers(data: InstitutionCreateWithUsersRequest): Promise<Institution> {
    try {
      const response = await fetch(`${API_BASE_URL}/with-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('Datos de entrada inválidos');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al crear institución con usuarios:', error);
      throw error;
    }
  }

  // Listar todas las instituciones con usuarios y aulas completas
  async getAllInstitutionsWithUsersAndClassrooms(): Promise<InstitutionWithUsersAndClassroomsResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/with-users-classrooms`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener instituciones con usuarios y aulas:', error);
      throw error;
    }
  }

  // Actualizar institución
  async updateInstitution(id: string, data: InstitutionUpdateRequest): Promise<Institution> {
    try {
      console.log('Datos enviados al servidor:', JSON.stringify(data, null, 2));
      console.log('ID de institución:', id);
      
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Respuesta del servidor:', response.status, response.statusText);

      if (!response.ok) {
        // Intentar obtener el mensaje de error del servidor
        let errorMessage = 'Error desconocido';
        try {
          const errorData = await response.json();
          console.log('Error del servidor:', errorData);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          const textError = await response.text();
          console.log('Error text del servidor:', textError);
          errorMessage = textError || errorMessage;
        }
        
        if (response.status === 400) {
          throw new Error(`Datos de entrada inválidos: ${errorMessage}`);
        }
        if (response.status === 404) {
          throw new Error('Institución no encontrada');
        }
        throw new Error(`Error ${response.status}: ${errorMessage}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al actualizar institución:', error);
      throw error;
    }
  }

  // Eliminar institución (eliminación lógica)
  async deleteInstitution(id: string): Promise<Institution> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('La institución ya está eliminada');
        }
        if (response.status === 404) {
          throw new Error('Institución no encontrada');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al eliminar institución:', error);
      throw error;
    }
  }

  // Restaurar institución eliminada
  async restoreInstitution(id: string): Promise<Institution> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/restaurar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('La institución no está eliminada');
        }
        if (response.status === 404) {
          throw new Error('Institución no encontrada');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al restaurar institución:', error);
      throw error;
    }
  }

  // Eliminar aula (eliminación lógica)
  async deleteClassroom(institutionId: string, classroomId: string): Promise<void> {
    try {
      const response = await fetch(`${API_CLASSROOM_URL}/${classroomId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('El aula ya está eliminada');
        }
        if (response.status === 404) {
          throw new Error('Aula no encontrada');
        }
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }

      // El endpoint retorna NO_CONTENT (204), no hay body
      return;
    } catch (error) {
      console.error('Error al eliminar aula:', error);
      throw error;
    }
  }

  // Actualizar aula
  async updateClassroom(classroomId: string, data: {
    classroomName: string;
    classroomAge: string;
    capacity: number;
    color: string;
  }): Promise<Classroom> {
    try {
      const response = await fetch(`${API_CLASSROOM_URL}/${classroomId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('Datos de entrada inválidos');
        }
        if (response.status === 404) {
          throw new Error('Aula no encontrada');
        }
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al actualizar aula:', error);
      throw error;
    }
  }

  // Restaurar aula eliminada
  async restoreClassroom(institutionId: string, classroomId: string): Promise<Classroom> {
    try {
      const response = await fetch(`${API_CLASSROOM_URL}/${classroomId}/restaurar`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('El aula no está eliminada');
        }
        if (response.status === 404) {
          throw new Error('Aula no encontrada');
        }
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al restaurar aula:', error);
      throw error;
    }
  }

  // Crear nueva aula
  async createClassroom(data: {
    classroomName: string;
    classroomAge: string;
    capacity: number;
    color: string;
    institutionId: string;
  }): Promise<Classroom> {
    try {
      const response = await fetch(`${API_CLASSROOM_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('Datos de entrada inválidos');
        }
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al crear aula:', error);
      throw error;
    }
  }
}

// Exportar una instancia del servicio
export const institutionService = new InstitutionService();
export default institutionService;