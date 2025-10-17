/**
 * Rutas del módulo Psychology
 * Define todas las rutas relacionadas con psicología
 */

import { Route } from 'react-router-dom'
import { PsychologyPage } from '../pages/PsychologyPage'
import { PsychologyCreatePage } from '../pages/PsychologyCreatePage'
import { PsychologyDetailPage } from '../pages/PsychologyDetailPage'
import { PsychologyEditPage } from '../pages/PsychologyEditPage'

export const psychologyRoutes = (
  <>
    <Route path="psicologia" element={<PsychologyPage />} />
    <Route path="psicologia/nuevo" element={<PsychologyCreatePage />} />
    <Route path="psicologia/:id" element={<PsychologyDetailPage />} />
    <Route path="psicologia/:id/editar" element={<PsychologyEditPage />} />
  </>
)
