// Rutinas default por día
// Lunes = 1, Miércoles = 3, Viernes = 5
export const DEFAULT_ROUTINES = {
  1: {
    name: 'Lunes',
    focus: 'Pecho + Tríceps',
    color: '#E84545',
    exercises: [
      { id: 'e1', name: 'Press banca plano', sets: 4, reps: 10, restSeconds: 90, muscleGroup: 'Pecho' },
      { id: 'e2', name: 'Press banca inclinado', sets: 3, reps: 10, restSeconds: 90, muscleGroup: 'Pecho' },
      { id: 'e3', name: 'Aperturas con mancuernas', sets: 3, reps: 12, restSeconds: 60, muscleGroup: 'Pecho' },
      { id: 'e4', name: 'Fondos en paralelas', sets: 3, reps: 12, restSeconds: 60, muscleGroup: 'Tríceps' },
      { id: 'e5', name: 'Extensiones de tríceps', sets: 3, reps: 12, restSeconds: 60, muscleGroup: 'Tríceps' },
    ]
  },
  3: {
    name: 'Miércoles',
    focus: 'Espalda + Bíceps',
    color: '#4A90E2',
    exercises: [
      { id: 'e6', name: 'Dominadas', sets: 4, reps: 8, restSeconds: 90, muscleGroup: 'Espalda' },
      { id: 'e7', name: 'Remo con barra', sets: 4, reps: 10, restSeconds: 90, muscleGroup: 'Espalda' },
      { id: 'e8', name: 'Jalón al pecho', sets: 3, reps: 12, restSeconds: 60, muscleGroup: 'Espalda' },
      { id: 'e9', name: 'Curl con barra', sets: 3, reps: 12, restSeconds: 60, muscleGroup: 'Bíceps' },
      { id: 'e10', name: 'Curl martillo', sets: 3, reps: 12, restSeconds: 60, muscleGroup: 'Bíceps' },
    ]
  },
  5: {
    name: 'Viernes',
    focus: 'Piernas + Hombros',
    color: '#27AE60',
    exercises: [
      { id: 'e11', name: 'Sentadilla', sets: 4, reps: 10, restSeconds: 120, muscleGroup: 'Piernas' },
      { id: 'e12', name: 'Prensa', sets: 4, reps: 12, restSeconds: 90, muscleGroup: 'Piernas' },
      { id: 'e13', name: 'Extensiones de cuádriceps', sets: 3, reps: 12, restSeconds: 60, muscleGroup: 'Piernas' },
      { id: 'e14', name: 'Press militar', sets: 4, reps: 10, restSeconds: 90, muscleGroup: 'Hombros' },
      { id: 'e15', name: 'Elevaciones laterales', sets: 3, reps: 15, restSeconds: 60, muscleGroup: 'Hombros' },
    ]
  }
}

export const MUSCLE_GROUPS = [
  'Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps',
  'Piernas', 'Glúteos', 'Abdominales', 'Cardio', 'Otro'
]

export const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
export const TRAINING_DAYS = [1, 3, 5]
