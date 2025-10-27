# Documentación de Integración - Microservicio de Estudiantes (vg-ms-students)

## Información General del Servicio

**Nombre del Servicio:** vg-ms-students  
**Puerto:** 8085  
**Base URL:** `http://localhost:8085`  
**Arquitectura:** Reactiva (Spring WebFlux)  
**Base de Datos:** MongoDB  
**Versión Spring Boot:** 3.5.6  

## Endpoints Críticos para Matrículas

### 1. Obtener Estudiante por ID
```http
GET /api/students/{studentId}
```

**Uso en Matrículas:** Validar que el estudiante existe antes de crear una matrícula.

**Respuesta Exitosa:**
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
    "dateOfBirth": "15/03/2010",
    "address": "Av. Siempre Viva 123, Lima",
    "photoPerfil": "https://example.com/photos/student123.jpg",
    "status": "A",
    "institutionId": "inst001",
    "classroomId": "class001",
    "guardians": [
      {
        "relationship": "PADRE",
        "names": "Carlos",
        "lastNames": "Pérez",
        "phone": "+51987654321",
        "documentType": "DNI",
        "documentNumber": "87654321",
        "userId": "user123"
      }
    ]
  },
  "timestamp": "2025-10-26T10:30:00.000Z"
}
```

### 2. Obtener Estudiante por CUI
```http
GET /api/students/cui/{cui}
```

**Uso en Matrículas:** Buscar estudiante por su Código Único de Identificación durante el proceso de matrícula.

### 3. Obtener Estudiantes por Institución
```http
GET /api/students/institution/{institutionId}
```

**Uso en Matrículas:** Listar todos los estudiantes de una institución para procesos masivos de matrícula.

### 4. Obtener Estudiantes por Aula
```http
GET /api/students/classroom/{classroomId}
```

**Uso en Matrículas:** Verificar capacidad del aula y estudiantes ya matriculados.

## Modelo de Datos del Estudiante

### Campos Esenciales para Matrículas

```java
public class Student {
    private String studentId;           // ID único del estudiante
    private String cui;                 // Código Único de Identificación
    private PersonalInfo personalInfo;  // Datos personales
    private LocalDate dateOfBirth;      // Fecha de nacimiento
    private String address;             // Dirección
    private char status;                // Estado: 'A'=Activo, 'I'=Inactivo
    private String institutionId;       // ID de la institución
    private String classroomId;         // ID del aula actual
    private List<Guardian> guardians;   // Lista de apoderados
}
```

### Información Personal (PersonalInfo)
```java
public class PersonalInfo {
    private String names;               // Nombres
    private String lastNames;           // Apellidos
    private DocumentType documentType;  // DNI, CARNET_EXTRANJERIA
    private String documentNumber;      // Número de documento
    private Gender gender;              // MASCULINO, FEMENINO
    private LocalDate dateOfBirth;      // Fecha de nacimiento
}
```

### Apoderado (Guardian)
```java
public class Guardian {
    private String relationship;        // Relación con el estudiante
    private String names;              // Nombres del apoderado
    private String lastNames;          // Apellidos del apoderado
    private String phone;              // Teléfono de contacto
    private String documentType;       // Tipo de documento
    private String documentNumber;     // Número de documento
    private String userId;             // ID del usuario en el sistema
}
```

## Estados del Estudiante

```java
public enum StudentStatus {
    ACTIVE("A", "Activo"),           // Puede ser matriculado
    INACTIVE("I", "Inactivo"),       // No puede ser matriculado
    TRANSFERRED("T", "Transferido"), // Transferido a otra institución
    GRADUATED("G", "Graduado")       // Ya graduado
}
```

## Implementación del Cliente en tu Microservicio de Matrículas

### 1. Dependencias Maven
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
```

### 2. Configuración del WebClient
```java
@Configuration
public class StudentServiceConfig {
    
    @Bean
    @Qualifier("studentWebClient")
    public WebClient studentWebClient() {
        return WebClient.builder()
            .baseUrl("http://localhost:8085")
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .build();
    }
}
```

