# Módulo de Matrículas Integradas

## Descripción

Este módulo implementa un sistema completo de matrículas que integra con múltiples microservicios para proporcionar una experiencia fluida y validada al crear matrículas de estudiantes.

## Características Principales

### 🔗 Integración de Microservicios
- **Microservicio de Estudiantes** (puerto 8085): Búsqueda y validación de estudiantes
- **Microservicio de Instituciones** (puerto 9080): Gestión de instituciones y aulas
- **Microservicio de Matrículas** (puerto 9082): Creación y gestión de matrículas

### 🎯 Funcionalidades

#### 1. Selección de Estudiante
- Búsqueda por CUI (Código Único de Identificación)
- Búsqueda por ID de estudiante
- Validación de estado activo
- Visualización de datos personales y apoderados

#### 2. Selección de Institución y Aula
- Lista de instituciones activas disponibles
- Información detallada de cada institución
- Selección de aulas con capacidad y disponibilidad
- Validación de pertenencia institución-aula

#### 3. Validación Integrada
- Validación en tiempo real de datos de matrícula
- Verificación de compatibilidad estudiante-institución-aula
- Mensajes de error descriptivos
- Confirmación antes de crear la matrícula

#### 4. Formulario Paso a Paso
- Interfaz guiada en 4 pasos
- Navegación intuitiva
- Validación en cada paso
- Resumen final antes de confirmar

## Estructura de Archivos

```
src/modules/enrollments/
├── components/
│   ├── StudentSelector.tsx           # Selector de estudiantes
│   ├── InstitutionSelector.tsx       # Selector de instituciones y aulas
│   ├── EnrollmentValidation.tsx      # Validación de datos
│   ├── IntegratedEnrollmentForm.tsx  # Formulario principal integrado
│   └── ...
├── models/
│   ├── integration.model.ts          # Modelos de integración
│   └── enrollments.model.ts          # Modelos de matrículas
├── service/
│   ├── Integration.service.tsx       # Servicios de integración
│   └── Enrollment.service.tsx        # Servicios de matrículas
├── pages/
│   ├── IntegratedEnrollmentPage.tsx  # Página principal integrada
│   └── ...
└── routes/
    └── enrollments.routes.tsx        # Rutas del módulo
```

## Configuración

### Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto con:

```env
# Microservicio de Matrículas (Principal)
VITE_ENROLLMENT_API_URL=http://localhost:9082/api/v1

# Microservicio de Estudiantes
VITE_STUDENT_API_URL=http://localhost:8085

# Microservicio de Instituciones
VITE_INSTITUTION_API_URL=http://localhost:9080

# Configuración de desarrollo
VITE_USE_MOCK_DATA=true
```

### Modo de Desarrollo

Para desarrollo sin microservicios activos, establecer:
```env
VITE_USE_MOCK_DATA=true
```

Esto habilitará datos de prueba (mock data) para todas las integraciones.

## Uso

### 1. Acceso a la Funcionalidad

Navegar a: `/enrollments/matriculas/nueva-integrada`

O desde la página principal de matrículas, hacer clic en "Nueva Matrícula Integrada"

### 2. Proceso de Matrícula

#### Paso 1: Seleccionar Estudiante
1. Elegir tipo de búsqueda (CUI o ID)
2. Ingresar el valor y buscar
3. Revisar los datos del estudiante
4. Confirmar selección

#### Paso 2: Seleccionar Institución y Aula
1. Buscar institución por nombre, tipo o distrito
2. Seleccionar institución deseada
3. Elegir aula disponible
4. Verificar capacidad y detalles

#### Paso 3: Validación
1. El sistema valida automáticamente los datos
2. Revisar el resultado de la validación
3. Corregir errores si los hay

#### Paso 4: Completar Datos y Confirmar
1. Llenar información adicional (año académico, turno, etc.)
2. Revisar resumen de la matrícula
3. Confirmar y crear la matrícula

## API Endpoints Utilizados

