# Documentación API - Microservicio de Instituciones

## Información General

**Microservicio:** vg-ms-institution-management  
**Puerto:** 9080  
**Base URL:** `http://localhost:9080`  
**Swagger UI:** `http://localhost:9080/swagger-ui.html`  
**API Docs:** `http://localhost:9080/v3/api/-docs`

## Tecnologías
- Spring Boot 3.5.6
- Spring WebFlux (Reactivo)
- MongoDB Reactive
- Java 17
- Lombok

## Estructura de Datos

### Institution (Institución)
```json
{
  "institutionId": "string",
  "status": "ACTIVE | INACTIVE",
  "institutionInformation": {
    "institutionName": "string",
    "codeInstitution": "string",
    "modularCode": "string",
    "institutionType": "string",
    "institutionLevel": "string",
    "gender": "string",
    "slogan": "string",
    "logoUrl": "string"
  },
  "address": {
    "street": "string",
    "district": "string",
    "province": "string",
    "department": "string",
    "postalCode": "string"
  },
  "contactMethods": [
    {
      "type": "string",
      "value": "string"
    }
  ],
  "gradingType": "string",
  "classroomType": "string",
  "schedules": [
    {
      "type": "string",
      "entryTime": "string",
      "exitTime": "string"
    }
  ],
  "classroomIds": ["string"],
  "directorId": "string",
  "auxiliaryIds": ["string"],
  "ugel": "string",
  "dre": "string",
  "createdAt": "2024-01-01T00:00:00",
  "updatedAt": "2024-01-01T00:00:00",
  "deletedAt": "2024-01-01T00:00:00"
}
```

### Classroom (Aula)
```json
{
  "classroomId": "string",
  "institutionId": "string",
  "classroomName": "string",
  "classroomAge": "string",
  "capacity": 30,
  "color": "string",
  "status": "ACTIVE | INACTIVE",
  "createdAt": "2024-01-01T00:00:00",
  "updatedAt": "2024-01-01T00:00:00",
  "deletedAt": "2024-01-01T00:00:00"
}
```

### UserResponse (Usuario)
```json
{
  "userId": "string",
  "firstName": "string",
  "lastName": "string",
  "documentType": "string",
  "documentNumber": "string",
  "phone": "string",
  "email": "string",
  "role": "DIRECTOR | AUXILIAR | ADMIN | PROFESOR",
  "status": "A | I",
  "createdAt": "2024-01-01T00:00:00",
  "updatedAt": "2024-01-01T00:00:00",
  "deletedAt": "2024-01-01T00:00:00"
}
```

## Endpoints Principales para Matrículas

### 1. Obtener Instituciones Activas
**Endpoint:** `GET /api/v1/institutions/activos`  
**Descripción:** Lista todas las instituciones activas con información completa de aulas  
**Uso en Matrículas:** Para mostrar las instituciones disponibles donde se puede matricular un alumno

**Response:**
```json
[
  {
    "institutionId": "string",
    "institutionInformation": {
      "institutionName": "Colegio San José",
      "codeInstitution": "CSJ001",
      "modularCode": "0123456",
      "institutionType": "Privado",
      "institutionLevel": "Inicial-Primaria-Secundaria",
      "gender": "Mixto",
      "slogan": "Educación de calidad",
      "logoUrl": "https://example.com/logo.png"
    },
    "address": {
      "street": "Av. Principal 123",
      "district": "San Isidro",
      "province": "Lima",
      "department": "Lima",
      "postalCode": "15036"
    },
    "contactMethods": [
      {
        "type": "telefono",
        "value": "01-234-5678"
      },
      {
        "type": "email",
        "value": "info@colegiosanjose.edu.pe"
      }
    ],
    "gradingType": "Vigesimal",
    "classroomType": "Presencial",
    "schedules": [
      {
        "type": "Mañana",
        "entryTime": "08:00",
        "exitTime": "13:00"
      }
    ],
    "classrooms": [
      {
        "classroomId": "classroom123",
        "institutionId": "institution123",
        "classroomName": "1° Grado A",
        "classroomAge": "6-7 años",
        "capacity": 25,
        "color": "#FF5733",
        "status": "ACTIVE"
      }
    ],
    "directorId": "director123",
    "auxiliaryIds": ["aux1", "aux2"],
    "ugel": "UGEL 02",
    "dre": "DRELM",
    "status": "ACTIVE",
    "createdAt": "2024-01-01T00:00:00",
    "updatedAt": "2024-01-01T00:00:00"
  }
]
```