### 3. Cliente del Servicio de Estudiantes
```java
@Service
@Slf4j
public class StudentServiceClient {
    
    private final WebClient studentWebClient;
    
    public StudentServiceClient(@Qualifier("studentWebClient") WebClient studentWebClient) {
        this.studentWebClient = studentWebClient;
    }
    
    public Mono<StudentResponse> getStudentById(String studentId) {
        return studentWebClient
            .get()
            .uri("/api/students/{id}", studentId)
            .retrieve()
            .onStatus(HttpStatusCode::is4xxClientError, response -> {
                if (response.statusCode() == HttpStatus.NOT_FOUND) {
                    return Mono.error(new StudentNotFoundException("Estudiante no encontrado: " + studentId));
                }
                return Mono.error(new StudentServiceException("Error del cliente: " + response.statusCode()));
            })
            .onStatus(HttpStatusCode::is5xxServerError, response -> 
                Mono.error(new StudentServiceException("Error del servidor: " + response.statusCode())))
            .bodyToMono(StudentResponse.class)
            .timeout(Duration.ofSeconds(10))
            .retry(3);
    }
    
    public Mono<StudentResponse> getStudentByCui(String cui) {
        return studentWebClient
            .get()
            .uri("/api/students/cui/{cui}", cui)
            .retrieve()
            .onStatus(HttpStatusCode::is4xxClientError, response -> {
                if (response.statusCode() == HttpStatus.NOT_FOUND) {
                    return Mono.error(new StudentNotFoundException("Estudiante no encontrado con CUI: " + cui));
                }
                return Mono.error(new StudentServiceException("Error del cliente: " + response.statusCode()));
            })
            .bodyToMono(StudentResponse.class)
            .timeout(Duration.ofSeconds(10))
            .retry(3);
    }
    
    public Flux<StudentResponse> getStudentsByInstitution(String institutionId) {
        return studentWebClient
            .get()
            .uri("/api/students/institution/{institutionId}", institutionId)
            .retrieve()
            .bodyToMono(StudentsListResponse.class)
            .flatMapMany(response -> Flux.fromIterable(response.getData()))
            .timeout(Duration.ofSeconds(15))
            .retry(2);
    }
    
    public Flux<StudentResponse> getStudentsByClassroom(String classroomId) {
        return studentWebClient
            .get()
            .uri("/api/students/classroom/{classroomId}", classroomId)
            .retrieve()
            .bodyToMono(StudentsListResponse.class)
            .flatMapMany(response -> Flux.fromIterable(response.getData()))
            .timeout(Duration.ofSeconds(15))
            .retry(2);
    }
}
```