### Microservicio de Estudiantes
- `GET /api/students/{id}` - Obtener estudiante por ID
- `GET /api/students/cui/{cui}` - Obtener estudiante por CUI

### Microservicio de Instituciones
- `GET /api/v1/institutions/activos` - Instituciones activas
- `GET /api/v1/institutions/{id}` - Detalles de institución
- `GET /api/v1/classrooms/{id}` - Detalles de aula

### Microservicio de Matrículas
- `GET /api/v1/enrollments/validate` - Validar datos de matrícula
- `GET /api/v1/enrollments/institutions/available` - Instituciones disponibles
- `POST /api/v1/enrollments` - Crear matrícula

## Manejo de Errores

### Tipos de Error
1. **Errores de Conexión**: Timeout o servicio no disponible
2. **Errores de Validación**: Datos inválidos o incompatibles
3. **Errores de Negocio**: Estudiante inactivo, aula llena, etc.

### Estrategias de Recuperación
1. **Reintentos Automáticos**: 3 intentos para operaciones críticas
2. **Fallback a Mock Data**: En desarrollo cuando servicios no están disponibles
3. **Mensajes Descriptivos**: Errores claros para el usuario
4. **Botones de Reintento**: Permitir al usuario reintentar operaciones fallidas

## Validaciones Implementadas

### Estudiante
- ✅ Debe existir en el sistema
- ✅ Debe estar activo (status = 'A')
- ✅ Debe pertenecer a la institución seleccionada

### Institución
- ✅ Debe existir y estar activa
- ✅ Debe tener aulas disponibles

### Aula
- ✅ Debe existir y estar activa
- ✅ Debe pertenecer a la institución seleccionada
- ✅ Debe tener capacidad disponible

### Datos de Matrícula
- ✅ Año académico requerido
- ✅ Período académico requerido
- ✅ Turno, sección y modalidad requeridos

## Estilos y UX

### Diseño Responsivo
- ✅ Adaptable a dispositivos móviles
- ✅ Grid flexible para diferentes tamaños de pantalla
- ✅ Navegación optimizada para touch

### Indicadores Visuales
- 🔵 Pasos completados (azul)
- 🟢 Paso actual (verde)
- ⚪ Pasos pendientes (gris)
- ❌ Errores (rojo)
- ✅ Validaciones exitosas (verde)

### Animaciones
- Transiciones suaves entre pasos
- Loading spinners durante operaciones
- Hover effects en elementos interactivos
- Modal de confirmación con animación

## Desarrollo y Mantenimiento

### Agregar Nuevas Validaciones
1. Actualizar `EnrollmentValidation.tsx`
2. Modificar el servicio `enrollmentValidationService`
3. Actualizar los modelos de respuesta

### Agregar Nuevos Campos
1. Actualizar modelos en `integration.model.ts`
2. Modificar componentes de selección
3. Actualizar el formulario principal

### Testing
- Usar mock data para desarrollo: `VITE_USE_MOCK_DATA=true`
- Probar con servicios reales: `VITE_USE_MOCK_DATA=false`
- Verificar manejo de errores desconectando servicios

## Troubleshooting

### Problema: "Error al cargar instituciones"
**Solución**: Verificar que el microservicio de instituciones esté ejecutándose en el puerto 9080

### Problema: "Estudiante no encontrado"
**Solución**: Verificar que el microservicio de estudiantes esté activo y que el CUI/ID sea correcto

### Problema: "Validación fallida"
**Solución**: Revisar que todos los servicios estén activos y que los datos sean consistentes

### Problema: Datos no se cargan
**Solución**: Activar modo mock con `VITE_USE_MOCK_DATA=true` para desarrollo

## Contribución

Para contribuir al módulo:

1. Mantener la estructura de carpetas existente
2. Seguir los patrones de nomenclatura establecidos
3. Documentar nuevas funcionalidades
4. Probar con mock data y servicios reales
5. Mantener la responsividad y accesibilidad