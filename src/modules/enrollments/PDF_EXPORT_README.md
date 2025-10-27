# 📄 Sistema de Exportación PDF para Matrículas

## 🎯 Descripción

Sistema profesional de exportación de matrículas a PDF con diseño elegante y completo. Genera documentos oficiales con toda la información de matrícula, datos del estudiante, institución y progreso de documentos.

## ✨ Características

### 🎨 Diseño Profesional
- **Encabezado elegante** con colores institucionales
- **Logo placeholder** (personalizable)
- **Tipografía clara** y jerarquizada
- **Tablas organizadas** con colores temáticos
- **Progreso visual** de documentos con barras de progreso
- **Pie de página** con información de generación

### 📊 Contenido Completo
- **Información de Matrícula**: Código, fecha, estado, tipo, modalidad
- **Datos del Estudiante**: Nombres, documento, CUI, fecha de nacimiento, dirección
- **Información Académica**: Año, período, nivel educativo, grupo de edad, turno, sección
- **Documentos Requeridos**: Lista completa con estado de entrega y progreso visual
- **Metadatos**: Fecha de generación, número de página

### 🚀 Funcionalidades
- **Exportación Individual**: PDF de una matrícula específica
- **Exportación Múltiple**: PDF con varias matrículas en un solo documento
- **Exportación Filtrada**: PDF de matrículas que cumplan criterios específicos
- **Descarga Automática**: Archivos con nombres descriptivos
- **Manejo de Errores**: Feedback visual en caso de problemas

## 🛠️ Componentes

### 1. PdfExportService
Servicio principal que maneja la generación de PDFs.

```typescript
// Exportar una matrícula individual
await PdfExportService.generateEnrollmentPdf(enrollmentData);

// Exportar múltiples matrículas
await PdfExportService.generateMultipleEnrollmentsPdf(enrollmentDataArray);
```

### 2. PdfExportButton
Componente React para botones de exportación con diferentes variantes.

```tsx
// Botón para exportar una matrícula
<PdfExportButton
  enrollment={enrollment}
  variant="single"
  size="md"
/>

// Botón para exportar múltiples matrículas
<PdfExportButton
  enrollments={enrollmentList}
  variant="multiple"
  size="lg"
/>

// Botón para exportar matrículas seleccionadas
<PdfExportButton
  enrollments={selectedEnrollments}
  variant="selected"
  size="sm"
/>
```

## 📋 Propiedades del Componente

### PdfExportButton Props

| Prop | Tipo | Descripción | Valores |
|------|------|-------------|---------|
| `enrollment` | `Enrollment` | Matrícula individual (para variant="single") | - |
| `enrollments` | `Enrollment[]` | Array de matrículas (para variant="multiple"/"selected") | - |
| `variant` | `string` | Tipo de exportación | `"single"` \| `"multiple"` \| `"selected"` |
| `size` | `string` | Tamaño del botón | `"sm"` \| `"md"` \| `"lg"` |
| `className` | `string` | Clases CSS adicionales | - |

## 🎨 Personalización de Colores

El servicio utiliza una paleta de colores profesional:

```typescript
const COLORS = {
  primary: '#2563eb',    // Azul principal
  secondary: '#64748b',  // Gris secundario
  success: '#16a34a',    // Verde éxito
  warning: '#d97706',    // Naranja advertencia
  danger: '#dc2626',     // Rojo peligro
  light: '#f8fafc',      // Gris claro
  dark: '#1e293b',       // Gris oscuro
  white: '#ffffff'       // Blanco
};
```

## 📐 Estructura del PDF

### 1. Encabezado (Header)
- Fondo azul institucional
- Logo placeholder
- Título "FICHA DE MATRÍCULA"
- Nombre de la institución
- Año académico

### 2. Información Principal
- Tabla con datos básicos de la matrícula
- Código, fecha, estado, tipo, modalidad

### 3. Información del Estudiante
- Tabla con datos personales completos
- Nombres, documento, CUI, fecha de nacimiento, dirección

### 4. Información Académica
- Tabla con datos académicos
- Año, período, nivel, grupo de edad, turno, sección

### 5. Documentos Requeridos
- Tabla detallada de documentos
- Estado de entrega (✓ Entregado / ✗ Pendiente)
- Clasificación (Obligatorio / Opcional)
- Barra de progreso visual
- Porcentaje de completitud

### 6. Pie de Página (Footer)
- Fecha y hora de generación
- Nombre del sistema
- Número de página

## 🔧 Instalación y Configuración

### 1. Dependencias
```bash
npm install jspdf jspdf-autotable
```

### 2. Importación
```typescript
import PdfExportButton from '../components/PdfExportButton';
import PdfExportService from '../service/PdfExport.service';
```

### 3. Uso en Componentes
```tsx
// En una lista de matrículas
{enrollments.map(enrollment => (
  <tr key={enrollment.id}>
    {/* ... otras columnas ... */}
    <td>
      <PdfExportButton
        enrollment={enrollment}
        variant="single"
        size="sm"
      />
    </td>
  </tr>
))}

// Botón para exportar todas las matrículas filtradas
<PdfExportButton
  enrollments={filteredEnrollments}
  variant="multiple"
  size="md"
  className="bg-purple-600 hover:bg-purple-700"
/>
```

## 📱 Responsive Design

Los botones se adaptan automáticamente a diferentes tamaños de pantalla:

- **Desktop**: Texto completo + icono
- **Mobile**: Solo icono (optimizado para touch)
- **Tamaños mínimos**: 44px x 44px en móviles para accesibilidad

## 🚨 Manejo de Errores

El sistema incluye manejo robusto de errores:

- **Validación de datos**: Verifica que todos los datos necesarios estén disponibles
- **Timeouts**: Maneja timeouts en las llamadas a APIs
- **Fallbacks**: Usa datos mock si el backend no está disponible
- **Feedback visual**: Muestra mensajes de error claros al usuario

## 📊 Ejemplos de Nombres de Archivos

- **Individual**: `Matricula_Juan_Perez_2025.pdf`
- **Múltiple**: `Matriculas_2025_2025-10-27.pdf`

## 🎯 Casos de Uso

### 1. Exportación Individual
- Desde la lista de matrículas
- Desde el detalle de una matrícula
- Para envío por email o impresión

### 2. Exportación Masiva
- Reportes mensuales
- Archivos para auditorías
- Respaldos documentales

### 3. Exportación Filtrada
- Matrículas por estado
- Matrículas por período
- Matrículas por institución

## 🔮 Futuras Mejoras

- [ ] Plantillas personalizables por institución
- [ ] Logos dinámicos desde la base de datos
- [ ] Firmas digitales
- [ ] Códigos QR para verificación
- [ ] Exportación a otros formatos (Excel, Word)
- [ ] Programación de exportaciones automáticas
- [ ] Integración con sistemas de email

## 🤝 Contribución

Para agregar nuevas funcionalidades o mejorar el diseño:

1. Modifica `PdfExportService` para cambios en la generación
2. Actualiza `PdfExportButton` para nuevas opciones de UI
3. Mantén la consistencia en colores y tipografía
4. Prueba en diferentes tamaños de datos
5. Verifica la accesibilidad en dispositivos móviles

---

**¡Sistema de exportación PDF listo para uso profesional! 🚀**