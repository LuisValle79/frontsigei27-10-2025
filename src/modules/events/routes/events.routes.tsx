/**
 * Rutas del módulo Event
 * Define todas las rutas relacionadas con eventos
 */

import { Route } from 'react-router-dom'
import { EventPage } from '../pages/EventPage'
import { EventCreatePage } from '../pages/EventCreatePage'
import { EventDetailPage } from '../pages/EventDetailPage'
import { EventEditPage } from '../pages/EventEditPage'

export const eventsRoutes = (
  <>
    <Route path="eventos" element={<EventPage />} />
    <Route path="eventos/nuevo" element={<EventCreatePage />} />
    <Route path="eventos/:id" element={<EventDetailPage />} />
    <Route path="eventos/:id/editar" element={<EventEditPage />} />
  </>
)
