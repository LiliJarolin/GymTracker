import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { useAuth } from '../hooks/useAuth'
import { DEFAULT_ROUTINES, DAY_NAMES, TRAINING_DAYS } from '../utils/routines'
import Timer from '../components/Timer'
import ExercisePicker from '../components/ExercisePicker'

export default function Today() {
  const { user } = useAuth()
  const today = new Date()
  const dayOfWeek = today.getDay()
  const isTrainingDay = TRAINING_DAYS.includes(dayOfWeek)
  const routine = DEFAULT_ROUTINES[dayOfWeek]

  const [mode, setMode] = useState(null)
  const [exercises, setExercises] = useState([])
  const [sets, setSets] = useState({})
  const [showTimer, setShowTimer] = useState(false)
  const [activeTimerRest, setActiveTimerRest] = useState(90)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [todayLog, setTodayLog] = useState(null)
  const [checkingLog, setCheckingLog] = useState(true)

  useEffect(() => {
    if (!user) return
    const dateKey = today.toISOString().split('T')[0]
    getDoc(doc(db, 'sessions', user.uid, 'logs', dateKey)).then(snap => {
      if (snap.exists()) setTodayLog(snap.data())
      setCheckingLog(false)
    })
  }, [user])

  function startRoutine() {
    const exs = routine?.exercises || []
    setExercises(exs)
    const initial = {}
    exs.forEach(ex => {
      initial[ex.id] = Array.from({ length: ex.sets }, () => ({ kg: '', reps: ex.reps, done: false }))
    })
    setSets(initial)
    setMode('routine')
  }

  function startFree() {
    setExercises([])
    setSets({})
    setMode('free')
  }

  function handlePickerSelect(ex) {
    setExercises(prev => [...prev, ex])
    setSets(prev => ({
      ...prev,
      [ex.id]: Array.from({ length: ex.sets }, () => ({ kg: '', reps: ex.reps, done: false }))
    }))
    setShowPicker(false)
  }

  function updateSet(exId, setIdx, field, value) {
    setSets(prev => {
      const updated = [...prev[exId]]
      updated[setIdx] = { ...updated[setIdx], [field]: value }
      return { ...prev, [exId]: updated }
    })
  }

  function toggleSetDone(exId, setIdx, restSeconds) {
    setSets(prev => {
      const updated = [...prev[exId]]
      const wasDone = updated[setIdx].done
      updated[setIdx] = { ...updated[setIdx], done: !wasDone }
      if (!wasDone) {
        setActiveTimerRest(restSeconds)
        setShowTimer(true)
      }
      return { ...prev, [exId]: updated }
    })
  }

  function addSetToExercise(exId) {
    const ex = exercises.find(e => e.id === exId)
    setSets(prev => ({
      ...prev,
      [exId]: [...prev[exId], { kg: '', reps: ex?.reps || 10, done: false }]
    }))
  }

  async function saveSession() {
    setSaving(true)
    const dateKey = today.toISOString().split('T')[0]
    const data = {
      date: dateKey,
      dayOfWeek,
      mode,
      focusLabel: mode === 'routine' ? (routine?.focus || '') : 'Sesión libre',
      exercises: exercises.map(ex => ({ ...ex, sets: sets[ex.id] || [] })),
      notes,
      savedAt: serverTimestamp()
    }
    await setDoc(doc(db, 'sessions', user.uid, 'logs', dateKey), data)
    setSaving(false)
    setTodayLog(data)
  }

  const totalDone = Object.values(sets).flat().filter(s => s.done).length
  const totalSets = Object.values(sets).flat().length

  if (checkingLog) return <div className="loading-screen"><div className="spinner" /></div>

  if (todayLog) {
    return (
      <div className="page fade-in">
        <div style={{ marginBottom: 20 }}>
          <p className="text-muted text-sm">{DAY_NAMES[dayOfWeek]}, {today.getDate()}/{today.getMonth() + 1}</p>
          <h1>Hoy</h1>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
          <h2 style={{ marginBottom: 4 }}>¡Entrenamiento registrado!</h2>
          <p className="text-muted">{todayLog.focusLabel}</p>
          <p className="text-muted text-sm" style={{ marginTop: 8 }}>
            {todayLog.exercises?.length} ejercicios ·{' '}
            {todayLog.exercises?.reduce((acc, ex) => acc + (ex.sets?.filter(s => s.done)?.length || 0), 0)} series completadas
          </p>
          {todayLog.notes && (
            <p className="text-sm" style={{ marginTop: 12, color: 'var(--text2)', fontStyle: 'italic' }}>
              "{todayLog.notes}"
            </p>
          )}
          <button className="btn btn-secondary btn-sm" style={{ marginTop: 16 }}
            onClick={() => setTodayLog(null)}>
            Modificar
          </button>
        </div>
      </div>
    )
  }

  if (!mode) {
    return (
      <div className="page fade-in">
        <div style={{ marginBottom: 24 }}>
          <p className="text-muted text-sm">{DAY_NAMES[dayOfWeek]}, {today.getDate()}/{today.getMonth() + 1}</p>
          <h1>Hoy</h1>
        </div>

        {isTrainingDay && routine && (
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <h3>{routine.name}</h3>
                <p className="text-muted text-sm">{routine.focus}</p>
              </div>
              <span className="badge badge-red">Día de entreno</span>
            </div>
            <p className="text-sm text-muted" style={{ marginBottom: 16 }}>
              {routine.exercises.length} ejercicios programados
            </p>
            <button className="btn btn-primary btn-full" onClick={startRoutine}>
              Hacer la rutina del día
            </button>
          </div>
        )}

        {!isTrainingDay && (
          <div className="card" style={{ marginBottom: 16, textAlign: 'center', padding: '24px 16px' }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>😴</p>
            <h3 style={{ marginBottom: 4 }}>Día de descanso</h3>
            <p className="text-muted text-sm">Descansá, que mañana volvemos.</p>
          </div>
        )}

        <div className="card">
          <h3 style={{ marginBottom: 4 }}>Sesión libre</h3>
          <p className="text-muted text-sm" style={{ marginBottom: 16 }}>
            Para cuando entrena el coach o querés hacer algo diferente.
          </p>
          <button className="btn btn-secondary btn-full" onClick={startFree}>
            Empezar sesión libre
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button className="btn btn-ghost" onClick={() => setMode(null)} style={{ padding: '6px 8px' }}>←</button>
        <div style={{ flex: 1 }}>
          <h2>{mode === 'routine' ? routine?.focus : 'Sesión libre'}</h2>
          <p className="text-muted text-sm">{totalDone}/{totalSets} series hechas</p>
        </div>
        <button className="btn btn-ghost" onClick={() => setShowTimer(t => !t)} style={{ fontSize: 20 }}>⏱</button>
      </div>

      {/* Timer */}
      {showTimer && (
        <div className="card slide-up" style={{ marginBottom: 16 }}>
          <Timer defaultSeconds={activeTimerRest} onClose={() => setShowTimer(false)} />
        </div>
      )}

      {/* Exercises */}
      {exercises.map(ex => (
        <ExerciseCard
          key={ex.id}
          exercise={ex}
          sets={sets[ex.id] || []}
          onUpdateSet={(setIdx, field, value) => updateSet(ex.id, setIdx, field, value)}
          onToggleDone={(setIdx) => toggleSetDone(ex.id, setIdx, ex.restSeconds)}
          onAddSet={() => addSetToExercise(ex.id)}
        />
      ))}

      <button className="btn btn-secondary btn-full" style={{ marginBottom: 12 }} onClick={() => setShowPicker(true)}>
        + Agregar ejercicio
      </button>

      {/* Notes */}
      <div style={{ marginBottom: 12 }}>
        <label className="text-sm text-muted" style={{ display: 'block', marginBottom: 6 }}>Notas de la sesión</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="¿Cómo te sentiste? ¿Algo para recordar?"
          rows={2}
          style={{ resize: 'none' }}
        />
      </div>

      <button className="btn btn-primary btn-full" onClick={saveSession} disabled={saving || exercises.length === 0}>
        {saving ? 'Guardando...' : '✓ Guardar entrenamiento'}
      </button>

      {showPicker && <ExercisePicker onSelect={handlePickerSelect} onClose={() => setShowPicker(false)} />}
    </div>
  )
}

function ExerciseCard({ exercise, sets, onUpdateSet, onToggleDone, onAddSet }) {
  const doneSets = sets.filter(s => s.done).length

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <h3 style={{ marginBottom: 2 }}>{exercise.name}</h3>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span className="tag">{exercise.muscleGroup}</span>
            {exercise.equipment && <span className="tag">🏋️ {exercise.equipment}</span>}
          </div>
        </div>
        <span className="text-sm text-muted">{doneSets}/{sets.length}</span>
      </div>

      <div className="set-row" style={{ marginBottom: 4 }}>
        <span />
        <span className="text-sm text-muted">Kg</span>
        <span className="text-sm text-muted">Reps</span>
        <span />
      </div>

      {sets.map((s, i) => (
        <div className="set-row" key={i}>
          <span className="set-num">{i + 1}</span>
          <input type="number" min="0" step="0.5" value={s.kg} onChange={e => onUpdateSet(i, 'kg', e.target.value)} placeholder="0" style={{ textAlign: 'center', padding: '8px 4px' }} />
          <input type="number" min="1" value={s.reps} onChange={e => onUpdateSet(i, 'reps', e.target.value)} style={{ textAlign: 'center', padding: '8px 4px' }} />
          <button className={`set-done ${s.done ? 'checked' : ''}`} onClick={() => onToggleDone(i)}>
            {s.done && <span style={{ color: '#fff', fontSize: 14 }}>✓</span>}
          </button>
        </div>
      ))}

      <button className="btn btn-ghost btn-sm" style={{ marginTop: 4, color: 'var(--text3)' }} onClick={onAddSet}>
        + serie
      </button>
    </div>
  )
}
