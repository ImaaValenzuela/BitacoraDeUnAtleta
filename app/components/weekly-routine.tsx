"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Calendar, CheckCircle, Edit3, Save, X, TrendingUp, Target, Zap } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

interface WeeklyRoutineProps {
  routine: Routine
  onUpdate: (routine: Routine) => void
  onBack: () => void
  allRoutines: Routine[]
  isDarkMode?: boolean
}

export function WeeklyRoutine({ routine, onUpdate, onBack, allRoutines, isDarkMode = true }: WeeklyRoutineProps) {
  const [editingExercise, setEditingExercise] = useState<string | null>(null)
  const [editedExercise, setEditedExercise] = useState<Exercise | null>(null)

  const toggleComplete = () => {
    onUpdate({ ...routine, completed: !routine.completed })
  }

  const startEditing = (exercise: Exercise) => {
    setEditingExercise(exercise.id)
    setEditedExercise({ ...exercise })
  }

  // Actualizar la función saveExercise para mostrar feedback:
  const saveExercise = () => {
    if (!editedExercise) return

    const updatedExercises = routine.exercises.map((ex) => (ex.id === editedExercise.id ? editedExercise : ex))

    onUpdate({ ...routine, exercises: updatedExercises })
    setEditingExercise(null)
    setEditedExercise(null)

    // Feedback visual
    console.log("✅ Ejercicio actualizado y guardado automáticamente")
  }

  const cancelEditing = () => {
    setEditingExercise(null)
    setEditedExercise(null)
  }

  // Obtener rutinas de la misma semana para comparar
  const weekRoutines = allRoutines.filter((r) => r.week === routine.week)

  // Obtener rutinas similares (mismo nombre) para comparar progreso
  const similarRoutines = allRoutines
    .filter((r) => r.name.toLowerCase() === routine.name.toLowerCase() && r.id !== routine.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-black text-white" : "bg-white text-black"} relative overflow-hidden`}
    >
      {/* Geometric Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-1/4 w-64 h-64 border border-white rotate-45"></div>
        <div className="absolute bottom-1/4 left-0 w-80 h-80 border border-white rotate-12 transform -translate-x-40"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-8">
        {/* Dramatic Header */}
        <div className="flex items-center justify-between py-8">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-white transform rotate-45 group-hover:rotate-90 transition-transform duration-300"></div>
              <Button
                variant="ghost"
                onClick={onBack}
                className={`relative ${isDarkMode ? "bg-black text-white" : "bg-white text-black"} border-2 border-white p-3 transform -rotate-45 group-hover:rotate-0 transition-transform duration-300`}
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </div>
            <div>
              <h1 className="text-5xl font-black uppercase tracking-tighter">{routine.name}</h1>
              <div className="flex items-center gap-4 mt-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-gray-400 uppercase tracking-wider font-bold">
                  {new Date(routine.date).toLocaleDateString("es-ES", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <div
                  className={`${isDarkMode ? "bg-white text-black" : "bg-black text-white"} px-3 py-1 font-black uppercase text-sm`}
                >
                  SEMANA {routine.week}
                </div>
              </div>
              {/* Agregar indicadores de sincronización y guardado: */}
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 uppercase tracking-wider text-xs font-bold">SINCRONIZADO</span>
                </div>
                <div className="h-4 w-px bg-gray-600"></div>
                <span className="text-gray-400 uppercase tracking-wider text-xs">
                  ÚLTIMA ACTUALIZACIÓN:{" "}
                  {new Date().toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-white transform skew-x-12 group-hover:skew-x-6 transition-transform duration-300"></div>
            <Button
              onClick={toggleComplete}
              className={`relative border-2 border-white px-8 py-4 font-black uppercase tracking-wider transform -skew-x-12 group-hover:-skew-x-6 transition-all duration-300 ${
                routine.completed
                  ? `${isDarkMode ? "bg-white text-black hover:bg-black hover:text-white" : "bg-black text-white hover:bg-white hover:text-black"}`
                  : `${isDarkMode ? "bg-black text-white hover:bg-white hover:text-black" : "bg-white text-black hover:bg-black hover:text-white"}`
              }`}
            >
              <CheckCircle className="h-5 w-5 mr-3" />
              {routine.completed ? "COMPLETADA" : "MARCAR COMPLETADA"}
            </Button>
          </div>
        </div>

        {/* Radical Tabs */}
        <div className="relative">
          <Tabs defaultValue="routine" className="w-full">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-white transform translate-y-2"></div>
              <TabsList
                className={`relative ${isDarkMode ? "bg-black" : "bg-white"} border-4 border-white grid w-full grid-cols-3 p-2`}
              >
                <TabsTrigger
                  value="routine"
                  className={`data-[state=active]:${isDarkMode ? "bg-white text-black" : "bg-black text-white"} font-black uppercase tracking-wider border-2 border-transparent data-[state=active]:border-black`}
                >
                  <Target className="h-4 w-4 mr-2" />
                  RUTINA ACTUAL
                </TabsTrigger>
                <TabsTrigger
                  value="week"
                  className={`data-[state=active]:${isDarkMode ? "bg-white text-black" : "bg-black text-white"} font-black uppercase tracking-wider border-2 border-transparent data-[state=active]:border-black`}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  ESTA SEMANA
                </TabsTrigger>
                <TabsTrigger
                  value="progress"
                  className={`data-[state=active]:${isDarkMode ? "bg-white text-black" : "bg-black text-white"} font-black uppercase tracking-wider border-2 border-transparent data-[state=active]:border-black`}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  PROGRESO
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="routine" className="space-y-8">
              {/* Exercise List */}
              <div className="relative">
                <div className="absolute inset-0 bg-white transform translate-x-4 translate-y-4"></div>
                <div className={`relative ${isDarkMode ? "bg-black" : "bg-white"} border-4 border-white p-8`}>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <Zap className="h-8 w-8 text-white" />
                      <h3 className="text-3xl font-black uppercase tracking-wider">
                        EJERCICIOS ({routine.exercises.length})
                      </h3>
                    </div>
                    <div className="text-gray-400 uppercase tracking-wider font-bold text-sm">
                      {routine.completed ? "RUTINA COMPLETADA" : "EDITA PARA REGISTRAR PROGRESO"}
                    </div>
                  </div>

                  <div className="space-y-6">
                    {routine.exercises.map((exercise, index) => (
                      <div key={exercise.id} className="relative group">
                        {editingExercise === exercise.id ? (
                          // Edit Mode
                          <div className="relative">
                            <div className="absolute inset-0 bg-white transform translate-x-2 translate-y-2"></div>
                            <div
                              className={`relative ${isDarkMode ? "bg-black" : "bg-white"} border-2 border-white p-6 space-y-6`}
                            >
                              <div className="flex items-center justify-between">
                                <h4 className="text-2xl font-black uppercase tracking-wide">
                                  {String(index + 1).padStart(2, "0")}. {exercise.name}
                                </h4>
                                <div className="flex gap-3">
                                  <div className="relative group">
                                    <div className="absolute inset-0 bg-white transform skew-x-12"></div>
                                    <Button
                                      size="sm"
                                      onClick={saveExercise}
                                      className={`relative ${isDarkMode ? "bg-black text-white hover:bg-white hover:text-black" : "bg-white text-black hover:bg-black hover:text-white"} border-2 border-white px-4 py-2 font-black uppercase transform -skew-x-12`}
                                    >
                                      <Save className="h-4 w-4 mr-2" />
                                      GUARDAR
                                    </Button>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={cancelEditing}
                                    className={`${isDarkMode ? "bg-black text-white hover:bg-white hover:text-black" : "bg-white text-black hover:bg-black hover:text-white"} border-2 border-white`}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                  <Label className="text-white uppercase tracking-wider font-bold text-sm mb-2 block">
                                    SETS
                                  </Label>
                                  <Input
                                    type="number"
                                    value={editedExercise?.sets || 0}
                                    onChange={(e) =>
                                      setEditedExercise((prev) =>
                                        prev ? { ...prev, sets: Number.parseInt(e.target.value) || 0 } : null,
                                      )
                                    }
                                    className={`${isDarkMode ? "bg-black text-white" : "bg-white text-black"} border-2 border-white font-bold text-center focus:border-gray-400`}
                                  />
                                </div>
                                <div>
                                  <Label className="text-white uppercase tracking-wider font-bold text-sm mb-2 block">
                                    REPS
                                  </Label>
                                  <Input
                                    value={editedExercise?.reps || ""}
                                    onChange={(e) =>
                                      setEditedExercise((prev) => (prev ? { ...prev, reps: e.target.value } : null))
                                    }
                                    className={`${isDarkMode ? "bg-black text-white" : "bg-white text-black"} border-2 border-white font-bold uppercase focus:border-gray-400`}
                                  />
                                </div>
                                <div>
                                  <Label className="text-white uppercase tracking-wider font-bold text-sm mb-2 block">
                                    RPE
                                  </Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={editedExercise?.rpe || ""}
                                    onChange={(e) =>
                                      setEditedExercise((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              rpe: e.target.value ? Number.parseInt(e.target.value) : undefined,
                                            }
                                          : null,
                                      )
                                    }
                                    className={`${isDarkMode ? "bg-black text-white" : "bg-white text-black"} border-2 border-white font-bold text-center focus:border-gray-400`}
                                  />
                                </div>
                                <div>
                                  <Label className="text-white uppercase tracking-wider font-bold text-sm mb-2 block">
                                    RIR
                                  </Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="5"
                                    value={editedExercise?.rir || ""}
                                    onChange={(e) =>
                                      setEditedExercise((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              rir: e.target.value ? Number.parseInt(e.target.value) : undefined,
                                            }
                                          : null,
                                      )
                                    }
                                    className={`${isDarkMode ? "bg-black text-white" : "bg-white text-black"} border-2 border-white font-bold text-center focus:border-gray-400`}
                                  />
                                </div>
                              </div>

                              <div>
                                <Label className="text-white uppercase tracking-wider font-bold text-sm mb-2 block">
                                  COMENTARIOS
                                </Label>
                                <Textarea
                                  value={editedExercise?.comments || ""}
                                  onChange={(e) =>
                                    setEditedExercise((prev) => (prev ? { ...prev, comments: e.target.value } : null))
                                  }
                                  placeholder="¿CÓMO TE SENTISTE? ¿ALGUNA OBSERVACIÓN TÉCNICA?"
                                  className={`${isDarkMode ? "bg-black text-white placeholder-gray-400" : "bg-white text-black placeholder-gray-400"} border-2 border-white font-medium focus:border-gray-400 min-h-[100px]`}
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          // View Mode
                          <div className="relative">
                            <div className="absolute inset-0 bg-white transform translate-x-2 translate-y-2 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform duration-200"></div>
                            <div
                              className={`relative ${isDarkMode ? "bg-black" : "bg-white"} border-2 border-white p-6 group-hover:transform group-hover:-translate-x-1 group-hover:-translate-y-1 transition-transform duration-200`}
                            >
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                  <div className="text-4xl font-black text-white">
                                    {String(index + 1).padStart(2, "0")}
                                  </div>
                                  <h4 className="text-2xl font-black uppercase tracking-wide">{exercise.name}</h4>
                                </div>
                                <div className="relative group">
                                  <div className="absolute inset-0 bg-white transform rotate-45 group-hover:rotate-90 transition-transform duration-300"></div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => startEditing(exercise)}
                                    className={`relative ${isDarkMode ? "bg-black text-white" : "bg-white text-black"} border-2 border-white p-3 transform -rotate-45 group-hover:rotate-0 transition-transform duration-300`}
                                  >
                                    <Edit3 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-3 mb-4">
                                <div
                                  className={`${isDarkMode ? "bg-white text-black" : "bg-black text-white"} px-4 py-2 font-black uppercase text-sm`}
                                >
                                  {exercise.sets} SETS
                                </div>
                                <div
                                  className={`${isDarkMode ? "bg-white text-black" : "bg-black text-white"} px-4 py-2 font-black uppercase text-sm`}
                                >
                                  {exercise.reps} REPS
                                </div>
                                {exercise.rpe && (
                                  <div className="border-2 border-white text-white px-4 py-2 font-black uppercase text-sm">
                                    RPE: {exercise.rpe}
                                  </div>
                                )}
                                {exercise.rir !== undefined && (
                                  <div className="border-2 border-white text-white px-4 py-2 font-black uppercase text-sm">
                                    RIR: {exercise.rir}
                                  </div>
                                )}
                              </div>

                              {exercise.comments && (
                                <div className="border-l-4 border-white pl-6 mt-4">
                                  <p className="text-gray-300 italic font-medium text-lg">"{exercise.comments}"</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="week" className="space-y-8">
              <div className="relative">
                <div className="absolute inset-0 bg-white transform -translate-x-4 translate-y-4"></div>
                <div className={`relative ${isDarkMode ? "bg-black" : "bg-white"} border-4 border-white p-8`}>
                  <div className="flex items-center gap-4 mb-8">
                    <Calendar className="h-8 w-8 text-white" />
                    <h3 className="text-3xl font-black uppercase tracking-wider">SEMANA {routine.week}</h3>
                  </div>

                  <div className="space-y-4">
                    {weekRoutines.map((weekRoutine) => (
                      <div
                        key={weekRoutine.id}
                        className={`relative group ${weekRoutine.id === routine.id ? "opacity-100" : "opacity-75"}`}
                      >
                        <div className="absolute inset-0 bg-white transform translate-x-2 translate-y-2 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform duration-200"></div>
                        <div
                          className={`relative border-2 border-white p-6 ${weekRoutine.id === routine.id ? "bg-gray-900" : `${isDarkMode ? "bg-black" : "bg-white"}`}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-2xl font-black text-white">
                                {new Date(weekRoutine.date).getDate().toString().padStart(2, "0")}
                              </div>
                              <div>
                                <h4 className="text-xl font-black uppercase tracking-wide text-white">
                                  {weekRoutine.name}
                                </h4>
                                <p className="text-gray-400 uppercase tracking-wider text-sm">
                                  {new Date(weekRoutine.date).toLocaleDateString("es-ES")}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div
                                className={`px-4 py-2 border-2 font-black uppercase text-sm ${
                                  weekRoutine.completed
                                    ? `${isDarkMode ? "bg-white text-black border-white" : "bg-black text-white border-white"}`
                                    : `${isDarkMode ? "bg-black text-white border-white" : "bg-white text-black border-white"}`
                                }`}
                              >
                                {weekRoutine.completed ? "COMPLETADA" : "PENDIENTE"}
                              </div>
                              {weekRoutine.id === routine.id && (
                                <div className="bg-gray-700 text-white px-3 py-2 font-black uppercase text-sm">
                                  ACTUAL
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-400 uppercase tracking-wide text-sm mt-2">
                            {weekRoutine.exercises.length} EJERCICIOS
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="progress" className="space-y-8">
              <div className="relative">
                <div className="absolute inset-0 bg-white transform translate-x-4 -translate-y-4"></div>
                <div className={`relative ${isDarkMode ? "bg-black" : "bg-white"} border-4 border-white p-8`}>
                  <div className="flex items-center gap-4 mb-8">
                    <TrendingUp className="h-8 w-8 text-white" />
                    <h3 className="text-3xl font-black uppercase tracking-wider">PROGRESO - {routine.name}</h3>
                  </div>

                  {similarRoutines.length === 0 ? (
                    <div className="text-center py-16 space-y-6">
                      <div className="relative inline-block">
                        <Target className="h-24 w-24 text-white opacity-20" />
                        <div className="absolute inset-0 border-2 border-white rotate-45 transform scale-150"></div>
                      </div>
                      <div>
                        <p className="text-2xl font-bold uppercase tracking-wider text-white">SIN HISTORIAL</p>
                        <p className="text-gray-400 uppercase tracking-wide text-sm mt-2">
                          NO HAY RUTINAS ANTERIORES SIMILARES
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {similarRoutines.map((pastRoutine, index) => (
                        <div key={pastRoutine.id} className="relative group">
                          <div className="absolute inset-0 bg-white transform translate-x-2 translate-y-2 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform duration-200"></div>
                          <div className="relative bg-black border-2 border-white p-6">
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-4">
                                <div className="text-3xl font-black text-white">
                                  {String(index + 1).padStart(2, "0")}
                                </div>
                                <h4 className="text-xl font-black uppercase tracking-wide">{pastRoutine.name}</h4>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="bg-white text-black px-3 py-1 font-black uppercase text-sm">
                                  {new Date(pastRoutine.date).toLocaleDateString("es-ES")}
                                </div>
                                <div className="border-2 border-white text-white px-3 py-1 font-black uppercase text-sm">
                                  SEMANA {pastRoutine.week}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {pastRoutine.exercises.map((ex) => (
                                <div key={ex.id} className="border border-white p-4">
                                  <h5 className="font-black text-white uppercase text-sm mb-2">{ex.name}</h5>
                                  <div className="flex flex-wrap gap-2">
                                    <div className="bg-white text-black px-2 py-1 text-xs font-black uppercase">
                                      {ex.sets}×{ex.reps}
                                    </div>
                                    {ex.rpe && (
                                      <div className="border border-white text-white px-2 py-1 text-xs font-black uppercase">
                                        RPE:{ex.rpe}
                                      </div>
                                    )}
                                    {ex.rir !== undefined && (
                                      <div className="border border-white text-white px-2 py-1 text-xs font-black uppercase">
                                        RIR:{ex.rir}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
