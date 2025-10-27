# Documentación de Integración - Microservicio de Matrículas

## Información General

**Microservicio:** vg-ms-enrollments  
**Puerto:** 9082  
**Base URL:** `http://localhost:9082`  

## Servicios Integrados

### 1. Microservicio de Estudiantes (vg-ms-students)
- **URL:** http://localhost:8085
- **Endpoints utilizados:**
  - `GET /api/students/{id}` - Obtener estudiante por ID
  - `GET /api/students/cui/{cui}` - Obtener estudiante por CUI

### 2. Microservicio de Instituciones (vg-ms-institution-management)
- **URL:** http://localhost:9080
- **Endpoints utilizados:**
  - `GET /api/v1/institutions/activos` - Obtener instituciones activas
  - `GET /api/v1/institutions/{id}` - Obtener institución por ID
  - `GET /api/v1/classrooms/{id}` - Obtener aula por ID
  - `GET /api/v1/classrooms/activos` - Obtener aulas activas

## Nuevos Endpoints de Matrícula

### 1. Validar Datos de Matrícula
```http
GET /api/v1/enrollments/validate?studentId={studentId}&institutionId={institutionId}&classroomId={classroomId}
```

**Respuesta:**
```json
{
  "studentValid": true,
  "institutionValid": true,
  "classroomValid": true,
  "studentName": "Juan Carlos Pérez García",
  "institutionName": "Colegio San José",
  "classroomName": "1° Grado A",
  "classroomCapacity": 25,
  "validationMessage": "",
  "valid": true
}
```

### 2. Obtener Instituciones Disponibles
```http
GET /api/v1/enrollments/institutions/available
```

**Respuesta:**
```json
[
  {
    "institutionId": "inst123",
    "institutionName": "Colegio San José",
    "institutionType": "Privado",
    "institutionLevel": "Inicial-Primaria-Secundaria",
    "address": {
      "street": "Av. Principal 123",
      "district": "San Isidro",
      "province": "Lima",
      "department": "Lima",
      "postalCode": "15036"
    },
    "availableClassrooms": 5,
    "logoUrl": "https://example.com/logo.png"
  }
]
```

### 3. Crear Matrícula con Validaciones
```http
POST /api/v1/enrollments
```

**Request Body:**
```json
{
  "studentId": "67123abc456def789",
  "institutionId": "inst123",
  "classroomId": "class123",
  "academicYear": "2025",
  "academicPeriodId": "period123",
  "ageGroup": "6-7 años",
  "shift": "Mañana",
  "section": "A",
  "modality": "Presencial",
  "educationalLevel": "INICIAL",
  "studentAge": 6,
  "enrollmentType": "NUEVA",
  "enrollmentStatus": "ACTIVE"
}
```

## Endpoints de Integración Directa

### Estudiantes
- `GET /api/v1/integration/students/{studentId}` - Obtener estudiante por ID
- `GET /api/v1/integration/students/cui/{cui}` - Obtener estudiante por CUI
- `GET /api/v1/integration/validate/student/{studentId}/institution/{institutionId}` - Validar estudiante para institución

### Instituciones
- `GET /api/v1/integration/institutions` - Obtener instituciones activas
- `GET /api/v1/integration/institutions/{institutionId}` - Obtener institución por ID
- `GET /api/v1/integration/classrooms/{classroomId}` - Obtener aula por ID
- `GET /api/v1/integration/classrooms` - Obtener aulas activas
- `GET /api/v1/integration/validate/institution/{institutionId}/classroom/{classroomId}` - Validar institución y aula

## Validaciones Implementadas

### Al Crear una Matrícula:
1. **Validación de Estudiante:**
   - El estudiante debe existir
   - El estudiante debe estar activo (status = 'A')
   - El estudiante debe pertenecer a la institución especificada

2. **Validación de Institución:**
   - La institución debe existir
   - La institución debe estar activa (status = 'ACTIVE')

3. **Validación de Aula:**
   - El aula debe existir
   - El aula debe estar activa (status = 'ACTIVE')
   - El aula debe pertenecer a la institución especificada

## Configuración

### Variables de Entorno
```yaml
external-services:
  student-service:
    base-url: ${STUDENT_SERVICE_URL:http://localhost:8085}
    timeout: 10s
    retry-attempts: 3
  institution-service:
    base-url: ${INSTITUTION_SERVICE_URL:http://localhost:9080}
    timeout: 10s
    retry-attempts: 3
```

### Configuración de WebClient
```yaml
webclient:
  connection-timeout: 5000
  read-timeout: 10000
  write-timeout: 10000
```

## Manejo de Errores

### Errores de Validación:
- **400 Bad Request:** Datos de matrícula inválidos
- **404 Not Found:** Estudiante, institución o aula no encontrados
- **500 Internal Server Error:** Error en servicios externos

### Reintentos y Timeouts:
- **Timeout:** 10 segundos para operaciones individuales
- **Reintentos:** 3 intentos para operaciones críticas
- **Circuit Breaker:** Implementado para servicios externos

## Ejemplo de Uso Completo

### 1. Validar datos antes de crear matrícula
```bash
curl -X GET "http://localhost:9082/api/v1/enrollments/validate?studentId=67123abc456def789&institutionId=inst123&classroomId=class123"
```

### 2. Obtener instituciones disponibles
```bash
curl -X GET "http://localhost:9082/api/v1/enrollments/institutions/available"
```

### 3. Crear matrícula
```bash
curl -X POST "http://localhost:9082/api/v1/enrollments" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "67123abc456def789",
    "institutionId": "inst123",
    "classroomId": "class123",
    "academicYear": "2025",
    "academicPeriodId": "period123",
    "ageGroup": "6-7 años",
    "shift": "Mañana",
    "section": "A",
    "modality": "Presencial",
    "educationalLevel": "INICIAL",
    "studentAge": 6,
    "enrollmentType": "NUEVA",
    "enrollmentStatus": "ACTIVE"
  }'
```

## Logs y Monitoreo

El sistema registra logs detallados para:
- Validaciones de estudiantes e instituciones
- Llamadas a servicios externos
- Errores de integración
- Tiempos de respuesta

Nivel de log recomendado: `DEBUG` para desarrollo, `INFO` para producción.