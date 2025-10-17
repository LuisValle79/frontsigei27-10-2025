/**
 * Modelo: Student
 * Define la estructura de datos para el módulo de Estudiantes
 */

export interface Student {
     id: string
     firstName: string
     lastName: string
     dni: string
     email: string
     phone?: string
     dateOfBirth: string
     address?: string
     enrollmentDate: string
     grade?: string
     section?: string
     status: 'active' | 'inactive' | 'suspended'
     createdAt: string
     updatedAt: string
}

export interface CreateStudentDto {
     firstName: string
     lastName: string
     dni: string
     email: string
     phone?: string
     dateOfBirth: string
     address?: string
     grade?: string
     section?: string
}

export interface UpdateStudentDto extends Partial<CreateStudentDto> {
     status?: 'active' | 'inactive' | 'suspended'
}
