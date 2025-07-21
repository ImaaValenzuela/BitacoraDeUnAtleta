"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, Plus, TrendingUp, Dumbbell, Zap, Target, Award } from "lucide-react"
import { WeeklyRoutine } from "./components/weekly-routine"
import { CreateRoutine } from "./components/create-routine"

interface Exercise {
  id: string
  name: string
  sets: number
  reps: string
  rpe?: number
  rir?: number
  comments?: string
}

interface Routine {
  id: string
  name: string
  date: string
  week: string
  exercises: Exercise[]
  completed: boolean
}

// Sistema de persistencia mejorado
const STORAGE_KEY = "training-routines"
const BACKUP_KEY = "training-routines-backup"
const VERSION_KEY = "training-data-version"
const CURRENT_VERSION = "1.0"

const saveToStorage = (data: Routine[]) => {
  try {
    const dataToSave = {
      version: CURRENT_VERSION,
      timestamp: new Date().toISOString(),
      routines: data,
      backup: true,
    }

    // Guardar datos principales
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))

    // Crear backup automático
    const backupData = {
      ...dataToSave,
      backupTimestamp: new Date().toISOString(),
    }
    localStorage.setItem(BACKUP_KEY, JSON.stringify(backupData))

    // Disparar evento para sincronizar entre pestañas
    window.dispatchEvent(new CustomEvent("training-data-updated", { detail: data }))

    console.log("✅ Datos guardados exitosamente")
  } catch (error) {
    console.error("❌ Error al guardar datos:", error)
    // Intentar limpiar datos corruptos
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: CURRENT_VERSION,
          timestamp: new Date().toISOString(),
          routines: data,
          backup: true,
        }),
      )
    } catch (retryError) {
      console.error("❌ Error crítico de almacenamiento:", retryError)
    }
  }
}

const loadFromStorage = (): Routine[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const parsedData = JSON.parse(stored)

    // Verificar versión y estructura
    if (parsedData.version && parsedData.routines) {
      return parsedData.routines
    }

    // Fallback para datos antiguos
    if (Array.isArray(parsedData)) {
      return parsedData
    }

    return []
  } catch (error) {
    console.error("❌ Error al cargar datos:", error)

    // Intentar recuperar desde backup
    try {
      const backup = localStorage.getItem(BACKUP_KEY)
      if (backup) {
        const backupData = JSON.parse(backup)
        console.log("🔄 Recuperando desde backup...")
        return backupData.routines || []
      }
    } catch (backupError) {
      console.error("❌ Error al recuperar backup:", backupError)
    }

    return []
  }
}

