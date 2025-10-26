# Documentación de Comunicación Frontend - Backend

## Tabla de Contenidos
1. [Información General](#información-general)
2. [Configuración del Servidor](#configuración-del-servidor)
3. [Estructura de Respuestas](#estructura-de-respuestas)
4. [Endpoints de Matrículas](#endpoints-de-matrículas)
5. [Endpoints de Períodos Académicos](#endpoints-de-períodos-académicos)
6. [Modelos de Datos](#modelos-de-datos)
7. [Enums](#enums)
8. [Manejo de Errores](#manejo-de-errores)
9. [Ejemplos de Implementación](#ejemplos-de-implementación)

## Información General

Este documento proporciona toda la información necesaria para que el frontend pueda consumir correctamente las APIs del microservicio de matrículas. El servicio está construido con Spring WebFlux y utiliza programación reactiva.

### Tecnologías del Backend
- Java 17
- Spring Boot 3.5.6
- Spring WebFlux (reactivo)
- PostgreSQL (Neon)

### Versión de la API
La versión actual de la API es v1 y todos los endpoints comienzan con `/api/v1`.

## Configuración del Servidor

### Puerto por Defecto
El servidor se ejecuta en el puerto `9082`.

### URL Base
```
http://localhost:9082/api/v1
```

### Headers Requeridos
Para todas las solicitudes POST, PUT y PATCH, se requiere el header:
```
Content-Type: application/json
```

## Estructura de Respuestas

### Respuestas Exitosas
Las respuestas exitosas varían según el endpoint, pero generalmente siguen este formato:

Para operaciones individuales:
```
{
  "id": "string",
  // campos específicos del modelo
}
```

Para colecciones:
```json
[
  {
    "id": "string",
    // campos específicos del modelo
  },
  // más objetos...
]
```

### Respuestas de Error
Todas las respuestas de error siguen esta estructura:
```json
{
  "timestamp": "2023-XX-XXTXX:XX:XX.XXX+00:00",
  "path": "/api/v1/resource",
  "status": 400,
  "error": "Bad Request",
  "message": "Mensaje de error específico",
  "requestId": "XXXXX"
}
```

## Endpoints de Matrículas

### Crear una Matrícula
```
POST /enrollments
```

#### Request Body
```json
{
  "studentId": "string*",
  "institutionId": "string*",
  "classroomId": "string*",
  "academicYear": "string*",
  "academicPeriodId": "string*",
  "enrollmentDate": "2023-01-01T00:00:00",
  "enrollmentStatus": "string",
  "enrollmentType": "string",
  "previousInstitution": "string",
  "observations": "string",
  "ageGroup": "string*",
  "shift": "string*",
  "section": "string*",
  "modality": "string*",
  "educationalLevel": "string",
  "studentAge": 0,
  "enrollmentCode": "string",
  "birthCertificate": true,
  "studentDni": true,
  "guardianDni": true,
  "vaccinationCard": true,
  "disabilityCertificate": true,
  "utilityBill": true,
  "psychologicalReport": true,
  "studentPhoto": true,
  "healthRecord": true,
  "signedEnrollmentForm": true,
  "dniVerification": true
}
```

#### Response
```
{
  "id": "string",
  "studentId": "string",
  "institutionId": "string",
  "classroomId": "string",
  "academicYear": "string",
  "academicPeriodId": "string",
  "enrollmentDate": "2023-01-01T00:00:00",
  "enrollmentStatus": "ACTIVE|INACTIVE|PENDING|CANCELLED",
  "enrollmentType": "NUEVA|REINSCRIPCION",
  "previousInstitution": "string",
  "observations": "string",
  "ageGroup": "string",
  "shift": "string",
  "section": "string",
  "modality": "string",
  "educationalLevel": "string",
  "studentAge": 0,
  "enrollmentCode": "string",
  "birthCertificate": true,
  "studentDni": true,
  "guardianDni": true,
  "vaccinationCard": true,
  "disabilityCertificate": true,
  "utilityBill": true,
  "psychologicalReport": true,
  "studentPhoto": true,
  "healthRecord": true,
  "signedEnrollmentForm": true,
  "dniVerification": true,
  "deleted": false
}
```

### Actualizar una Matrícula
```
PUT /enrollments/{id}
```

#### Request Body
Mismo formato que crear matrícula.

#### Response
Mismo formato que crear matrícula.

### Obtener una Matrícula por ID
```
GET /enrollments/{id}
```

#### Response
Mismo formato que crear matrícula.

### Obtener Todas las Matrículas
```
GET /enrollments
```

#### Response
Array de objetos de matrícula.

### Obtener Matrículas por Institución
```
GET /enrollments/institution/{institutionId}
```

#### Response
Array de objetos de matrícula filtrados por institución.

### Obtener Matrículas por Estudiante
```
GET /enrollments/student/{studentId}
```

#### Response
Array de objetos de matrícula filtrados por estudiante.

### Eliminar una Matrícula (Soft Delete)
```
DELETE /enrollments/{id}
```

#### Response
Código 204 No Content.

### Restaurar una Matrícula
```
PATCH /enrollments/{id}/restore
```

#### Response
Objeto de matrícula restaurado.

## Endpoints de Períodos Académicos

### Crear un Período Académico
```
POST /academic-periods
```

#### Request Body
```json
{
  "institutionId": "string*",
  "academicYear": "string*",
  "periodName": "string*",
  "startDate": "2023-01-01T00:00:00*",
  "endDate": "2023-01-01T00:00:00*",
  "enrollmentPeriodStart": "2023-01-01T00:00:00*",
  "enrollmentPeriodEnd": "2023-01-01T00:00:00*",
  "allowLateEnrollment": true,
  "lateEnrollmentEndDate": "2023-01-01T00:00:00",
  "status": "string"
}
```

#### Response
```json
{
  "id": "string",
  "institutionId": "string",
  "academicYear": "string",
  "periodName": "string",
  "startDate": "2023-01-01T00:00:00",
  "endDate": "2023-01-01T00:00:00",
  "enrollmentPeriodStart": "2023-01-01T00:00:00",
  "enrollmentPeriodEnd": "2023-01-01T00:00:00",
  "allowLateEnrollment": true,
  "lateEnrollmentEndDate": "2023-01-01T00:00:00",
  "status": "ACTIVE|INACTIVE|PENDING|CLOSED",
  "deleted": false
}
```

### Actualizar un Período Académico
```
PUT /academic-periods/{id}
```

#### Request Body
Mismo formato que crear período académico.

#### Response
Mismo formato que crear período académico.

### Obtener un Período Académico por ID
```
GET /academic-periods/{id}
```

#### Response
Mismo formato que crear período académico.

### Obtener Todos los Períodos Académicos
```
GET /academic-periods
```

#### Response
Array de objetos de período académico.

### Obtener Períodos Académicos por Institución
```
GET /academic-periods/institution/{institutionId}
```

#### Response
Array de objetos de período académico filtrados por institución.

### Obtener Períodos Académicos por Año Académico
```
GET /academic-periods/year/{academicYear}
```

#### Response
Array de objetos de período académico filtrados por año académico.

### Eliminar un Período Académico (Soft Delete)
```
DELETE /academic-periods/{id}
```

#### Response
Código 204 No Content.

### Restaurar un Período Académico
```
PATCH /academic-periods/{id}/restore
```

#### Response
Objeto de período académico restaurado.

## Modelos de Datos

### Modelo de Matrícula
```json
{
  "id": "string",
  "studentId": "string",
  "institutionId": "string",
  "classroomId": "string",
  "academicYear": "string",
  "academicPeriodId": "string",
  "enrollmentDate": "datetime",
  "enrollmentStatus": "enum",
  "enrollmentType": "enum",
  "previousInstitution": "string",
  "observations": "string",
  "ageGroup": "string",
  "shift": "string",
  "section": "string",
  "modality": "string",
  "educationalLevel": "string",
  "studentAge": "short",
  "enrollmentCode": "string",
  "birthCertificate": "boolean",
  "studentDni": "boolean",
  "guardianDni": "boolean",
  "vaccinationCard": "boolean",
  "disabilityCertificate": "boolean",
  "utilityBill": "boolean",
  "psychologicalReport": "boolean",
  "studentPhoto": "boolean",
  "healthRecord": "boolean",
  "signedEnrollmentForm": "boolean",
  "dniVerification": "boolean",
  "deleted": "boolean"
}
```

### Modelo de Período Académico
```json
{
  "id": "string",
  "institutionId": "string",
  "academicYear": "string",
  "periodName": "string",
  "startDate": "datetime",
  "endDate": "datetime",
  "enrollmentPeriodStart": "datetime",
  "enrollmentPeriodEnd": "datetime",
  "allowLateEnrollment": "boolean",
  "lateEnrollmentEndDate": "datetime",
  "status": "enum",
  "deleted": "boolean"
}
```

## Enums

### Estados de Matrícula
- `ACTIVE`: Matrícula activa
- `INACTIVE`: Matrícula inactiva
- `PENDING`: Matrícula pendiente
- `CANCELLED`: Matrícula cancelada

### Tipos de Matrícula
- `NUEVA`: Nueva matrícula
- `REINSCRIPCION`: Reinscripción

### Estados de Período Académico
- `ACTIVE`: Período activo
- `INACTIVE`: Período inactivo
- `PENDING`: Período pendiente
- `CLOSED`: Período cerrado

## Manejo de Errores

### Códigos de Estado Comunes
- `200 OK`: Solicitud exitosa
- `201 Created`: Recurso creado exitosamente
- `204 No Content`: Solicitud exitosa sin contenido en la respuesta
- `400 Bad Request`: Solicitud mal formada o datos inválidos
- `404 Not Found`: Recurso no encontrado
- `500 Internal Server Error`: Error interno del servidor

### Validaciones
Los campos marcados con `*` son obligatorios. Si no se proporcionan, se devolverá un error 400 con mensajes específicos.

## Ejemplos de Implementación

### JavaScript/Fetch API

#### Obtener todas las matrículas
```javascript
async function getAllEnrollments() {
  try {
    const response = await fetch('http://localhost:9082/api/v1/enrollments', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    
    const enrollments = await response.json();
    return enrollments;
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    throw error;
  }
}
```

#### Crear una nueva matrícula
```javascript
async function createEnrollment(enrollmentData) {
  try {
    const response = await fetch('http://localhost:9082/api/v1/enrollments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(enrollmentData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const enrollment = await response.json();
    return enrollment;
  } catch (error) {
    console.error('Error creating enrollment:', error);
    throw error;
  }
}
```

#### Actualizar una matrícula
```javascript
async function updateEnrollment(id, enrollmentData) {
  try {
    const response = await fetch(`http://localhost:9082/api/v1/enrollments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(enrollmentData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const enrollment = await response.json();
    return enrollment;
  } catch (error) {
    console.error('Error updating enrollment:', error);
    throw error;
  }
}
```

#### Eliminar una matrícula
```javascript
async function deleteEnrollment(id) {
  try {
    const response = await fetch(`http://localhost:9082/api/v1/enrollments/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting enrollment:', error);
    throw error;
  }
}
```

### Axios (JavaScript)

#### Configuración básica
``javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:9082/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});
```

#### Obtener todas las matrículas
```javascript
async function getAllEnrollments() {
  try {
    const response = await apiClient.get('/enrollments');
    return response.data;
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    throw error;
  }
}
```

#### Crear una nueva matrícula
```javascript
async function createEnrollment(enrollmentData) {
  try {
    const response = await apiClient.post('/enrollments', enrollmentData);
    return response.data;
  } catch (error) {
    console.error('Error creating enrollment:', error);
    throw error;
  }
}
```

## Solución de Problemas Comunes

### Error 404 - Endpoint no encontrado

Si recibes un error 404 como el siguiente:
```
{
  "timestamp": "2025-10-24T23:06:24.807+00:00",
  "path": "/api/v1/enrollments",
  "status": 404,
  "error": "Not Found",
  "message": "No static resource api/v1/enrollments."
}
```

Verifica lo siguiente:

1. **Asegúrate de que la aplicación está corriendo**:
   - Ejecuta `mvn spring-boot:run` en la raíz del proyecto
   - Confirma que la aplicación se inicia sin errores
   - Verifica que el log muestra "Started EnrollmentsApplication"

2. **Verifica el puerto correcto**:
   - El puerto por defecto es 9082
   - Confirma en la consola que el servidor se inicia en el puerto correcto:
     ```
     Netty started on port 9082 (http)
     ```

3. **Verifica la URL completa**:
   - Asegúrate de usar la URL completa: `http://localhost:9082/api/v1/enrollments`
   - No uses rutas incompletas como `/api/v1/enrollments` sin el protocolo y host

4. **Verifica que los controladores estén correctamente anotados**:
   - Los controladores deben tener `@RestController`
   - Deben tener la anotación `@RequestMapping` con la ruta correcta

### Error de CORS

Si encuentras errores de CORS en el navegador, verifica que:

1. El backend tiene configurado el CORS correctamente (ya está implementado)
2. Estás usando el puerto correcto (9082)
3. Tu frontend está haciendo la solicitud desde un origen permitido:
   - http://localhost:3000 (React)
   - http://localhost:5173 (Vite)
   - http://localhost:4200 (Angular)
   - http://localhost:8081 (Vue)

### Error 400 - Solicitud incorrecta

Si recibes un error 400, generalmente es debido a:

1. **Datos faltantes requeridos**:
   - Verifica que todos los campos marcados con `*` estén presentes
   - Revisa los mensajes de error específicos en la respuesta

2. **Formato de datos incorrecto**:
   - Asegúrate de enviar fechas en formato ISO 8601: `2023-01-01T00:00:00`
   - Verifica que los tipos de datos coincidan (strings, números, booleanos)

### Error 500 - Error interno del servidor

Si recibes un error 500:

1. **Problemas de conexión a la base de datos**:
   - Verifica que las variables de entorno estén configuradas correctamente
   - Confirma que la base de datos PostgreSQL está accesible
   - Revisa los logs del servidor para detalles específicos

2. **Errores en la lógica de negocio**:
   - Revisa los logs del servidor para obtener más detalles
   - Asegúrate de que los IDs referenciados existen en la base de datos

### Error de constraint único en matrículas

Si recibes un error como el siguiente al crear o actualizar una matrícula:
```json
{
  "success": false,
  "message": "Failed to create enrollment: Error creating enrollment: executeMany; SQL [INSERT INTO enrollments (id, student_id, institution_id, classroom_id, academic_year, academic_period_id, enrollment_date, enrollment_status, enrollment_type, observations, age_group, shift, section, modality, educational_level, birth_certificate, student_dni, guardian_dni, vaccination_card, disability_certificate, utility_bill, psychological_report, student_photo, health_record, signed_enrollment_form, dni_verification, deleted) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)]; duplicate key value violates unique constraint \"uq_enrollment_student_period\"",
  "status": 500,
  "error": "Internal Server Error"
}
```

Esto indica que estás violando una constraint única en la base de datos que previene que un estudiante tenga más de una matrícula en el mismo período académico. Esta es una restricción de integridad de datos que funciona correctamente.

Para resolver este problema:

1. **Verifica si ya existe una matrícula**:
   - Usa el endpoint `GET /api/v1/enrollments/student/{studentId}` para verificar si el estudiante ya tiene una matrícula
   - Si existe, actualiza la matrícula existente en lugar de crear una nueva

2. **Usa un período académico diferente**:
   - Asegúrate de que el `academicPeriodId` que estás usando no tenga ya una matrícula para ese estudiante

3. **Para actualizar en lugar de crear**:
   - Usa el endpoint `PUT /api/v1/enrollments/{id}` con el ID de la matrícula existente

### Problemas con operaciones de eliminación

Si tienes problemas al eliminar matrículas:

1. **Eliminación lógica**:
   - Las matrículas no se eliminan físicamente, se marcan como eliminadas
   - Usa el endpoint `DELETE /api/v1/enrollments/{id}` para marcar como eliminada
   - Usa el endpoint `PATCH /api/v1/enrollments/{id}/restore` para restaurar una matrícula eliminada

2. **Verificar si la matrícula existe**:
   - Asegúrate de que el ID de la matrícula que intentas eliminar existe
   - Usa `GET /api/v1/enrollments/{id}` para verificar

---

Esta documentación proporciona toda la información necesaria para que el equipo de frontend pueda integrar correctamente con las APIs del microservicio de matrículas. Para cualquier pregunta adicional, consulte con el equipo de backend.