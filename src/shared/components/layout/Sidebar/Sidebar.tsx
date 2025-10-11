import type React from "react"
import { Link, useLocation } from "react-router-dom"
import {
  Building2,
  Users,
  BookOpen,
  Calendar,
  FileText,
  ClipboardCheck,
  Menu,
  Shield,
  GraduationCap,
  Brain,
} from "lucide-react"

interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  path: string
}

const menuItems: MenuItem[] = [
  { id: "institution", label: "Institución", icon: <Building2 size={20} />, path: "/institucion" },
  { id: "students", label: "Estudiantes", icon: <Users size={20} />, path: "/estudiantes" },
  { id: "academic", label: "Gestión Académica", icon: <BookOpen size={20} />, path: "/gestion-academica" },
  { id: "TeacherManagement", label: "Gestion de Profesores", icon: <GraduationCap size={20} />, path: "/cursos" },
  { id: "events", label: "Eventos", icon: <Calendar size={20} />, path: "/eventos" },
  { id: "grades", label: "Notas", icon: <FileText size={20} />, path: "/notas" },
  { id: "attendance", label: "Asistencias", icon: <ClipboardCheck size={20} />, path: "/asistencias" },
  { id: "behavior", label: "Comportamiento", icon: <Shield size={20} />, path: "/comportamiento" },
  { id: "psychology", label: "Psicología", icon: <Brain size={20} />, path: "/psicologia" },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">S</div>
          <div>
            <h1 className="font-bold text-lg">SIGEI</h1>
            <p className="text-xs text-slate-400">Sistema de Gestión</p>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <nav className="flex-1 p-4">
        <div className="mb-6">
          <div className="flex items-center gap-2 px-3 py-2 text-slate-400 text-sm font-medium">
            <Menu size={16} />
            <span>Menú Principal</span>
          </div>
        </div>

        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path

            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
