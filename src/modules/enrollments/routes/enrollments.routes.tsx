/**
 * Rutas del módulo Enrollment
 * Define todas las rutas relacionadas con matrículas
 */

import { Route } from 'react-router-dom'
import { EnrollmentPage } from '../pages/EnrollmentPage'
import { EnrollmentCreatePage } from '../pages/EnrollmentCreatePage'
import { EnrollmentDetailPage } from '../pages/EnrollmentDetailPage'
import { EnrollmentEditPage } from '../pages/EnrollmentEditPage'

export const enrollmentsRoutes = (
  <>
    <Route path="matriculas" element={<EnrollmentPage />} />
    <Route path="matriculas/nuevo" element={<EnrollmentCreatePage />} />
    <Route path="matriculas/:id" element={<EnrollmentDetailPage />} />
    <Route path="matriculas/:id/editar" element={<EnrollmentEditPage />} />
  </>
)
