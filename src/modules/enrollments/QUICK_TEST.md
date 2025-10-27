# Prueba Rápida - Sistema de Matrículas Integrado

## ✅ Pasos para Probar la Funcionalidad

### 1. Configurar Variables de Entorno
Crear archivo `.env` en la raíz del proyecto:

```env
# Para desarrollo con mock data (recomendado para pruebas iniciales)
VITE_USE_MOCK_DATA=true

# URLs de microservicios (para cuando estén disponibles)
VITE_ENROLLMENT_API_URL=http://localhost:9082/api/v1
VITE_STUDENT_API_URL=http://localhost:8085
VITE_INSTITUTION_API_URL=http://localhost:9080
```

### 2. Acceder a la Funcionalidad
1. Ir a la página de matrículas: `/enrollments/matriculas`
2. Hacer clic en el botón **"Nueva Matrícula Integrada"** (verde)
3. Se abrirá un modal con el formulario paso a paso

### 3. Probar el Flujo Completo

#### Paso 1: Seleccionar Estudiante
- Seleccionar "Buscar por CUI"
- Ingresar: `1234567890123`
- Hacer clic en "Buscar"
- Debería aparecer: **Juan Carlos Pérez García**
- Hacer clic en "Seleccionar Estudiante"

#### Paso 2: Seleccionar Institución y Aula
- Debería aparecer una lista de instituciones
- Hacer clic en **"Colegio San José"**
- Seleccionar el aula **"1° Grado A"**

#### Paso 3: Validación Automática
- El sistema validará automáticamente los datos
- Debería mostrar ✅ **"Validación Exitosa"**
- Hacer clic en "Siguiente"

#### Paso 4: Completar Datos
- Llenar los campos requeridos:
  - **Año Académico:** 2025
  - **Período Académico:** period_2025_1
  - **Turno:** Mañana
  - **Sección:** A
  - **Modalidad:** Presencial
- Hacer clic en **"Crear Matrícula"**

### 4. Verificar Resultado
- Debería aparecer una notificación de éxito
- La matrícula se agregará a la lista
- El modal se cerrará automáticamente

## 🔧 Solución de Problemas

### Problema: Modal no se abre
**Solución:** Verificar que no hay errores en la consola del navegador

### Problema: "Error al buscar estudiante"
**Solución:** Verificar que `VITE_USE_MOCK_DATA=true` esté en el archivo `.env`

### Problema: Datos no se cargan
**Solución:** 
1. Abrir DevTools (F12)
2. Ir a la pestaña Console
3. Debería ver: "🔧 Configuración de Integración de Microservicios"
4. Verificar que "Modo Mock Data: Activado"

### Problema: Estilos no se ven bien
**Solución:** Verificar que Tailwind CSS esté configurado correctamente

## 📊 Datos de Prueba (Mock Data)

### Estudiante de Prueba
- **CUI:** 1234567890123
- **Nombre:** Juan Carlos Pérez García
- **DNI:** 12345678
- **Estado:** Activo

### Institución de Prueba
- **Nombre:** Colegio San José
- **Tipo:** Privado
- **Aulas:** 1° Grado A, 1° Grado B

### Validación Esperada
- ✅ Estudiante válido
- ✅ Institución válida  
- ✅ Aula válida
- ✅ Capacidad disponible

## 🎯 Funcionalidades a Verificar

- [ ] Modal se abre correctamente
- [ ] Búsqueda de estudiante funciona
- [ ] Selección de institución funciona
- [ ] Selección de aula funciona
- [ ] Validación automática funciona
- [ ] Formulario de datos adicionales funciona
- [ ] Creación de matrícula funciona
- [ ] Notificación de éxito aparece
- [ ] Modal se cierra automáticamente
- [ ] Matrícula aparece en la lista

## 🚀 Próximos Pasos

Una vez que la prueba con mock data funcione correctamente:

1. **Configurar microservicios reales:**
   ```env
   VITE_USE_MOCK_DATA=false
   ```

2. **Verificar conectividad con servicios reales**

3. **Probar casos de error:**
   - Estudiante no encontrado
   - Servicio no disponible
   - Datos inválidos

4. **Optimizar rendimiento y UX**