### 4. DTOs de Respuesta
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentResponse {
    private boolean success;
    private String message;
    private StudentData data;
    private String timestamp;
    private String path;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentsListResponse {
    private boolean success;
    private String message;
    private List<StudentData> data;
    private String timestamp;
    private String path;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentData {
    private String studentId;
    private String cui;
    private PersonalInfoData personalInfo;
    private String dateOfBirth;
    private String address;
    private String photoPerfil;
    private char status;
    private String institutionId;
    private String classroomId;
    private List<GuardianData> guardians;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PersonalInfoData {
    private String names;
    private String lastNames;
    private String documentType;
    private String documentNumber;
    private String gender;
    private String dateOfBirth;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GuardianData {
    private String relationship;
    private String names;
    private String lastNames;
    private String phone;
    private String documentType;
    private String documentNumber;
    private String userId;
}
```

### 5. Excepciones Personalizadas
```java
public class StudentNotFoundException extends RuntimeException {
    public StudentNotFoundException(String message) {
        super(message);
    }
}

public class StudentServiceException extends RuntimeException {
    public StudentServiceException(String message) {
        super(message);
    }
}
```

## Casos de Uso en el Microservicio de Matrículas

### 1. Validación de Estudiante para Matrícula
```java
@Service
public class EnrollmentService {
    
    private final StudentServiceClient studentServiceClient;
    
    public Mono<Enrollment> createEnrollment(CreateEnrollmentRequest request) {
        return studentServiceClient.getStudentById(request.getStudentId())
            .flatMap(studentResponse -> {
                StudentData student = studentResponse.getData();
                
                // Validar que el estudiante esté activo
                if (student.getStatus() != 'A') {
                    return Mono.error(new EnrollmentException("El estudiante no está activo"));
                }
                
                // Validar que pertenezca a la institución correcta
                if (!student.getInstitutionId().equals(request.getInstitutionId())) {
                    return Mono.error(new EnrollmentException("El estudiante no pertenece a esta institución"));
                }
                
                // Crear la matrícula
                return createEnrollmentInternal(request, student);
            });
    }
}
```

### 2. Búsqueda de Estudiante por CUI
```java
public Mono<StudentData> findStudentForEnrollment(String cui) {
    return studentServiceClient.getStudentByCui(cui)
        .map(StudentResponse::getData)
        .filter(student -> student.getStatus() == 'A')
        .switchIfEmpty(Mono.error(new StudentNotFoundException("Estudiante no activo o no encontrado")));
}
```

### 3. Verificación de Capacidad de Aula
```java
public Mono<Boolean> checkClassroomCapacity(String classroomId, int maxCapacity) {
    return studentServiceClient.getStudentsByClassroom(classroomId)
        .count()
        .map(currentCount -> currentCount < maxCapacity);
}
```

## Manejo de Errores y Resilencia

### 1. Circuit Breaker (Opcional)
```java
@Component
public class StudentServiceCircuitBreaker {
    
    private final CircuitBreaker circuitBreaker;
    
    public StudentServiceCircuitBreaker() {
        this.circuitBreaker = CircuitBreaker.ofDefaults("studentService");
    }
    
    public Mono<StudentResponse> getStudentWithCircuitBreaker(String studentId) {
        return Mono.fromSupplier(() -> 
            circuitBreaker.executeSupplier(() -> 
                studentServiceClient.getStudentById(studentId).block()))
            .onErrorResume(Exception.class, ex -> 
                Mono.error(new StudentServiceException("Servicio de estudiantes no disponible")));
    }
}
```

### 2. Caché para Optimización
```java
@Service
@Slf4j
public class CachedStudentService {
    
    private final StudentServiceClient studentServiceClient;
    private final Cache<String, StudentData> studentCache;
    
    public CachedStudentService(StudentServiceClient studentServiceClient) {
        this.studentServiceClient = studentServiceClient;
        this.studentCache = Caffeine.newBuilder()
            .maximumSize(1000)
            .expireAfterWrite(Duration.ofMinutes(30))
            .build();
    }
    
    public Mono<StudentData> getStudentById(String studentId) {
        StudentData cached = studentCache.getIfPresent(studentId);
        if (cached != null) {
            return Mono.just(cached);
        }
        
        return studentServiceClient.getStudentById(studentId)
            .map(StudentResponse::getData)
            .doOnNext(student -> studentCache.put(studentId, student));
    }
}
```

## Configuración de Propiedades

```yaml
# application.yml
student-service:
  base-url: http://localhost:8085
  timeout: 10s
  retry-attempts: 3
  circuit-breaker:
    failure-rate-threshold: 50
    wait-duration-in-open-state: 30s
    sliding-window-size: 10
```

## Pruebas de Integración

### 1. Test del Cliente
```java
@ExtendWith(MockitoExtension.class)
class StudentServiceClientTest {
    
    @Mock
    private WebClient webClient;
    
    @Mock
    private WebClient.RequestHeadersUriSpec requestHeadersUriSpec;
    
    @Mock
    private WebClient.ResponseSpec responseSpec;
    
    @InjectMocks
    private StudentServiceClient studentServiceClient;
    
    @Test
    void shouldGetStudentById() {
        // Given
        String studentId = "123";
        StudentResponse expectedResponse = createMockStudentResponse();
        
        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri("/api/students/{id}", studentId))
            .thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(StudentResponse.class))
            .thenReturn(Mono.just(expectedResponse));
        
        // When
        Mono<StudentResponse> result = studentServiceClient.getStudentById(studentId);
        
        // Then
        StepVerifier.create(result)
            .expectNext(expectedResponse)
            .verifyComplete();
    }
}
```

## Monitoreo y Logging

### 1. Métricas Personalizadas
```java
@Component
public class StudentServiceMetrics {
    
    private final Counter studentRequestsCounter;
    private final Timer studentRequestsTimer;
    
    public StudentServiceMetrics(MeterRegistry meterRegistry) {
        this.studentRequestsCounter = Counter.builder("student_service_requests_total")
            .description("Total requests to student service")
            .register(meterRegistry);
            
        this.studentRequestsTimer = Timer.builder("student_service_requests_duration")
            .description("Duration of requests to student service")
            .register(meterRegistry);
    }
    
    public void incrementRequestCounter() {
        studentRequestsCounter.increment();
    }
    
    public Timer.Sample startTimer() {
        return Timer.start();
    }
}
```

### 2. Logging Estructurado
```java
@Slf4j
@Service
public class StudentServiceClient {
    
    public Mono<StudentResponse> getStudentById(String studentId) {
        log.info("Requesting student data for ID: {}", studentId);
        
        return studentWebClient
            .get()
            .uri("/api/students/{id}", studentId)
            .retrieve()
            .bodyToMono(StudentResponse.class)
            .doOnSuccess(response -> 
                log.info("Successfully retrieved student data for ID: {}", studentId))
            .doOnError(error -> 
                log.error("Failed to retrieve student data for ID: {}, error: {}", 
                    studentId, error.getMessage()));
    }
}
```

## Consideraciones de Seguridad

### 1. Autenticación entre Servicios
```java
@Configuration
public class StudentServiceSecurityConfig {
    
    @Bean
    @Qualifier("studentWebClient")
    public WebClient studentWebClient(@Value("${student-service.api-key}") String apiKey) {
        return WebClient.builder()
            .baseUrl("http://localhost:8085")
            .defaultHeader("X-API-Key", apiKey)
            .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .build();
    }
}
```

## Resumen de Integración

### Endpoints Críticos:
1. `GET /api/students/{id}` - Obtener estudiante por ID
2. `GET /api/students/cui/{cui}` - Buscar por CUI
3. `GET /api/students/institution/{institutionId}` - Estudiantes por institución
4. `GET /api/students/classroom/{classroomId}` - Estudiantes por aula

### Datos Esenciales para Matrículas:
- `studentId`: Identificador único
- `cui`: Código único de identificación
- `personalInfo`: Datos personales completos
- `status`: Estado del estudiante ('A' = Activo)
- `institutionId`: Institución a la que pertenece
- `classroomId`: Aula actual
- `guardians`: Lista de apoderados

### Validaciones Requeridas:
- Estudiante debe existir
- Estudiante debe estar activo (status = 'A')
- Estudiante debe pertenecer a la institución correcta
- Verificar capacidad del aula destino

Esta documentación te proporciona todo lo necesario para integrar el microservicio de estudiantes con tu sistema de matrículas de manera robusta y escalable.