export default function TrainingLog() {
  const [routines, setRoutines] = useState<Routine[]>([])
  const [currentView, setCurrentView] = useState<"dashboard" | "create" | "routine">("dashboard")
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<string>("all")
  const ROUTINES_PER_PAGE = 5

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    const loadedRoutines = loadFromStorage()
    setRoutines(loadedRoutines)

    // Sincronización entre pestañas
    const handleStorageSync = (event: CustomEvent<Routine[]>) => {
      setRoutines(event.detail)
    }

    window.addEventListener("training-data-updated", handleStorageSync as EventListener)

    // Cleanup
    return () => {
      window.removeEventListener("training-data-updated", handleStorageSync as EventListener)
    }
  }, [])

  // Guardar en localStorage cuando cambien las rutinas
  useEffect(() => {
    if (routines.length > 0) {
      saveToStorage(routines)
    }
  }, [routines])

  const addRoutine = (routine: Omit<Routine, "id">) => {
    const newRoutine = {
      ...routine,
      id: Date.now().toString(),
    }
    setRoutines((prev) => [...prev, newRoutine])
    setCurrentView("dashboard")
  }

  const updateRoutine = (updatedRoutine: Routine) => {
    setRoutines((prev) => prev.map((r) => (r.id === updatedRoutine.id ? updatedRoutine : r)))
  }

  const getWeekNumber = (date: Date) => {
    const startOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7)
  }

  const getCurrentWeek = () => {
    const now = new Date()
    return `${now.getFullYear()}-W${getWeekNumber(now)}`
  }

  const getWeeklyStats = () => {
    const currentWeek = getCurrentWeek()
    const thisWeekRoutines = routines.filter((r) => r.week === currentWeek)
    const completedThisWeek = thisWeekRoutines.filter((r) => r.completed).length
    const totalExercises = thisWeekRoutines.reduce((acc, r) => acc + r.exercises.length, 0)

    return {
      routinesThisWeek: thisWeekRoutines.length,
      completedThisWeek,
      totalExercises,
      totalRoutines: routines.length,
    }
  }

  // Obtener todas las semanas únicas
  const getAllWeeks = () => {
    const weeks = [...new Set(routines.map((r) => r.week))].sort().reverse()
    return weeks
  }

  // Filtrar rutinas por semana
  const getFilteredRoutines = () => {
    if (selectedWeekFilter === "all") {
      return routines.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }
    return routines
      .filter((r) => r.week === selectedWeekFilter)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  // Paginación
  const getPaginatedRoutines = () => {
    const filtered = getFilteredRoutines()
    const startIndex = (currentPage - 1) * ROUTINES_PER_PAGE
    const endIndex = startIndex + ROUTINES_PER_PAGE
    return {
      routines: filtered.slice(startIndex, endIndex),
      totalPages: Math.ceil(filtered.length / ROUTINES_PER_PAGE),
      totalRoutines: filtered.length,
    }
  }

  // Función para duplicar rutina
  const duplicateRoutine = (routine: Routine) => {
    const duplicatedRoutine = {
      ...routine,
      id: Date.now().toString(),
      name: `${routine.name} (COPIA)`,
      date: new Date().toISOString().split("T")[0],
      week: getCurrentWeek(),
      completed: false,
      exercises: routine.exercises.map((ex) => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        // No copiar rpe, rir ni comments
      })),
    }

    setRoutines((prev) => [duplicatedRoutine, ...prev])
    console.log("📋 Rutina duplicada exitosamente")
  }

  const stats = getWeeklyStats()
  const { routines: paginatedRoutines, totalPages, totalRoutines } = getPaginatedRoutines()
  const allWeeks = getAllWeeks()
  const recentRoutines = routines.slice(-5).reverse()

  if (currentView === "create") {
    return <CreateRoutine onSave={addRoutine} onCancel={() => setCurrentView("dashboard")} isDarkMode={isDarkMode} />
  }

  if (currentView === "routine" && selectedRoutine) {
    return (
      <WeeklyRoutine
        routine={selectedRoutine}
        onUpdate={updateRoutine}
        onBack={() => setCurrentView("dashboard")}
        allRoutines={routines}
        isDarkMode={isDarkMode}
      />
    )
  }

  return (
    <div
      className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${
        isDarkMode ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      {/* Geometric Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className={`absolute top-0 left-0 w-96 h-96 border rotate-45 transform -translate-x-48 -translate-y-48 ${
            isDarkMode ? "border-white" : "border-black"
          }`}
        ></div>
        <div
          className={`absolute top-1/4 right-0 w-64 h-64 border rotate-12 transform translate-x-32 ${
            isDarkMode ? "border-white" : "border-black"
          }`}
        ></div>
        <div
          className={`absolute bottom-0 left-1/3 w-80 h-80 border rotate-45 transform translate-y-40 ${
            isDarkMode ? "border-white" : "border-black"
          }`}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-8">
        {/* Theme Toggle */}
        <div className="fixed top-6 right-6 z-50">
          <div className="relative group">
            <div
              className={`absolute inset-0 transform rotate-45 group-hover:rotate-90 transition-transform duration-300 ${
                isDarkMode ? "bg-white" : "bg-black"
              }`}
            ></div>
            <Button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`relative border-2 p-3 transform -rotate-45 group-hover:rotate-0 transition-all duration-300 ${
                isDarkMode
                  ? "bg-black text-white border-white hover:bg-white hover:text-black"
                  : "bg-white text-black border-black hover:bg-black hover:text-white"
              }`}
            >
              {isDarkMode ? "☀️" : "🌙"}
            </Button>
          </div>
        </div>

        {/* Futuristic Header */}
        <div className="text-center space-y-6 py-12">
          <div className="relative">
            <h1
              className={`text-7xl font-black tracking-tighter bg-gradient-to-r bg-clip-text text-transparent ${
                isDarkMode ? "from-white via-gray-300 to-white" : "from-black via-gray-700 to-black"
              }`}
            >
              MI
            </h1>
            <h2 className={`text-5xl font-black tracking-wider -mt-4 ${isDarkMode ? "text-white" : "text-black"}`}>
              BITACORA
            </h2>
            <div className={`absolute -top-4 -right-4 w-8 h-8 rotate-45 ${isDarkMode ? "bg-white" : "bg-black"}`}></div>
            <div
              className={`absolute -bottom-4 -left-4 w-6 h-6 border-2 rotate-45 ${
                isDarkMode ? "border-white" : "border-black"
              }`}
            ></div>
          </div>
          <div className="flex items-center justify-center gap-4">
            <div className={`h-px w-16 ${isDarkMode ? "bg-white" : "bg-black"}`}></div>
            <p
              className={`uppercase tracking-[0.3em] text-sm font-medium ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              BITACORA DE ENTRENAMIENTO
            </p>
            <div className={`h-px w-16 ${isDarkMode ? "bg-white" : "bg-black"}`}></div>
          </div>
        </div>

        {/* Radical Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group relative">
            <div
              className={`absolute inset-0 transform rotate-1 group-hover:rotate-2 transition-transform duration-300 ${
                isDarkMode ? "bg-white" : "bg-black"
              }`}
            ></div>
            <div
              className={`relative border-2 p-6 transform -rotate-1 group-hover:rotate-0 transition-transform duration-300 ${
                isDarkMode ? "bg-black border-white" : "bg-white border-black"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <Calendar className={`h-8 w-8 ${isDarkMode ? "text-white" : "text-black"}`} />
                <div className="text-right">
                  <div className={`text-3xl font-black ${isDarkMode ? "text-white" : "text-black"}`}>
                    {stats.routinesThisWeek}
                  </div>
                  <div className={`text-xs uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                    ESTA SEMANA
                  </div>
                </div>
              </div>
              <div className={`h-1 w-full ${isDarkMode ? "bg-white" : "bg-black"}`}></div>
            </div>
          </div>

          <div className="group relative">
            <div
              className={`absolute inset-0 transform -rotate-1 group-hover:-rotate-2 transition-transform duration-300 ${
                isDarkMode ? "bg-white" : "bg-black"
              }`}
            ></div>
            <div
              className={`relative border-2 p-6 transform rotate-1 group-hover:rotate-0 transition-transform duration-300 ${
                isDarkMode ? "bg-black border-white" : "bg-white border-black"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <Target className={`h-8 w-8 ${isDarkMode ? "text-white" : "text-black"}`} />
                <div className="text-right">
                  <div className={`text-3xl font-black ${isDarkMode ? "text-white" : "text-black"}`}>
                    {stats.completedThisWeek}
                  </div>
                  <div className={`text-xs uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                    COMPLETADAS
                  </div>
                </div>
              </div>
              <div className={`h-1 w-full ${isDarkMode ? "bg-white" : "bg-black"}`}></div>
            </div>
          </div>

          <div className="group relative">
            <div
              className={`absolute inset-0 transform rotate-1 group-hover:rotate-2 transition-transform duration-300 ${
                isDarkMode ? "bg-white" : "bg-black"
              }`}
            ></div>
            <div
              className={`relative border-2 p-6 transform -rotate-1 group-hover:rotate-0 transition-transform duration-300 ${
                isDarkMode ? "bg-black border-white" : "bg-white border-black"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <Zap className={`h-8 w-8 ${isDarkMode ? "text-white" : "text-black"}`} />
                <div className="text-right">
                  <div className={`text-3xl font-black ${isDarkMode ? "text-white" : "text-black"}`}>
                    {stats.totalExercises}
                  </div>
                  <div className={`text-xs uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                    EJERCICIOS
                  </div>
                </div>
              </div>
              <div className={`h-1 w-full ${isDarkMode ? "bg-white" : "bg-black"}`}></div>
            </div>
          </div>

          <div className="group relative">
            <div
              className={`absolute inset-0 transform -rotate-1 group-hover:-rotate-2 transition-transform duration-300 ${
                isDarkMode ? "bg-white" : "bg-black"
              }`}
            ></div>
            <div
              className={`relative border-2 p-6 transform rotate-1 group-hover:rotate-0 transition-transform duration-300 ${
                isDarkMode ? "bg-black border-white" : "bg-white border-black"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <Award className={`h-8 w-8 ${isDarkMode ? "text-white" : "text-black"}`} />
                <div className="text-right">
                  <div className={`text-3xl font-black ${isDarkMode ? "text-white" : "text-black"}`}>
                    {stats.totalRoutines}
                  </div>
                  <div className={`text-xs uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                    TOTAL
                  </div>
                </div>
              </div>
              <div className={`h-1 w-full ${isDarkMode ? "bg-white" : "bg-black"}`}></div>
            </div>
          </div>
        </div>

        {/* Dramatic CTA */}
        <div className="flex justify-center py-8">
          <div className="relative group">
            <div
              className={`absolute inset-0 transform skew-x-12 group-hover:skew-x-6 transition-transform duration-300 ${
                isDarkMode ? "bg-white" : "bg-black"
              }`}
            ></div>
            <Button
              onClick={() => setCurrentView("create")}
              className={`relative border-2 px-12 py-6 text-xl font-black uppercase tracking-wider transform -skew-x-12 group-hover:-skew-x-6 transition-all duration-300 ${
                isDarkMode
                  ? "bg-black text-white border-white hover:bg-white hover:text-black"
                  : "bg-white text-black border-black hover:bg-black hover:text-white"
              }`}
            >
              <Plus className="h-6 w-6 mr-3" />
              NUEVA RUTINA
            </Button>
          </div>
        </div>
      </div>

      {/* Avant-garde Routines List */}
      <div className="relative">
        <div className={`absolute top-0 left-0 w-full h-1 ${isDarkMode ? "bg-white" : "bg-black"}`}></div>
        <div className={`border-2 p-8 ${isDarkMode ? "bg-black border-white" : "bg-white border-black"}`}>
          <div className="flex items-center justify-between mb-8">
            <h3 className={`text-3xl font-black uppercase tracking-wider ${isDarkMode ? "text-white" : "text-black"}`}>
              HISTORIAL
            </h3>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rotate-45 ${isDarkMode ? "bg-white" : "bg-black"}`}></div>
              <div className={`w-3 h-3 border rotate-45 ${isDarkMode ? "border-white" : "border-black"}`}></div>
              <div className={`w-2 h-2 rotate-45 ${isDarkMode ? "bg-white" : "bg-black"}`}></div>
            </div>
          </div>

          {/* Filtros y Stats */}
          <div className="mb-8 space-y-6">
            {/* Filtro por semana */}
            <div className="relative">
              <div
                className={`absolute inset-0 transform translate-x-2 translate-y-2 ${isDarkMode ? "bg-white" : "bg-black"}`}
              ></div>
              <div
                className={`relative border-2 p-4 ${isDarkMode ? "bg-black border-white" : "bg-white border-black"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Calendar className={`h-6 w-6 ${isDarkMode ? "text-white" : "text-black"}`} />
                    <span className={`font-black uppercase tracking-wider ${isDarkMode ? "text-white" : "text-black"}`}>
                      FILTRAR POR SEMANA:
                    </span>
                  </div>
                  <select
                    value={selectedWeekFilter}
                    onChange={(e) => {
                      setSelectedWeekFilter(e.target.value)
                      setCurrentPage(1)
                    }}
                    className={`border-2 px-4 py-2 font-black uppercase tracking-wide ${
                      isDarkMode
                        ? "bg-black border-white text-white focus:border-gray-400"
                        : "bg-white border-black text-black focus:border-gray-600"
                    }`}
                  >
                    <option value="all">TODAS LAS SEMANAS</option>
                    {allWeeks.map((week) => (
                      <option key={week} value={week}>
                        SEMANA {week}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Stats de filtrado */}
            <div className="flex items-center justify-between">
              <div className={`text-sm uppercase tracking-wide ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                MOSTRANDO {paginatedRoutines.length} DE {totalRoutines} RUTINAS
                {selectedWeekFilter !== "all" && ` • SEMANA ${selectedWeekFilter}`}
              </div>
              {totalPages > 1 && (
                <div className={`text-sm uppercase tracking-wide ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  PÁGINA {currentPage} DE {totalPages}
                </div>
              )}
            </div>
          </div>

          {paginatedRoutines.length === 0 ? (
            <div className="text-center py-16 space-y-6">
              <div className="relative inline-block">
                <Dumbbell className={`h-24 w-24 opacity-20 ${isDarkMode ? "text-white" : "text-black"}`} />
                <div
                  className={`absolute inset-0 border-2 rotate-45 transform scale-150 ${
                    isDarkMode ? "border-white" : "border-black"
                  }`}
                ></div>
              </div>
              <div>
                <p
                  className={`text-2xl font-bold uppercase tracking-wider ${isDarkMode ? "text-white" : "text-black"}`}
                >
                  {selectedWeekFilter === "all" ? "SIN DATOS" : "SIN RUTINAS"}
                </p>
                <p className={`uppercase tracking-wide text-sm mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {selectedWeekFilter === "all"
                    ? "INICIA TU PRIMERA RUTINA"
                    : `NO HAY RUTINAS EN LA SEMANA ${selectedWeekFilter}`}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedRoutines.map((routine, index) => (
                <div key={routine.id} className="group relative">
                  <div
                    className={`absolute inset-0 transform translate-x-2 translate-y-2 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform duration-200 ${
                      isDarkMode ? "bg-white" : "bg-black"
                    }`}
                  ></div>
                  <div
                    className={`relative border-2 p-6 group-hover:transform group-hover:-translate-x-1 group-hover:-translate-y-1 transition-transform duration-200 ${
                      isDarkMode ? "bg-black border-white" : "bg-white border-black"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => {
                          setSelectedRoutine(routine)
                          setCurrentView("routine")
                        }}
                      >
                        <div className="flex items-center gap-4 mb-2">
                          <div className={`text-4xl font-black ${isDarkMode ? "text-white" : "text-black"}`}>
                            {String((currentPage - 1) * ROUTINES_PER_PAGE + index + 1).padStart(2, "0")}
                          </div>
                          <div>
                            <h4
                              className={`text-xl font-black uppercase tracking-wide ${
                                isDarkMode ? "text-white" : "text-black"
                              }`}
                            >
                              {routine.name}
                            </h4>
                            <p
                              className={`uppercase tracking-wider text-xs ${
                                isDarkMode ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              {new Date(routine.date).toLocaleDateString("es-ES", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div
                            className={`px-4 py-1 border-2 text-xs font-black uppercase tracking-wider ${
                              routine.completed
                                ? isDarkMode
                                  ? "bg-white text-black border-white"
                                  : "bg-black text-white border-black"
                                : isDarkMode
                                  ? "bg-black text-white border-white"
                                  : "bg-white text-black border-black"
                            }`}
                          >
                            {routine.completed ? "COMPLETADA" : "PENDIENTE"}
                          </div>
                          <div
                            className={`text-sm uppercase tracking-wide ${
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {routine.exercises.length} EJERCICIOS • SEMANA {routine.week}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Botón Duplicar */}
                        <div className="relative group/duplicate">
                          <div
                            className={`absolute inset-0 transform rotate-45 group-hover/duplicate:rotate-90 transition-transform duration-300 ${isDarkMode ? "bg-white" : "bg-black"}`}
                          ></div>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              duplicateRoutine(routine)
                            }}
                            className={`relative border-2 p-3 transform -rotate-45 group-hover/duplicate:rotate-0 transition-all duration-300 ${
                              isDarkMode
                                ? "bg-black text-white border-white hover:bg-white hover:text-black"
                                : "bg-white text-black border-black hover:bg-black hover:text-white"
                            }`}
                            title="Duplicar rutina"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          </Button>
                        </div>

                        {/* Botón Ver */}
                        <div className="text-right">
                          <div
                            className={`w-12 h-12 border-2 flex items-center justify-center transform rotate-45 group-hover:rotate-90 transition-transform duration-300 cursor-pointer ${
                              isDarkMode ? "border-white" : "border-black"
                            }`}
                            onClick={() => {
                              setSelectedRoutine(routine)
                              setCurrentView("routine")
                            }}
                          >
                            <TrendingUp
                              className={`h-6 w-6 transform -rotate-45 group-hover:-rotate-90 transition-transform duration-300 ${
                                isDarkMode ? "text-white" : "text-black"
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="relative">
                <div
                  className={`absolute inset-0 transform translate-x-2 translate-y-2 ${isDarkMode ? "bg-white" : "bg-black"}`}
                ></div>
                <div
                  className={`relative border-2 p-4 flex items-center gap-4 ${isDarkMode ? "bg-black border-white" : "bg-white border-black"}`}
                >
                  <Button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`border-2 px-4 py-2 font-black uppercase tracking-wide disabled:opacity-50 ${
                      isDarkMode
                        ? "bg-black text-white border-white hover:bg-white hover:text-black"
                        : "bg-white text-black border-black hover:bg-black hover:text-white"
                    }`}
                  >
                    ← ANTERIOR
                  </Button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 border-2 font-black ${
                          page === currentPage
                            ? isDarkMode
                              ? "bg-white text-black border-white"
                              : "bg-black text-white border-black"
                            : isDarkMode
                              ? "bg-black text-white border-white hover:bg-white hover:text-black"
                              : "bg-white text-black border-black hover:bg-black hover:text-white"
                        }`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`border-2 px-4 py-2 font-black uppercase tracking-wide disabled:opacity-50 ${
                      isDarkMode
                        ? "bg-black text-white border-white hover:bg-white hover:text-black"
                        : "bg-white text-black border-black hover:bg-black hover:text-white"
                    }`}
                  >
                    SIGUIENTE →
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}