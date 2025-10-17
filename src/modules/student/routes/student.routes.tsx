/**
 * Rutas del módulo Student
 * Define todas las rutas relacionadas con estudiantes
 */

import { Route } from "react-router-dom";
import { StudentPage } from "../pages/StudentPage";
import { StudentCreatePage } from "../pages/StudentCreatePage";
import { StudentDetailPage } from "../pages/StudentDetailPage";
import { StudentEditPage } from "../pages/StudentEditPage";

export const studentRoutes = (
     <>
          <Route path="estudiantes" element={<StudentPage />} />
          <Route path="estudiantes/nuevo" element={<StudentCreatePage />} />
          <Route path="estudiantes/:id" element={<StudentDetailPage />} />
          <Route path="estudiantes/:id/editar" element={<StudentEditPage />} />
     </>
);
