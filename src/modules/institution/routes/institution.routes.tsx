/**
 * Rutas del módulo Institution
 * Define todas las rutas relacionadas con instituciones
 */

import { Route } from "react-router-dom";
import { InstitutionPage } from "../pages/InstitutionPage";
import { InstitutionCreatePage } from "../pages/InstitutionCreatePage";
import { InstitutionDetailPage } from "../pages/InstitutionDetailPage";
import { InstitutionEditPage } from "../pages/InstitutionEditPage";

export const institutionRoutes = (
     <>
          <Route path="institucion" element={<InstitutionPage />} />
          <Route path="institucion/nuevo" element={<InstitutionCreatePage />} />
          <Route path="institucion/:id" element={<InstitutionDetailPage />} />
          <Route
               path="institucion/:id/editar"
               element={<InstitutionEditPage />}
          />
     </>
);
