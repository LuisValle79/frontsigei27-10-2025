/**
 * Script de prueba para verificar la integración con el backend
 * Ejecuta todas las operaciones CRUD para validar la comunicación
 */

import { enrollmentService, academicPeriodService, checkBackendHealth } from './index';
import type { CreateEnrollmentDto, CreateAcademicPeriodDto } from './index';

// 🧪 Función para probar la integración completa
export const testIntegration = async () => {
  console.log('🚀 Iniciando pruebas de integración...');
  
  try {
    // 1. Verificar salud del backend
    console.log('\n1. 🏥 Verificando salud del backend...');
    const isHealthy = await checkBackendHealth();
    console.log(`Backend status: ${isHealthy ? '✅ Disponible' : '⚠️ No disponible (usando mock data)'}`);

    // 2. Probar Academic Periods
    console.log('\n2. 🎓 Probando operaciones de Períodos Académicos...');
    
    // Crear período académico
    const newPeriod: CreateAcademicPeriodDto = {
      institutionId: 'inst_test_001',
      academicYear: '2025',
      periodName: 'Período de Prueba',
      startDate: '2025-03-01T00:00:00.000Z',
      endDate: '2025-05-31T23:59:59.000Z',
      enrollmentPeriodStart: '2025-01-15T00:00:00.000Z',
      enrollmentPeriodEnd: '2025-02-28T23:59:59.000Z',
      allowLateEnrollment: true,
      lateEnrollmentEndDate: '2025-03-15T23:59:59.000Z',
      status: 'ACTIVE'
    };

    const createdPeriod = await academicPeriodService.createAcademicPeriod(newPeriod);
    console.log('✅ Período académico creado:', createdPeriod?.id);

    // Listar períodos
    const periods = await academicPeriodService.getAllAcademicPeriods();
    console.log(`✅ Períodos obtenidos: ${periods?.length || 0}`);

    // Obtener período por ID
    if (createdPeriod?.id) {
      const period = await academicPeriodService.getAcademicPeriodById(createdPeriod.id);
      console.log('✅ Período obtenido por ID:', period?.periodName);
    }

    // 3. Probar Enrollments
    console.log('\n3. 📋 Probando operaciones de Matrículas...');
    
    // Crear matrícula
    const newEnrollment: CreateEnrollmentDto = {
      studentId: 'std_test_001',
      institutionId: 'inst_test_001',
      classroomId: 'cls_test_001',
      academicYear: '2025',
      academicPeriodId: createdPeriod?.id || 'period_test_001',
      ageGroup: '4_AÑOS',
      shift: 'MAÑANA',
      section: 'A',
      modality: 'PRESENCIAL',
      enrollmentStatus: 'ACTIVE',
      enrollmentType: 'NUEVA',
      educationalLevel: 'INITIAL',
      studentAge: 4,
      birthCertificate: true,
      studentDni: true,
      guardianDni: true,
      vaccinationCard: true,
      observations: 'Matrícula de prueba creada automáticamente'
    };

    const createdEnrollment = await enrollmentService.createEnrollment(newEnrollment);
    console.log('✅ Matrícula creada:', createdEnrollment?.id);

    // Listar matrículas
    const enrollments = await enrollmentService.getAllEnrollments();
    console.log(`✅ Matrículas obtenidas: ${enrollments?.length || 0}`);

    // Obtener matrícula por ID
    if (createdEnrollment?.id) {
      const enrollment = await enrollmentService.getEnrollmentById(createdEnrollment.id);
      console.log('✅ Matrícula obtenida por ID:', enrollment?.enrollmentCode || enrollment?.id);
    }

    // Actualizar matrícula
    if (createdEnrollment?.id) {
      const updatedEnrollment = await enrollmentService.updateEnrollment(createdEnrollment.id, {
        observations: 'Matrícula actualizada en prueba de integración',
        utilityBill: true,
        studentPhoto: true
      });
      console.log('✅ Matrícula actualizada:', updatedEnrollment?.id);
    }

    // Obtener matrículas por institución
    const enrollmentsByInstitution = await enrollmentService.getEnrollmentsByInstitution('inst_test_001');
    console.log(`✅ Matrículas por institución: ${enrollmentsByInstitution?.length || 0}`);

    // Obtener matrículas por estudiante
    const enrollmentsByStudent = await enrollmentService.getEnrollmentsByStudent('std_test_001');
    console.log(`✅ Matrículas por estudiante: ${enrollmentsByStudent?.length || 0}`);

    // 4. Probar operaciones de eliminación y restauración
    console.log('\n4. 🗑️ Probando eliminación y restauración...');
    
    if (createdEnrollment?.id) {
      // Eliminar matrícula
      await enrollmentService.deleteEnrollment(createdEnrollment.id);
      console.log('✅ Matrícula eliminada (soft delete)');

      // Restaurar matrícula
      const restoredEnrollment = await enrollmentService.restoreEnrollment(createdEnrollment.id);
      console.log('✅ Matrícula restaurada:', restoredEnrollment?.id);
    }

    if (createdPeriod?.id) {
      // Eliminar período
      await academicPeriodService.deleteAcademicPeriod(createdPeriod.id);
      console.log('✅ Período académico eliminado (soft delete)');

      // Restaurar período
      const restoredPeriod = await academicPeriodService.restoreAcademicPeriod(createdPeriod.id);
      console.log('✅ Período académico restaurado:', restoredPeriod?.id);
    }

    console.log('\n🎉 ¡Todas las pruebas completadas exitosamente!');
    
    return {
      success: true,
      backendAvailable: isHealthy,
      periodsCount: periods?.length || 0,
      enrollmentsCount: enrollments?.length || 0,
      createdPeriodId: createdPeriod?.id,
      createdEnrollmentId: createdEnrollment?.id
    };

  } catch (error) {
    console.error('❌ Error en las pruebas de integración:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

// 🔍 Función para probar solo la conectividad
export const testConnectivity = async () => {
  console.log('🔍 Probando conectividad básica...');
  
  try {
    const isHealthy = await checkBackendHealth();
    console.log(`Backend: ${isHealthy ? '✅ Conectado' : '⚠️ No disponible'}`);

    const periods = await academicPeriodService.getAllAcademicPeriods();
    console.log(`Períodos disponibles: ${periods?.length || 0}`);

    const enrollments = await enrollmentService.getAllEnrollments();
    console.log(`Matrículas disponibles: ${enrollments?.length || 0}`);

    return {
      backendAvailable: isHealthy,
      periodsCount: periods?.length || 0,
      enrollmentsCount: enrollments?.length || 0
    };
  } catch (error) {
    console.error('❌ Error de conectividad:', error);
    return {
      backendAvailable: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

// 📊 Función para mostrar estadísticas
export const showStats = async () => {
  console.log('📊 Obteniendo estadísticas...');
  
  try {
    const [periods, enrollments] = await Promise.all([
      academicPeriodService.getAllAcademicPeriods(),
      enrollmentService.getAllEnrollments()
    ]);

    const stats = {
      totalPeriods: periods?.length || 0,
      activePeriods: periods?.filter(p => p.status === 'ACTIVE').length || 0,
      totalEnrollments: enrollments?.length || 0,
      activeEnrollments: enrollments?.filter(e => e.enrollmentStatus === 'ACTIVE').length || 0,
      pendingEnrollments: enrollments?.filter(e => e.enrollmentStatus === 'PENDING').length || 0,
      newEnrollments: enrollments?.filter(e => e.enrollmentType === 'NUEVA').length || 0,
      reEnrollments: enrollments?.filter(e => e.enrollmentType === 'REINSCRIPCION').length || 0,
    };

    console.log('📈 Estadísticas:');
    console.log(`  Períodos académicos: ${stats.totalPeriods} (${stats.activePeriods} activos)`);
    console.log(`  Matrículas: ${stats.totalEnrollments} (${stats.activeEnrollments} activas, ${stats.pendingEnrollments} pendientes)`);
    console.log(`  Tipos: ${stats.newEnrollments} nuevas, ${stats.reEnrollments} reinscripciones`);

    return stats;
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    return null;
  }
};

// 🚀 Ejecutar pruebas si se ejecuta directamente
if (typeof window !== 'undefined' && (window as any).runEnrollmentTests) {
  testIntegration().then(result => {
    console.log('Resultado final:', result);
  });
}