### 2. Obtener Institución por ID con Información Completa
**Endpoint:** `GET /api/v1/institutions/{id}`  
**Descripción:** Obtiene una institución específica con información completa de aulas, director y auxiliares  
**Uso en Matrículas:** Para obtener detalles completos de la institución seleccionada

**Response:**
```json
{
  "institutionId": "institution123",
  "institutionInformation": {
    "institutionName": "Colegio San José",
    "codeInstitution": "CSJ001",
    "modularCode": "0123456",
    "institutionType": "Privado",
    "institutionLevel": "Inicial-Primaria-Secundaria",
    "gender": "Mixto",
    "slogan": "Educación de calidad",
    "logoUrl": "https://example.com/logo.png"
  },
  "address": {
    "street": "Av. Principal 123",
    "district": "San Isidro",
    "province": "Lima",
    "department": "Lima",
    "postalCode": "15036"
  },
  "contactMethods": [
    {
      "type": "telefono",
      "value": "01-234-5678"
    }
  ],
  "gradingType": "Vigesimal",
  "classroomType": "Presencial",
  "schedules": [
    {
      "type": "Mañana",
      "entryTime": "08:00",
      "exitTime": "13:00"
    }
  ],
  "classrooms": [
    {
      "classroomId": "classroom123",
      "institutionId": "institution123",
      "classroomName": "1° Grado A",
      "classroomAge": "6-7 años",
      "capacity": 25,
      "color": "#FF5733",
      "status": "ACTIVE"
    }
  ],
  "director": {
    "userId": "director123",
    "firstName": "Juan",
    "lastName": "Pérez García",
    "documentType": "DNI",
    "documentNumber": "12345678",
    "phone": "987654321",
    "email": "director@colegiosanjose.edu.pe",
    "role": "DIRECTOR",
    "status": "A"
  },
  "auxiliaries": [
    {
      "userId": "aux1",
      "firstName": "María",
      "lastName": "López Silva",
      "documentType": "DNI",
      "documentNumber": "87654321",
      "phone": "987654322",
      "email": "auxiliar1@colegiosanjose.edu.pe",
      "role": "AUXILIAR",
      "status": "A"
    }
  ],
  "ugel": "UGEL 02",
  "dre": "DRELM",
  "status": "ACTIVE"
}
```

### 3. Obtener Aulas Activas
**Endpoint:** `GET /api/v1/classrooms/activos`  
**Descripción:** Lista todas las aulas activas  
**Uso en Matrículas:** Para mostrar las aulas disponibles para matrícula

### 4. Obtener Aula por ID
**Endpoint:** `GET /api/v1/classrooms/{id}`  
**Descripción:** Obtiene información específica de un aula  
**Uso en Matrículas:** Para validar capacidad y detalles del aula seleccionada

## Integración en Microservicio de Matrículas

### 1. Dependencias Maven (pom.xml)
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
```

### 2. Configuración WebClient
```java
@Configuration
public class WebClientConfig {
    
    @Bean
    @Qualifier("institutionWebClient")
    public WebClient institutionWebClient() {
        return WebClient.builder()
                .baseUrl("http://localhost:9080")
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }
}
```

### 3. Cliente para Consumir APIs
```java
@Component
@RequiredArgsConstructor
public class InstitutionClient {
    
