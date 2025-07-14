"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Trash2, Save, Zap, Target } from "lucide-react"

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
  name: string
  date: string
  week: string
  exercises: Exercise[]
  completed: boolean
}

interface CreateRoutineProps {
  onSave: (routine: Routine) => void
  onCancel: () => void
  isDarkMode?: boolean
}

export function CreateRoutine({ onSave, onCancel, isDarkMode = true }: CreateRoutineProps) {
  const [routineName, setRoutineName] = useState("")
  const [routineDate, setRoutineDate] = useState(new Date().toISOString().split("T")[0])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [newExercise, setNewExercise] = useState({
    name: "",
    sets: 1,
    reps: "",
    rpe: undefined as number | undefined,
    rir: undefined as number | undefined,
    comments: "",
  })

  const getWeekNumber = (date: Date) => {
    const startOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7)
  }

  const getWeekFromDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}-W${getWeekNumber(date)}`
  }

  const addExercise = () => {
    if (!newExercise.name || !newExercise.reps) return

    const exercise: Exercise = {
      id: Date.now().toString(),
      name: newExercise.name,
      sets: newExercise.sets,
      reps: newExercise.reps,
      rpe: newExercise.rpe,
      rir: newExercise.rir,
      comments: newExercise.comments || undefined,
    }

    setExercises((prev) => [...prev, exercise])
    setNewExercise({
      name: "",
      sets: 1,
      reps: "",
      rpe: undefined,
      rir: undefined,
      comments: "",
    })
  }

  const removeExercise = (id: string) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== id))
  }

  const handleSave = () => {
    if (!routineName || exercises.length === 0) return

    const routine: Routine = {
      name: routineName,
      date: routineDate,
      week: getWeekFromDate(routineDate),
      exercises,
      completed: false,
    }

    // Mostrar confirmación visual
    console.log("💾 Guardando rutina:", routine.name)
    onSave(routine)
  }

  return (
    <div
      className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${
        isDarkMode ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      {/* Geometric Background */}
      <div className="absolute inset-0 opacity-5">
        <div
          className={`absolute top-1/4 left-0 w-72 h-72 border rotate-45 transform -translate-x-36 ${
            isDarkMode ? "border-white" : "border-black"
          }`}
        ></div>
        <div
          className={`absolute bottom-1/4 right-0 w-96 h-96 border rotate-12 transform translate-x-48 ${
            isDarkMode ? "border-white" : "border-black"
          }`}
        ></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-6 space-y-8">
        {/* Dramatic Header */}
        <div className="flex items-center justify-between py-8">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div
                className={`absolute inset-0 transform rotate-45 group-hover:rotate-90 transition-transform duration-300 ${
                  isDarkMode ? "bg-white" : "bg-black"
                }`}
              ></div>
              <Button
                variant="ghost"
                onClick={onCancel}
                className={`relative border-2 p-3 transform -rotate-45 group-hover:rotate-0 transition-transform duration-300 ${
                  isDarkMode ? "bg-black text-white border-white" : "bg-white text-black border-black"
                }`}
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </div>
            <div>
              <h1
                className={`text-5xl font-black uppercase tracking-tighter ${isDarkMode ? "text-white" : "text-black"}`}
              >
                CREAR
              </h1>
              <h2
                className={`text-3xl font-black uppercase tracking-wider -mt-2 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                RUTINA
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rotate-45 ${isDarkMode ? "bg-white" : "bg-black"}`}></div>
            <div className={`w-4 h-4 border-2 rotate-45 ${isDarkMode ? "border-white" : "border-black"}`}></div>
            <div className={`w-2 h-2 rotate-45 ${isDarkMode ? "bg-white" : "bg-black"}`}></div>
          </div>
        </div>

        {/* Routine Info Card */}
        <div className="relative">
          <div
            className={`absolute inset-0 transform translate-x-4 translate-y-4 ${isDarkMode ? "bg-white" : "bg-black"}`}
          ></div>
          <div className={`relative border-4 p-8 ${isDarkMode ? "bg-black border-white" : "bg-white border-black"}`}>
            <div className="flex items-center gap-4 mb-6">
              <Target className={`h-8 w-8 ${isDarkMode ? "text-white" : "text-black"}`} />
              <h3
                className={`text-2xl font-black uppercase tracking-wider ${isDarkMode ? "text-white" : "text-black"}`}
              >
                CONFIGURACIÓN
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <Label
                    className={`uppercase tracking-wider font-bold text-sm mb-2 block ${
                      isDarkMode ? "text-white" : "text-black"
                    }`}
                  >
                    NOMBRE DE RUTINA
                  </Label>
                  <Input
                    placeholder="PUSH DAY, PIERNAS, ESPALDA..."
                    value={routineName}
                    onChange={(e) => setRoutineName(e.target.value)}
                    className={`border-2 text-lg font-bold uppercase tracking-wide ${
                      isDarkMode
                        ? "bg-black border-white text-white placeholder-gray-400 focus:border-gray-400"
                        : "bg-white border-black text-black placeholder-gray-600 focus:border-gray-600"
                    }`}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label
                    className={`uppercase tracking-wider font-bold text-sm mb-2 block ${
                      isDarkMode ? "text-white" : "text-black"
                    }`}
                  >
                    FECHA
                  </Label>
                  <Input
                    type="date"
                    value={routineDate}
                    onChange={(e) => setRoutineDate(e.target.value)}
                    className={`border-2 text-lg font-bold ${
                      isDarkMode
                        ? "bg-black border-white text-white focus:border-gray-400"
                        : "bg-white border-black text-black focus:border-gray-600"
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div
                className={`inline-block px-4 py-2 font-black uppercase tracking-wider text-sm ${
                  isDarkMode ? "bg-white text-black" : "bg-black text-white"
                }`}
              >
                SEMANA: {getWeekFromDate(routineDate)}
              </div>
            </div>
          </div>
        </div>

        {/* Add Exercise Section */}
        <div className="relative">
          <div
            className={`absolute inset-0 transform -translate-x-4 translate-y-4 ${
              isDarkMode ? "bg-white" : "bg-black"
            }`}
          ></div>
          <div className={`relative border-4 p-8 ${isDarkMode ? "bg-black border-white" : "bg-white border-black"}`}>
            <div className="flex items-center gap-4 mb-6">
              <Zap className={`h-8 w-8 ${isDarkMode ? "text-white" : "text-black"}`} />
              <h3
                className={`text-2xl font-black uppercase tracking-wider ${isDarkMode ? "text-white" : "text-black"}`}
              >
                AGREGAR EJERCICIO
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <Label
                  className={`uppercase tracking-wider font-bold text-sm mb-2 block ${
                    isDarkMode ? "text-white" : "text-black"
                  }`}
                >
                  EJERCICIO
                </Label>
                <Input
                  placeholder="PRESS DE BANCA"
                  value={newExercise.name}
                  onChange={(e) => setNewExercise((prev) => ({ ...prev, name: e.target.value }))}
                  className={`border-2 font-bold uppercase tracking-wide ${
                    isDarkMode
                      ? "bg-black border-white text-white placeholder-gray-400 focus:border-gray-400"
                      : "bg-white border-black text-black placeholder-gray-600 focus:border-gray-600"
                  }`}
                />
              </div>
              <div>
                <Label
                  className={`uppercase tracking-wider font-bold text-sm mb-2 block ${
                    isDarkMode ? "text-white" : "text-black"
                  }`}
                >
                  SETS
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={newExercise.sets}
                  onChange={(e) => setNewExercise((prev) => ({ ...prev, sets: Number.parseInt(e.target.value) || 1 }))}
                  className={`border-2 font-bold text-center ${
                    isDarkMode
                      ? "bg-black border-white text-white focus:border-gray-400"
                      : "bg-white border-black text-black focus:border-gray-600"
                  }`}
                />
              </div>
              <div>
                <Label
                  className={`uppercase tracking-wider font-bold text-sm mb-2 block ${
                    isDarkMode ? "text-white" : "text-black"
                  }`}
                >
                  REPS
                </Label>
                <Input
                  placeholder="8-12, 15, AMRAP"
                  value={newExercise.reps}
                  onChange={(e) => setNewExercise((prev) => ({ ...prev, reps: e.target.value }))}
                  className={`border-2 font-bold uppercase ${
                    isDarkMode
                      ? "bg-black border-white text-white placeholder-gray-400 focus:border-gray-400"
                      : "bg-white border-black text-black placeholder-gray-600 focus:border-gray-600"
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label
                  className={`uppercase tracking-wider font-bold text-sm mb-2 block ${
                    isDarkMode ? "text-white" : "text-black"
                  }`}
                >
                  RPE (1-10)
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  placeholder="ESFUERZO PERCIBIDO"
                  value={newExercise.rpe || ""}
                  onChange={(e) =>
                    setNewExercise((prev) => ({
                      ...prev,
                      rpe: e.target.value ? Number.parseInt(e.target.value) : undefined,
                    }))
                  }
                  className={`border-2 font-bold text-center ${
                    isDarkMode
                      ? "bg-black border-white text-white placeholder-gray-400 focus:border-gray-400"
                      : "bg-white border-black text-black placeholder-gray-600 focus:border-gray-600"
                  }`}
                />
              </div>
              <div>
                <Label
                  className={`uppercase tracking-wider font-bold text-sm mb-2 block ${
                    isDarkMode ? "text-white" : "text-black"
                  }`}
                >
                  RIR (0-5)
                </Label>
                <Input
                  type="number"
                  min="0"
                  max="5"
                  placeholder="REPS EN RESERVA"
                  value={newExercise.rir || ""}
                  onChange={(e) =>
                    setNewExercise((prev) => ({
                      ...prev,
                      rir: e.target.value ? Number.parseInt(e.target.value) : undefined,
                    }))
                  }
                  className={`border-2 font-bold text-center ${
                    isDarkMode
                      ? "bg-black border-white text-white placeholder-gray-400 focus:border-gray-400"
                      : "bg-white border-black text-black placeholder-gray-600 focus:border-gray-600"
                  }`}
                />
              </div>
            </div>

            <div className="mb-6">
              <Label
                className={`uppercase tracking-wider font-bold text-sm mb-2 block ${
                  isDarkMode ? "text-white" : "text-black"
                }`}
              >
                COMENTARIOS
              </Label>
              <Textarea
                placeholder="NOTAS SOBRE TÉCNICA, SENSACIONES..."
                value={newExercise.comments}
                onChange={(e) => setNewExercise((prev) => ({ ...prev, comments: e.target.value }))}
                className={`border-2 font-medium min-h-[100px] ${
                  isDarkMode
                    ? "bg-black border-white text-white placeholder-gray-400 focus:border-gray-400"
                    : "bg-white border-black text-black placeholder-gray-600 focus:border-gray-600"
                }`}
              />
            </div>

            <div className="relative group">
              <div
                className={`absolute inset-0 transform skew-x-12 group-hover:skew-x-6 transition-transform duration-300 ${
                  isDarkMode ? "bg-white" : "bg-black"
                }`}
              ></div>
              <Button
                onClick={addExercise}
                className={`relative w-full border-2 py-4 text-lg font-black uppercase tracking-wider transform -skew-x-12 group-hover:-skew-x-6 transition-all duration-300 ${
                  isDarkMode
                    ? "bg-black text-white border-white hover:bg-white hover:text-black"
                    : "bg-white text-black border-black hover:bg-black hover:text-white"
                }`}
              >
                <Plus className="h-5 w-5 mr-3" />
                AGREGAR EJERCICIO
              </Button>
            </div>
          </div>
        </div>

        {/* Exercise List */}
        {exercises.length > 0 && (
          <div className="relative">
            <div
              className={`absolute inset-0 transform translate-x-4 -translate-y-4 ${
                isDarkMode ? "bg-white" : "bg-black"
              }`}
            ></div>
            <div className={`relative border-4 p-8 ${isDarkMode ? "bg-black border-white" : "bg-white border-black"}`}>
              <div className="flex items-center justify-between mb-6">
                <h3
                  className={`text-2xl font-black uppercase tracking-wider ${isDarkMode ? "text-white" : "text-black"}`}
                >
                  EJERCICIOS ({exercises.length})
                </h3>
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(exercises.length, 5) }).map((_, i) => (
                    <div key={i} className={`w-3 h-3 rotate-45 ${isDarkMode ? "bg-white" : "bg-black"}`}></div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {exercises.map((exercise, index) => (
                  <div key={exercise.id} className="relative group">
                    <div
                      className={`absolute inset-0 transform translate-x-2 translate-y-2 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform duration-200 ${
                        isDarkMode ? "bg-white" : "bg-black"
                      }`}
                    ></div>
                    <div
                      className={`relative border-2 p-6 ${
                        isDarkMode ? "bg-black border-white" : "bg-white border-black"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`text-3xl font-black ${isDarkMode ? "text-white" : "text-black"}`}>
                            {String(index + 1).padStart(2, "0")}
                          </div>
                          <h4
                            className={`text-xl font-black uppercase tracking-wide ${
                              isDarkMode ? "text-white" : "text-black"
                            }`}
                          >
                            {exercise.name}
                          </h4>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExercise(exercise.id)}
                          className={`border ${
                            isDarkMode
                              ? "text-white hover:text-black hover:bg-white border-white"
                              : "text-black hover:text-white hover:bg-black border-black"
                          }`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-3 mb-4">
                        <div
                          className={`px-3 py-1 font-black uppercase text-sm ${
                            isDarkMode ? "bg-white text-black" : "bg-black text-white"
                          }`}
                        >
                          {exercise.sets} SETS
                        </div>
                        <div
                          className={`px-3 py-1 font-black uppercase text-sm ${
                            isDarkMode ? "bg-white text-black" : "bg-black text-white"
                          }`}
                        >
                          {exercise.reps} REPS
                        </div>
                        {exercise.rpe && (
                          <div
                            className={`border-2 px-3 py-1 font-black uppercase text-sm ${
                              isDarkMode ? "border-white text-white" : "border-black text-black"
                            }`}
                          >
                            RPE: {exercise.rpe}
                          </div>
                        )}
                        {exercise.rir !== undefined && (
                          <div
                            className={`border-2 px-3 py-1 font-black uppercase text-sm ${
                              isDarkMode ? "border-white text-white" : "border-black text-black"
                            }`}
                          >
                            RIR: {exercise.rir}
                          </div>
                        )}
                      </div>

                      {exercise.comments && (
                        <div className={`border-l-4 pl-4 ${isDarkMode ? "border-white" : "border-black"}`}>
                          <p className={`italic font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                            "{exercise.comments}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-6 py-8">
          <div className="relative group">
            <div className={`absolute inset-0 transform skew-x-12 ${isDarkMode ? "bg-white" : "bg-black"}`}></div>
            <Button
              variant="outline"
              onClick={onCancel}
              className={`relative border-2 px-8 py-3 font-black uppercase tracking-wider transform -skew-x-12 ${
                isDarkMode
                  ? "bg-black text-white border-white hover:bg-white hover:text-black"
                  : "bg-white text-black border-black hover:bg-black hover:text-white"
              }`}
            >
              CANCELAR
            </Button>
          </div>

          <div className="relative group">
            <div
              className={`absolute inset-0 transform skew-x-12 group-hover:skew-x-6 transition-transform duration-300 ${
                isDarkMode ? "bg-white" : "bg-black"
              }`}
            ></div>
            <Button
              onClick={handleSave}
              disabled={!routineName || exercises.length === 0}
              className={`relative border-2 px-8 py-3 font-black uppercase tracking-wider transform -skew-x-12 group-hover:-skew-x-6 transition-all duration-300 disabled:opacity-50 ${
                isDarkMode
                  ? "bg-black text-white border-white hover:bg-white hover:text-black"
                  : "bg-white text-black border-black hover:bg-black hover:text-white"
              }`}
            >
              <Save className="h-5 w-5 mr-3" />
              GUARDAR RUTINA
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
