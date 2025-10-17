/**
 * Modelo: Institution
 * Define la estructura de datos para el módulo de Institución
 */

export interface Institution {
     id: string
     name: string
     code: string
     director: string
     email: string
     phone: string
     address: string
     city: string
     state: string
     country: string
     postalCode?: string
     website?: string
     foundedYear?: number
     type: 'public' | 'private'
     level: 'primary' | 'secondary' | 'both'
     status: 'active' | 'inactive'
     createdAt: string
     updatedAt: string
}

export interface CreateInstitutionDto {
     name: string
     code: string
     director: string
     email: string
     phone: string
     address: string
     city: string
     state: string
     country: string
     postalCode?: string
     website?: string
     foundedYear?: number
     type: 'public' | 'private'
     level: 'primary' | 'secondary' | 'both'
}

export interface UpdateInstitutionDto extends Partial<CreateInstitutionDto> {
     status?: 'active' | 'inactive'
}