    @Qualifier("institutionWebClient")
    private final WebClient webClient;
    
    public Flux<InstitutionCompleteResponseDto> getActiveInstitutions() {
        return webClient.get()
                .uri("/api/v1/institutions/activos")
                .retrieve()
                .bodyToFlux(InstitutionCompleteResponseDto.class)
                .onErrorResume(error -> {
                    log.error("Error al obtener instituciones activas: {}", error.getMessage());
                    return Flux.empty();
                });
    }
    
    public Mono<InstitutionWithUsersAndClassroomsResponseDto> getInstitutionById(String institutionId) {
        return webClient.get()
                .uri("/api/v1/institutions/{id}", institutionId)
                .retrieve()
                .bodyToMono(InstitutionWithUsersAndClassroomsResponseDto.class)
                .onErrorResume(error -> {
                    log.error("Error al obtener institución {}: {}", institutionId, error.getMessage());
                    return Mono.empty();
                });
    }
    
    public Mono<Classroom> getClassroomById(String classroomId) {
        return webClient.get()
                .uri("/api/v1/classrooms/{id}", classroomId)
                .retrieve()
                .bodyToMono(Classroom.class)
                .onErrorResume(error -> {
                    log.error("Error al obtener aula {}: {}", classroomId, error.getMessage());
                    return Mono.empty();
                });
    }
    
    public Flux<Classroom> getActiveClassrooms() {
        return webClient.get()
                .uri("/api/v1/classrooms/activos")
                .retrieve()
                .bodyToFlux(Classroom.class)
                .onErrorResume(error -> {
                    log.error("Error al obtener aulas activas: {}", error.getMessage());
                    return Flux.empty();
                });
    }
}
```

### 4. DTOs para tu Microservicio de Matrículas
```java
// Copia estos DTOs a tu proyecto de matrículas
@Data
public class InstitutionCompleteResponseDto {
    private String institutionId;
    private InstitutionInformation institutionInformation;
    private Address address;
    private List<ContactMethod> contactMethods;
    private String gradingType;
    private String classroomType;
    private List<Schedule> schedules;
    private List<Classroom> classrooms;
    private String directorId;
    private List<String> auxiliaryIds;
    private String ugel;
    private String dre;
    private InstitutionStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}

@Data
public class InstitutionWithUsersAndClassroomsResponseDto {
    private String institutionId;
    private InstitutionInformation institutionInformation;
    private Address address;
    private List<ContactMethod> contactMethods;
    private String gradingType;
    private String classroomType;
    private List<Schedule> schedules;
    private List<Classroom> classrooms;
    private UserResponse director;
    private List<UserResponse> auxiliaries;
    private String ugel;
    private String dre;
    private InstitutionStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}

// Modelos de apoyo
@Data
public class InstitutionInformation {
    private String institutionName;
    private String codeInstitution;
    private String modularCode;
    private String institutionType;
    private String institutionLevel;
    private String gender;
    private String slogan;
    private String logoUrl;
}

@Data
public class Address {
    private String street;
    private String district;
    private String province;
    private String department;
    private String postalCode;
}

@Data
public class ContactMethod {
    private String type;
    private String value;
}

@Data
public class Schedule {
    private String type;
    private String entryTime;
    private String exitTime;
}

@Data
public class Classroom {
    private String classroomId;
    private String institutionId;
    private String classroomName;
    private String classroomAge;
    private Integer capacity;
    private String color;
    private ClassroomStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}

@Data
public class UserResponse {
    private String userId;
    private String firstName;
    private String lastName;
    private String documentType;
    private String documentNumber;
    private String phone;
    private String email;
    private String role;
    private char status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}

public enum InstitutionStatus {
    ACTIVE, INACTIVE
}

public enum ClassroomStatus {
    ACTIVE, INACTIVE
}
```

### 5. Servicio de Matrículas con Integración
```java
@Service
@RequiredArgsConstructor
@Slf4j
public class EnrollmentService {
    
