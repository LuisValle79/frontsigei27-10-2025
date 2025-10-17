/**
 * Rutas del módulo Attendance
 * Define todas las rutas relacionadas con asistencias
 */

import { Route } from 'react-router-dom'
import { AttendancePage } from '../pages/AttendancePage'
import { AttendanceCreatePage } from '../pages/AttendanceCreatePage'
import { AttendanceDetailPage } from '../pages/AttendanceDetailPage'
import { AttendanceEditPage } from '../pages/AttendanceEditPage'

export const attendanceRoutes = (
  <>
    <Route path="asistencias" element={<AttendancePage />} />
    <Route path="asistencias/nuevo" element={<AttendanceCreatePage />} />
    <Route path="asistencias/:id" element={<AttendanceDetailPage />} />
    <Route path="asistencias/:id/editar" element={<AttendanceEditPage />} />
  </>
)
