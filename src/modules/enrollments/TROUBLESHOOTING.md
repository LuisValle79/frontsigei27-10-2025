# Guía de Solución de Problemas - Sistema de Matrículas Integrado

## 🚨 Problemas Comunes y Soluciones

### 1. Error: "Failed to execute 'json' on 'Response': Unexpected end of JSON input"

**Síntomas:**
- Error al intentar crear una matrícula
- La consola muestra errores de parsing JSON
- Los reintentos fallan

**Causa:**
El sistema está intentando conectarse al backend real en lugar de usar mock data.

**Solución:**
1. **Verificar archivo `.env`:**
   ```env
   VITE_USE_MOCK_DATA=true
   ```

2. **Crear archivo `.env` si no existe:**
   ```bash
   # En la raíz del proyecto
   touch .env
   ```

3. **Contenido del archivo `.env`:**
   ```env
   VITE_USE_MOCK_DATA=true
   VITE_ENROLLMENT_API_URL=http://localhost:9082/api/v1
   VITE_STUDENT_API_URL=http://localhost:8085
   VITE_INSTITUTION_API_URL=http://localhost:9080
   ```

4. **Reiniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   # o
   yarn dev
   ```

### 2. Modal no se abre al hacer clic en "Nueva Matrícula Integrada"

**Síntomas:**
- El botón no responde
- No aparece el modal
- No hay errores en consola

**Solución:**
1. **Verificar que no hay errores de JavaScript en la consola**
2. **Verificar que el componente Modal esté importado correctamente**
3. **Comprobar que no hay conflictos de CSS**

### 3. Datos no se cargan en los selectores

**Síntomas:**
- Selector de estudiantes no encuentra resultados
- Lista de instituciones vacía
- Validación no funciona

**Solución:**
1. **Verificar configuración de mock data:**
   - Abrir DevTools (F12)
   - Buscar mensajes que empiecen con "🔧 Using mock data"
   - Si no aparecen, el mock data no está activado

2. **Verificar variables de entorno:**
   - Debe aparecer el componente de configuración en la esquina superior derecha
   - "Mock Data" debe mostrar "✅ Enabled"

### 4. Error: "Estudiante no encontrado"

**Síntomas:**
- Búsqueda por CUI no encuentra resultados
- Mensaje de error al buscar estudiante

**Solución:**
1. **Usar CUI de prueba correcto:**
   ```
   CUI: 1234567890123
   ```

2. **Verificar que mock data esté habilitado**

3. **Si persiste el error, verificar en consola:**
   ```javascript
   // En DevTools Console
   console.log(import.meta.env.VITE_USE_MOCK_DATA);
   // Debe mostrar: "true"
   ```

### 5. Estilos no se ven correctamente

**Síntomas:**
- Componentes sin estilos
- Layout roto
- Colores o espaciado incorrecto

**Solución:**
1. **Verificar que Tailwind CSS esté configurado**
2. **Verificar que no hay conflictos de CSS**
3. **Limpiar caché del navegador (Ctrl+F5)**

### 6. Error: "Cannot read properties of undefined"

**Síntomas:**
- Error de JavaScript al interactuar con componentes
- Componentes no se renderizan

**Solución:**
1. **Verificar que todos los props requeridos se están pasando**
2. **Verificar que los datos mock tienen la estructura correcta**
3. **Revisar la consola para errores específicos**

## 🔧 Herramientas de Diagnóstico

### 1. Componente de Configuración
En modo desarrollo, aparece un panel en la esquina superior derecha que muestra:
- Estado del mock data
- URLs de los servicios
- Estado de logging
- Problemas de configuración

### 2. Logs de Consola
Buscar estos mensajes en la consola:
- `🔧 Configuración de Integración de Microservicios` - Configuración inicial
- `🔧 Using mock data for...` - Uso de datos mock
- `🚀 API Request...` - Peticiones a APIs
- `✅ API Success...` - Respuestas exitosas
- `❌ API Failed...` - Errores de API

### 3. Verificación Manual
```javascript
// En DevTools Console
console.log('Mock Data:', import.meta.env.VITE_USE_MOCK_DATA);
console.log('Enrollment API:', import.meta.env.VITE_ENROLLMENT_API_URL);
console.log('Student API:', import.meta.env.VITE_STUDENT_API_URL);
console.log('Institution API:', import.meta.env.VITE_INSTITUTION_API_URL);
```

## 🎯 Datos de Prueba

### Estudiante de Prueba
- **CUI:** `1234567890123`
- **ID:** `67123abc456def789`
- **Nombre:** Juan Carlos Pérez García
- **Estado:** Activo

### Institución de Prueba
- **ID:** `inst123`
- **Nombre:** Colegio San José
- **Tipo:** Privado

### Aula de Prueba
- **ID:** `classroom123`
- **Nombre:** 1° Grado A
- **Capacidad:** 25 estudiantes

## 🚀 Pasos de Verificación Completa

1. **Verificar archivo `.env`:**
   ```bash
   cat .env
   # Debe mostrar VITE_USE_MOCK_DATA=true
   ```

2. **Reiniciar servidor:**
   ```bash
   npm run dev
   ```

3. **Abrir página de matrículas:**
   ```
   http://localhost:3000/enrollments/matriculas
   ```

4. **Verificar panel de configuración:**
   - Debe aparecer en esquina superior derecha
   - "Mock Data" debe estar "✅ Enabled"

5. **Probar flujo completo:**
   - Clic en "Nueva Matrícula Integrada"
   - Buscar estudiante con CUI: `1234567890123`
   - Seleccionar "Colegio San José"
   - Seleccionar "1° Grado A"
   - Completar formulario
   - Crear matrícula

## 📞 Contacto de Soporte

Si los problemas persisten:
1. Revisar logs completos en DevTools Console
2. Verificar que todas las dependencias estén instaladas
3. Comprobar que no hay conflictos de puertos
4. Verificar permisos de archivos (.env debe ser legible)