    private final InstitutionClient institutionClient;
    
    public Mono<EnrollmentValidationDto> validateEnrollmentData(String institutionId, String classroomId) {
        return Mono.zip(
                institutionClient.getInstitutionById(institutionId),
                institutionClient.getClassroomById(classroomId)
        ).map(tuple -> {
            InstitutionWithUsersAndClassroomsResponseDto institution = tuple.getT1();
            Classroom classroom = tuple.getT2();
            
            return EnrollmentValidationDto.builder()
                    .institutionValid(institution != null && institution.getStatus() == InstitutionStatus.ACTIVE)
                    .classroomValid(classroom != null && classroom.getStatus() == ClassroomStatus.ACTIVE)
                    .institutionName(institution != null ? institution.getInstitutionInformation().getInstitutionName() : null)
                    .classroomName(classroom != null ? classroom.getClassroomName() : null)
                    .classroomCapacity(classroom != null ? classroom.getCapacity() : 0)
                    .build();
        });
    }
    
    public Flux<InstitutionSummaryDto> getAvailableInstitutionsForEnrollment() {
        return institutionClient.getActiveInstitutions()
                .map(institution -> InstitutionSummaryDto.builder()
                        .institutionId(institution.getInstitutionId())
                        .institutionName(institution.getInstitutionInformation().getInstitutionName())
                        .address(institution.getAddress())
                        .availableClassrooms(institution.getClassrooms().size())
                        .build());
    }
}
```

## Integración Frontend

### 1. Servicio Angular/TypeScript
```typescript
// institution.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Institution {
  institutionId: string;
  institutionInformation: {
    institutionName: string;
    codeInstitution: string;
    modularCode: string;
    institutionType: string;
    institutionLevel: string;
    gender: string;
    slogan: string;
    logoUrl: string;
  };
  address: {
    street: string;
    district: string;
    province: string;
    department: string;
    postalCode: string;
  };
  contactMethods: Array<{
    type: string;
    value: string;
  }>;
  gradingType: string;
  classroomType: string;
  schedules: Array<{
    type: string;
    entryTime: string;
    exitTime: string;
  }>;
  classrooms: Classroom[];
  director?: UserResponse;
  auxiliaries?: UserResponse[];
  ugel: string;
  dre: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Classroom {
  classroomId: string;
  institutionId: string;
  classroomName: string;
  classroomAge: string;
  capacity: number;
  color: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface UserResponse {
  userId: string;
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  phone: string;
  email: string;
  role: string;
  status: 'A' | 'I';
}

@Injectable({
  providedIn: 'root'
})
export class InstitutionService {
  private baseUrl = 'http://localhost:9080/api/v1';

  constructor(private http: HttpClient) {}

  getActiveInstitutions(): Observable<Institution[]> {
    return this.http.get<Institution[]>(`${this.baseUrl}/institutions/activos`);
  }

  getInstitutionById(id: string): Observable<Institution> {
    return this.http.get<Institution>(`${this.baseUrl}/institutions/${id}`);
  }

  getActiveClassrooms(): Observable<Classroom[]> {
    return this.http.get<Classroom[]>(`${this.baseUrl}/classrooms/activos`);
  }

  getClassroomById(id: string): Observable<Classroom> {
    return this.http.get<Classroom>(`${this.baseUrl}/classrooms/${id}`);
  }
}
```

### 2. Componente Angular para Selección de Institución
```typescript
// institution-selector.component.ts
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { InstitutionService, Institution } from './institution.service';

@Component({
  selector: 'app-institution-selector',
  template: `
    <div class="institution-selector">
      <h3>Seleccionar Institución</h3>
      <div class="institutions-grid">
        <div 
          *ngFor="let institution of institutions" 
          class="institution-card"
          [class.selected]="selectedInstitution?.institutionId === institution.institutionId"
          (click)="selectInstitution(institution)">
          
          <img [src]="institution.institutionInformation.logoUrl" 
               [alt]="institution.institutionInformation.institutionName"
               class="institution-logo">
          
          <h4>{{ institution.institutionInformation.institutionName }}</h4>
          <p>{{ institution.institutionInformation.institutionLevel }}</p>
          <p>{{ institution.address.district }}, {{ institution.address.province }}</p>
          
          <div class="classrooms-info">
            <span>{{ institution.classrooms.length }} aulas disponibles</span>
          </div>
          
          <div class="schedules">
            <span *ngFor="let schedule of institution.schedules">
              {{ schedule.type }}: {{ schedule.entryTime }} - {{ schedule.exitTime }}
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./institution-selector.component.css']
})
export class InstitutionSelectorComponent implements OnInit {
  institutions: Institution[] = [];
  selectedInstitution: Institution | null = null;
  
  @Output() institutionSelected = new EventEmitter<Institution>();

  constructor(private institutionService: InstitutionService) {}

  ngOnInit() {
    this.loadInstitutions();
  }

  loadInstitutions() {
    this.institutionService.getActiveInstitutions().subscribe({
      next: (institutions) => {
        this.institutions = institutions;
      },
      error: (error) => {
        console.error('Error loading institutions:', error);
      }
    });
  }

  selectInstitution(institution: Institution) {
    this.selectedInstitution = institution;
    this.institutionSelected.emit(institution);
  }
}
```

### 3. CSS para el Componente
```css
/* institution-selector.component.css */
.institution-selector {
  padding: 20px;
}

.institutions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.institution-card {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.institution-card:hover {
  border-color: #2196F3;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.institution-card.selected {
  border-color: #4CAF50;
  background-color: #f8fff8;
}

.institution-logo {
  width: 60px;
  height: 60px;
  object-fit: contain;
  margin-bottom: 10px;
}

.institution-card h4 {
  margin: 10px 0;
  color: #333;
  font-size: 1.2em;
}

.institution-card p {
  margin: 5px 0;
  color: #666;
  font-size: 0.9em;
}

.classrooms-info {
  background: #e3f2fd;
  padding: 8px;
  border-radius: 4px;
  margin: 10px 0;
  text-align: center;
  font-weight: bold;
  color: #1976d2;
}

.schedules {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 10px;
}

.schedules span {
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8em;
  color: #555;
}
```

## Casos de Uso Específicos para Matrículas

### 1. Validación antes de Matrícula
```java
public Mono<Boolean> validateEnrollmentEligibility(String institutionId, String classroomId, int studentAge) {
    return institutionClient.getInstitutionById(institutionId)
            .flatMap(institution -> {
                // Verificar que la institución esté activa
                if (institution.getStatus() != InstitutionStatus.ACTIVE) {
                    return Mono.just(false);
                }
                
                // Buscar el aula específica
                return institution.getClassrooms().stream()
                        .filter(classroom -> classroom.getClassroomId().equals(classroomId))
                        .filter(classroom -> classroom.getStatus() == ClassroomStatus.ACTIVE)
                        .findFirst()
                        .map(classroom -> {
                            // Validar edad apropiada para el aula
                            String ageRange = classroom.getClassroomAge();
                            return validateAgeRange(studentAge, ageRange);
                        })
                        .map(Mono::just)
                        .orElse(Mono.just(false));
            });
}
```

### 2. Obtener Información para Certificados
```java
public Mono<EnrollmentCertificateData> getCertificateData(String institutionId) {
    return institutionClient.getInstitutionById(institutionId)
            .map(institution -> EnrollmentCertificateData.builder()
                    .institutionName(institution.getInstitutionInformation().getInstitutionName())
                    .institutionCode(institution.getInstitutionInformation().getCodeInstitution())
                    .modularCode(institution.getInstitutionInformation().getModularCode())
                    .directorName(institution.getDirector().getFirstName() + " " + institution.getDirector().getLastName())
                    .address(formatAddress(institution.getAddress()))
                    .ugel(institution.getUgel())
                    .dre(institution.getDre())
                    .build());
}
```

## Manejo de Errores

### 1. Configuración de Timeout y Retry
```java
@Component
@RequiredArgsConstructor
public class InstitutionClient {
    
    private final WebClient webClient;
    
    public Mono<InstitutionWithUsersAndClassroomsResponseDto> getInstitutionById(String institutionId) {
        return webClient.get()
                .uri("/api/v1/institutions/{id}", institutionId)
                .retrieve()
                .onStatus(HttpStatus::is4xxClientError, response -> 
                    Mono.error(new InstitutionNotFoundException("Institución no encontrada: " + institutionId)))
                .onStatus(HttpStatus::is5xxServerError, response -> 
                    Mono.error(new InstitutionServiceException("Error en servicio de instituciones")))
                .bodyToMono(InstitutionWithUsersAndClassroomsResponseDto.class)
                .timeout(Duration.ofSeconds(10))
                .retry(3)
                .onErrorResume(error -> {
                    log.error("Error al obtener institución {}: {}", institutionId, error.getMessage());
                    return Mono.empty();
                });
    }
}
```

### 2. Excepciones Personalizadas
```java
public class InstitutionNotFoundException extends RuntimeException {
    public InstitutionNotFoundException(String message) {
        super(message);
    }
}

public class InstitutionServiceException extends RuntimeException {
    public InstitutionServiceException(String message) {
        super(message);
    }
}
```

## Configuración de Propiedades

### application.yml para Microservicio de Matrículas
```yaml
# Configuración de servicios externos
external-services:
  institution-service:
    base-url: http://localhost:9080
    timeout: 10s
    retry-attempts: 3
    
# Configuración de WebClient
webclient:
  connection-timeout: 5000
  read-timeout: 10000
  write-timeout: 10000
```

## Testing

### 1. Test de Integración
```java
@SpringBootTest
@TestMethodOrder(OrderAnnotation.class)
class InstitutionClientIntegrationTest {
    
    @Autowired
    private InstitutionClient institutionClient;
    
    @Test
    @Order(1)
    void shouldGetActiveInstitutions() {
        StepVerifier.create(institutionClient.getActiveInstitutions())
                .expectNextMatches(institution -> 
                    institution.getStatus() == InstitutionStatus.ACTIVE)
                .verifyComplete();
    }
    
    @Test
    @Order(2)
    void shouldGetInstitutionById() {
        String institutionId = "known-institution-id";
        
        StepVerifier.create(institutionClient.getInstitutionById(institutionId))
                .expectNextMatches(institution -> 
                    institution.getInstitutionId().equals(institutionId))
                .verifyComplete();
    }
}
```

### 2. Mock para Tests Unitarios
```java
@ExtendWith(MockitoExtension.class)
class EnrollmentServiceTest {
    
    @Mock
    private InstitutionClient institutionClient;
    
    @InjectMocks
    private EnrollmentService enrollmentService;
    
    @Test
    void shouldValidateEnrollmentData() {
        // Given
        String institutionId = "inst123";
        String classroomId = "class123";
        
        InstitutionWithUsersAndClassroomsResponseDto mockInstitution = createMockInstitution();
        Classroom mockClassroom = createMockClassroom();
        
        when(institutionClient.getInstitutionById(institutionId))
                .thenReturn(Mono.just(mockInstitution));
        when(institutionClient.getClassroomById(classroomId))
                .thenReturn(Mono.just(mockClassroom));
        
        // When & Then
        StepVerifier.create(enrollmentService.validateEnrollmentData(institutionId, classroomId))
                .expectNextMatches(validation -> 
                    validation.isInstitutionValid() && validation.isClassroomValid())
                .verifyComplete();
    }
}
```

Esta documentación te proporciona todo lo necesario para integrar el microservicio de instituciones en tu sistema de matrículas, tanto para el backend como para el frontend.