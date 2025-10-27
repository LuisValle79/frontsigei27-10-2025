# Configuración para APIs Reales - Sistema de Matrículas Integrado

## ✅ Cambios Realizados

### 1. Configuración Actualizada
- ✅ **Archivo `.env`:** `VITE_USE_MOCK_DATA=false`
- ✅ **Mock data desactivado** en todos los servicios
- ✅ **URLs de microservicios configuradas** correctamente

### 2. Endpoints Actualizados para APIs Reales

#### Microservicio de Estudiantes (puerto 8085)
- ✅ **Obtener por ID:** `GET http://localhost:8085/api/students/{id}`
- ✅ **Obtener por CUI:** `GET http://localhost:8085/api/students/cui/{cui}`
- ✅ **Validación local** basada en datos obtenidos

#### Microservicio de Instituciones (puerto 9080)
- ✅ **Instituciones activas:** `GET http://localhost:9080/api/v1/institutions/activos`
- ✅ **Institución por ID:** `GET http://localhost:9080/api/v1/institutions/{id}`
- ✅ **Aula por ID:** `GET http://localhost:9080/api/v1/classrooms/{id}`
- ✅ **Aulas activas:** `GET http://localhost:9080/api/v1/classrooms/activos`

#### Microservicio de Matrículas (puerto 9082)
- ✅ **Crear matrícula:** `POST http://localhost:9082/api/v1/enrollments`
- ✅ **Listar matrículas:** `GET http://localhost:9082/api/v1/enrollments`

### 3. Validaciones Implementadas

#### Validación de Estudiante
```typescript
// Verifica que el estudiante:
- Exista en el sistema
- Esté activo (status = 'A')
- Tenga datos personales completos
```

#### Validación de Institución
```typescript
// Verifica que la institución:
- Exista y esté activa (status = 'ACTIVE')
- Tenga aulas disponibles
- Tenga información completa
```

#### Validación de Aula
```typescript
// Verifica que el aula:
- Exista y esté activa (status = 'ACTIVE')
- Pertenezca a la institución seleccionada
- Tenga capacidad disponible
```

## 🔧 Configuración de Microservicios

### Variables de Entorno Requeridas
```env
VITE_USE_MOCK_DATA=false
VITE_ENROLLMENT_API_URL=http://localhost:9082/api/v1
VITE_STUDENT_API_URL=http://localhost:8085
VITE_INSTITUTION_API_URL=http://localhost:9080
```

### Microservicios que Deben Estar Ejecutándose

#### 1. Microservicio de Estudiantes
- **Puerto:** 8085
- **Swagger:** http://localhost:8085/swagger-ui.html
- **Endpoints requeridos:**
  - `GET /api/students/{id}`
  - `GET /api/students/cui/{cui}`

#### 2. Microservicio de Instituciones
- **Puerto:** 9080
- **Swagger:** http://localhost:9080/swagger-ui.html
- **Endpoints requeridos:**
  - `GET /api/v1/institutions/activos`
  - `GET /api/v1/institutions/{id}`
  - `GET /api/v1/classrooms/{id}`
  - `GET /api/v1/classrooms/activos`

#### 3. Microservicio de Matrículas
- **Puerto:** 9082
- **Swagger:** http://localhost:9082/swagger-ui.html
- **Endpoints requeridos:**
  - `POST /api/v1/enrollments`
  - `GET /api/v1/enrollments`

## 📋 Flujo de Datos Real

### 1. Búsqueda de Estudiante
```
Frontend → GET http://localhost:8085/api/students/cui/{cui}
← Respuesta con datos del estudiante
```

### 2. Carga de Instituciones
```
Frontend → GET http://localhost:9080/api/v1/institutions/activos
← Lista de instituciones activas con aulas
```

### 3. Selección de Institución
```
Frontend → GET http://localhost:9080/api/v1/institutions/{id}
← Detalles completos de la institución
```

### 4. Validación Completa
```
Frontend realiza validaciones locales usando:
- Datos del estudiante obtenidos
- Datos de la institución obtenidos
- Datos del aula obtenida
```

### 5. Creación de Matrícula
```
Frontend → POST http://localhost:9082/api/v1/enrollments
Body: {
  studentId, institutionId, classroomId,
  academicYear, academicPeriodId, ...
}
← Matrícula creada exitosamente
```

## 🚨 Manejo de Errores

### Errores de Conectividad
- **Timeout:** 10 segundos por petición
- **Reintentos:** 3 intentos automáticos
- **Fallback:** Mensaje de error descriptivo

### Errores de Validación
- **Estudiante no encontrado:** Mensaje específico
- **Institución inactiva:** Validación local
- **Aula no disponible:** Verificación de capacidad

### Errores de Negocio
- **Estudiante ya matriculado:** Verificación previa
- **Capacidad del aula excedida:** Validación local
- **Datos incompletos:** Validación de formulario

## 🔍 Verificación de Funcionamiento

### 1. Verificar Microservicios
```bash
# Verificar que los servicios respondan
curl http://localhost:8085/api/students/health
curl http://localhost:9080/api/v1/institutions/health
curl http://localhost:9082/api/v1/enrollments/health
```

### 2. Probar Endpoints Individualmente
```bash
# Buscar estudiante por CUI
curl http://localhost:8085/api/students/cui/1234567890123

# Listar instituciones activas
curl http://localhost:9080/api/v1/institutions/activos

# Obtener aulas activas
curl http://localhost:9080/api/v1/classrooms/activos
```

### 3. Logs de Consola
Buscar estos mensajes en la consola del navegador:
- `🚀 Integration Request: GET http://localhost:8085/api/students/...`
- `✅ Successfully retrieved student data`
- `🚀 Integration Request: GET http://localhost:9080/api/v1/institutions/...`

## 📊 Estructura de Datos Esperada

### Respuesta de Estudiante
```json
{
  "success": true,
  "message": "Estudiante encontrado",
  "data": {
    "studentId": "67123abc456def789",
    "cui": "1234567890123",
    "personalInfo": {
      "names": "Juan Carlos",
      "lastNames": "Pérez García",
      "documentType": "DNI",
      "documentNumber": "12345678",
      "gender": "MASCULINO",
      "dateOfBirth": "15/03/2010"
    },
    "status": "A",
    "institutionId": "inst001",
    "classroomId": "class001"
  }
}
```

### Respuesta de Institución
```json
{
  "institutionId": "inst123",
  "status": "ACTIVE",
  "institutionInformation": {
    "institutionName": "Colegio San José",
    "institutionType": "Privado",
    "institutionLevel": "Inicial-Primaria-Secundaria"
  },
  "classrooms": [
    {
      "classroomId": "classroom123",
      "classroomName": "1° Grado A",
      "capacity": 25,
      "status": "ACTIVE"
    }
  ]
}
```

## ✅ Estado Actual

- ✅ **Mock data desactivado**
- ✅ **Endpoints actualizados** para consumir APIs reales
- ✅ **Validaciones locales** implementadas
- ✅ **Manejo de errores** robusto
- ✅ **Timeouts y reintentos** configurados
- ✅ **Logging detallado** para debugging

El sistema ahora está configurado para consumir exclusivamente las APIs reales de los microservicios. Asegúrate de que todos los microservicios estén ejecutándose en los puertos especificados antes de probar la funcionalidad.