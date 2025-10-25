import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { PsychologyList } from "../../components/PsychologyList";
import { psychologyService } from "../../service/Psychology.service";
import type {
  PsychologicalEvaluation,
  EvaluationType,
} from "../../models/psychology.model";

type FilterType = "all" | "active" | "inactive";

export function PsychologyPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<PsychologicalEvaluation[]>([]);
  const [filteredItems, setFilteredItems] = useState<PsychologicalEvaluation[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<EvaluationType | "all">("all");

  const applyFilters = useCallback(
    (
      data: PsychologicalEvaluation[],
      search: string,
      type: EvaluationType | "all"
    ) => {
      let filtered = data;

      if (search) {
        filtered = filtered.filter(
          (item) =>
            item.studentId.toLowerCase().includes(search.toLowerCase()) ||
            item.observations.toLowerCase().includes(search.toLowerCase()) ||
            item.evaluationReason?.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (type !== "all") {
        filtered = filtered.filter((item) => item.evaluationType === type);
      }

      setFilteredItems(filtered);
    },
    []
  );

  const fetchEvaluations = useCallback(
    async (filterType?: FilterType) => {
      try {
        setLoading(true);
        setError(null);
        let evaluations: PsychologicalEvaluation[];

        const currentFilter = filterType || filter;
        switch (currentFilter) {
          case "active":
            evaluations = await psychologyService.getActiveEvaluations();
            break;
          case "inactive":
            evaluations = await psychologyService.getInactiveEvaluations();
            break;
          default:
            evaluations = await psychologyService.getAllEvaluations();
        }

        setItems(evaluations);
        applyFilters(evaluations, searchTerm, typeFilter);
      } catch {
        setError(
          "No se pudo conectar con el servidor. Verifique que esté ejecutándose en el puerto 9090."
        );
      } finally {
        setLoading(false);
      }
    },
    [filter, searchTerm, typeFilter, applyFilters]
  );

  // Cargar datos solo una vez al montar el componente
  useEffect(() => {
    fetchEvaluations();
  }, [fetchEvaluations]); // Solo se ejecuta una vez

  // Aplicar filtros cuando cambien los datos o filtros
  useEffect(() => {
    applyFilters(items, searchTerm, typeFilter);
  }, [items, searchTerm, typeFilter, applyFilters]);

  const handleFilterChange = useCallback(
    async (newFilter: FilterType) => {
      setFilter(newFilter);

      try {
        setLoading(true);
        setError(null);
        let evaluations: PsychologicalEvaluation[];

        switch (newFilter) {
          case "active":
            evaluations = await psychologyService.getActiveEvaluations();
            break;
          case "inactive":
            evaluations = await psychologyService.getInactiveEvaluations();
            break;
          default:
            evaluations = await psychologyService.getAllEvaluations();
        }

        setItems(evaluations);
        applyFilters(evaluations, searchTerm, typeFilter);
      } catch {
        setError("Error al cargar las evaluaciones");
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, typeFilter, applyFilters]
  );

  const handleDelete = useCallback(async (id: string) => {
    try {
      await psychologyService.deactivateEvaluation(id);
      // Actualizar solo el item específico en lugar de recargar todo
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, status: "INACTIVE" as const } : item
        )
      );
    } catch {
      alert("Error al eliminar la evaluación");
    }
  }, []);

  const handleReactivate = useCallback(async (id: string) => {
    try {
      await psychologyService.reactivateEvaluation(id);
      // Actualizar solo el item específico en lugar de recargar todo
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, status: "ACTIVE" as const } : item
        )
      );
    } catch {
      alert("Error al reactivar la evaluación");
    }
  }, []);

  const getStats = () => {
    const total = items.length;
    const active = items.filter((item) => item.status === "ACTIVE").length;
    const inactive = total - active;
    const requiresFollowUp = items.filter(
      (item) => item.requiresFollowUp
    ).length;

    return { total, active, inactive, requiresFollowUp };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm border">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Cargando evaluaciones
              </h3>
              <p className="text-gray-600 text-sm">
                Obteniendo datos del servidor...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-red-200 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Error de conexión
            </h3>
            <p className="text-gray-600 mb-6 text-sm">{error}</p>
            <button
              onClick={() => handleFilterChange(filter)}
              className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              Reintentar conexión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto px-6 py-4">
        {/* Header compacto y profesional */}
        <div className="mb-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Evaluaciones Psicológicas
                  </h1>
                  <p className="text-gray-600">
                    Sistema integral de gestión psicológica estudiantil
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/psicologia/nuevo")}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Nueva Evaluación
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 mb-4">
              <nav className="flex space-x-8">
                <Link
                  to="/psicologia"
                  className="border-indigo-500 text-indigo-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                >
                  Evaluaciones Psicológicas
                </Link>
                <Link
                  to="/psychology/supports"
                  className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                >
                  Área de Soporte Especial
                </Link>
              </nav>
            </div>

            {/* Stats compactos */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Total</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {stats.total}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">
                      Activas
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {stats.active}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-600 text-sm font-medium">
                      Inactivas
                    </p>
                    <p className="text-2xl font-bold text-red-900">
                      {stats.inactive}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-medium">
                      Seguimiento
                    </p>
                    <p className="text-2xl font-bold text-orange-900">
                      {stats.requiresFollowUp}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Filtros compactos */}
            <div className="bg-gray-50 rounded-lg p-3 border">
              <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFilterChange("all")}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      filter === "all"
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                    }`}
                  >
                    Todas
                  </button>
                  <button
                    onClick={() => handleFilterChange("active")}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      filter === "active"
                        ? "bg-green-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                    }`}
                  >
                    Activas
                  </button>
                  <button
                    onClick={() => handleFilterChange("inactive")}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      filter === "inactive"
                        ? "bg-red-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                    }`}
                  >
                    Inactivas
                  </button>
                </div>

                <div className="flex-1 max-w-md relative">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Buscar por estudiante, observaciones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>

                <select
                  value={typeFilter}
                  onChange={(e) =>
                    setTypeFilter(e.target.value as EvaluationType | "all")
                  }
                  className="px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="INICIAL">Inicial</option>
                  <option value="SEGUIMIENTO">Seguimiento</option>
                  <option value="ESPECIAL">Especial</option>
                  <option value="DERIVACION">Derivación</option>
                </select>

                <button
                  onClick={() => handleFilterChange(filter)}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-md transition-colors border border-gray-300"
                  title="Actualizar"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lista ocupando todo el espacio */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Resultados ({filteredItems.length})
              </h2>
              {filteredItems.length !== items.length && (
                <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded border">
                  Mostrando {filteredItems.length} de {items.length}
                </span>
              )}
            </div>
          </div>

          <PsychologyList
            items={filteredItems}
            onDelete={handleDelete}
            onReactivate={handleReactivate}
            showInactive={filter === "inactive"}
          />
        </div>
      </div>
    </div>
  );
}