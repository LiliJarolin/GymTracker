// Rutinas default por día
// Lunes=1, Martes=2, Miércoles=3, Jueves=4, Viernes=5
export const DEFAULT_ROUTINES = {
  1: {
    name: 'Lunes',
    focus: 'Pecho + Bíceps',
    color: '#E84545',
    exercises: [
      { id: 'l1', name: 'Press banca plano', sets: 4, reps: 10, restSeconds: 90, muscleGroup: 'Pecho' },
      { id: 'l2', name: 'Press banca inclinado', sets: 3, reps: 10, restSeconds: 90, muscleGroup: 'Pecho' },
      { id: 'l3', name: 'Aperturas con mancuernas', sets: 3, reps: 12, restSeconds: 60, muscleGroup: 'Pecho' },
      { id: 'l4', name: 'Curl con barra', sets: 4, reps: 10, restSeconds: 60, muscleGroup: 'Bíceps' },
      { id: 'l5', name: 'Curl martillo', sets: 3, reps: 12, restSeconds: 60, muscleGroup: 'Bíceps' },
    ]
  },
  2: {
    name: 'Martes',
    focus: 'Espalda + Tríceps',
    color: '#9B59B6',
    exercises: [
      { id: 'm1', name: 'Dominadas', sets: 4, reps: 8, restSeconds: 90, muscleGroup: 'Espalda' },
      { id: 'm2', name: 'Remo con barra', sets: 4, reps: 10, restSeconds: 90, muscleGroup: 'Espalda' },
      { id: 'm3', name: 'Jalón al pecho', sets: 3, reps: 12, restSeconds: 60, muscleGroup: 'Espalda' },
      { id: 'm4', name: 'Fondos en paralelas', sets: 3, reps: 12, restSeconds: 60, muscleGroup: 'Tríceps' },
      { id: 'm5', name: 'Extensiones de tríceps', sets: 3, reps: 12, restSeconds: 60, muscleGroup: 'Tríceps' },
    ]
  },
  3: {
    name: 'Miércoles',
    focus: 'Pierna + Aductores',
    color: '#4A90E2',
    exercises: [
      { id: 'x1', name: 'Sentadilla', sets: 4, reps: 10, restSeconds: 120, muscleGroup: 'Piernas' },
      { id: 'x2', name: 'Prensa', sets: 4, reps: 12, restSeconds: 90, muscleGroup: 'Piernas' },
      { id: 'x3', name: 'Extensiones de cuádriceps', sets: 3, reps: 12, restSeconds: 60, muscleGroup: 'Piernas' },
      { id: 'x4', name: 'Aductores en máquina', sets: 4, reps: 15, restSeconds: 60, muscleGroup: 'Aductores' },
      { id: 'x5', name: 'Sentadilla sumo', sets: 3, reps: 12, restSeconds: 60, muscleGroup: 'Aductores' },
    ]
  },
  4: {
    name: 'Jueves',
    focus: 'Hombros + Superiores',
    color: '#F39C12',
    exercises: [
      { id: 'j1', name: 'Press militar', sets: 4, reps: 10, restSeconds: 90, muscleGroup: 'Hombros' },
      { id: 'j2', name: 'Elevaciones laterales', sets: 4, reps: 15, restSeconds: 60, muscleGroup: 'Hombros' },
      { id: 'j3', name: 'Elevaciones frontales', sets: 3, reps: 12, restSeconds: 60, muscleGroup: 'Hombros' },
      { id: 'j4', name: 'Encogimientos con barra', sets: 4, reps: 12, restSeconds: 60, muscleGroup: 'Trapecios' },
      { id: 'j5', name: 'Remo al cuello', sets: 3, reps: 12, restSeconds: 60, muscleGroup: 'Trapecios' },
    ]
  },
  5: {
    name: 'Viernes',
    focus: 'Pierna + Glúteos',
    color: '#27AE60',
    exercises: [
      { id: 'v1', name: 'Peso muerto rumano', sets: 4, reps: 10, restSeconds: 90, muscleGroup: 'Glúteos' },
      { id: 'v2', name: 'Hip thrust', sets: 4, reps: 12, restSeconds: 90, muscleGroup: 'Glúteos' },
      { id: 'v3', name: 'Curl femoral', sets: 3, reps: 12, restSeconds: 60, muscleGroup: 'Piernas' },
      { id: 'v4', name: 'Abductores en máquina', sets: 4, reps: 15, restSeconds: 60, muscleGroup: 'Glúteos' },
      { id: 'v5', name: 'Zancadas', sets: 3, reps: 12, restSeconds: 60, muscleGroup: 'Piernas' },
    ]
  }
}

export const MUSCLE_GROUPS = [
  'Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps',
  'Piernas', 'Glúteos', 'Aductores', 'Trapecios', 'Abdominales', 'Cardio', 'Otro'
]

export const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
export const TRAINING_DAYS = [1, 2, 3, 4, 5]
