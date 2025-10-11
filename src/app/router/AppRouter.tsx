import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { DashboardLayout } from "../../shared/components/layout/DashboardLayout/DashboardLayout"
import { LoginPage } from "../../modules/auth/pages/LoginPage"
import { InstitutionPage } from "../../modules/institution/pages/InstitutionPage"
import { StudentPage } from "../../modules/student/pages/StudentPage"
import { AcademicPage } from "../../modules/academic/pages/AcademicPage"
import { EventsPage } from "../../modules/events/pages/EventsPage"
import { GradesPage } from "../../modules/grades/pages/GradesPage"
import { AttendancePage } from "../../modules/attendance/pages/AttendancePage"
import { BehaviorPage } from "../../modules/behavior/pages/BehaviorPage"
import { TeacherManagementPage } from "../../modules/TeacherManagement/pages/TeacherManagementPage"
import { PsychologyPage } from "../../modules/psychology/pages/PsychologyPage"

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Protected routes - Inside DashboardLayout */}
        <Route path="/" element={<DashboardLayout />}>
          {/* Module routes */}
          <Route path="institucion" element={<InstitutionPage />} />
          <Route path="estudiantes" element={<StudentPage />} />
          <Route path="gestion-academica" element={<AcademicPage />} />
          <Route path="eventos" element={<EventsPage />} />
          <Route path="notas" element={<GradesPage />} />
          <Route path="asistencias" element={<AttendancePage />} />
          <Route path="comportamiento" element={<BehaviorPage />} />
          <Route path="cursos" element={<TeacherManagementPage />} />
          <Route path="psicologia" element={<PsychologyPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
