import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { useAuth } from '../hooks/useAuth'
import { DEFAULT_ROUTINES, MUSCLE_GROUPS } from '../utils/routines'

export default function Routines() {
  const { user } = useAuth()
  const [routines, setRoutines] = useState(null)
  const [activeDay, setActiveDay] = useState(1)
  const [editing, setEditing] = useState(null) // exercise being edited
  const [showAdd, setShowAdd] = useState(false)
  const [newEx, setNewEx] = useState({ name: '', sets: 4, reps: 10, restSeconds: 90, muscleGroup: 'Otro' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    getDoc(doc(db, 'routines', user.uid)).then(snap => {
      if (snap.exists()) {
        setRoutines(snap.data().days)
      } else {
        setRoutines(DEFAULT_ROUTINES)
      }
    })
  }, [user])

  async function save(updated) {
    setSaving(true)
    await setDoc(doc(db, 'routines', user.uid), { days: updated })
    setSaving(false)
  }

  function addExercise() {
    const id = 'ex_' + Date.now()
    const updated = {
      ...routines,
      [activeDay]: {
        ...routines[activeDay],
        exercises: [...(routines[activeDay]?.exercises || []), { ...newEx, id }]
      }
    }
    setRoutines(updated)
    save(updated)
    setNewEx({ name: '', sets: 4, reps: 10, restSeconds: 90, muscleGroup: 'Otro' })
    setShowAdd(false)
  }

  function removeExercise(exId) {
    const updated = {
      ...routines,
      [activeDay]: {
        ...routines[activeDay],
        exercises: routines[activeDay].exercises.filter(e => e.id !== exId)
      }
    }
    setRoutines(updated)
    save(updated)
  }

  function updateExercise(exId, field, value) {
    const updated = {
      ...routines,
      [activeDay]: {
        ...routines[activeDay],
        exercises: routines[activeDay].exercises.map(e =>
          e.id === exId ? { ...e, [field]: value } : e
        )
      }
    }
    setRoutines(updated)
  }

  function saveExerciseEdit() {
    save(routines)
    setEditing(null)
  }

  function moveExercise(exId, dir) {
    const exs = [...routines[activeDay].exercises]
    const idx = exs.findIndex(e => e.id === exId)
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= exs.length) return
    ;[exs[idx], exs[newIdx]] = [exs[newIdx], exs[idx]]
    const updated = { ...routines, [activeDay]: { ...routines[activeDay], exercises: exs } }
    setRoutines(updated)
    save(updated)
  }

  const days = [
    { key: 1, label: 'Lunes' },
    { key: 3, label: 'Miércoles' },
    { key: 5, label: 'Viernes' },
  ]

  if (!routines) return <div className="loading-screen"><div className="spinner" /></div>

  const dayData = routines[activeDay]
  const dayColors = { 1: 'var(--red)', 3: 'var(--blue)', 5: 'var(--green)' }
  const color = dayColors[activeDay]

  return (
    <div className="page fade-in">
      <h1 style={{ marginBottom: 16 }}>Rutinas</h1>

      {/* Day selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {days.map(d => (
          <button
            key={d.key}
            onClick={() => setActiveDay(d.key)}
            className="btn"
            style={{
              flex: 1,
              background: activeDay === d.key ? color : 'var(--bg2)',
              color: activeDay === d.key ? '#fff' : 'var(--text2)',
              border: `1px solid ${activeDay === d.key ? color : 'var(--border)'}`,
              fontSize: 13,
              padding: '8px 4px'
            }}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Focus label */}
      <div className="card" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ marginBottom: 2 }}>{dayData?.focus || 'Sin foco'}</h3>
          <p className="text-muted text-sm">{dayData?.exercises?.length || 0} ejercicios</p>
        </div>
        <span className="badge" style={{ background: `${color}22`, color }}>
          {days.find(d => d.key === activeDay)?.label}
        </span>
      </div>

      {/* Exercise list */}
      {(dayData?.exercises || []).map((ex, idx) => (
        <div key={ex.id} className="card" style={{ marginBottom: 10 }}>
          {editing === ex.id ? (
            // Edit mode
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input value={ex.name} onChange={e => updateExercise(ex.id, 'name', e.target.value)} placeholder="Nombre" />
              <select value={ex.muscleGroup} onChange={e => updateExercise(ex.id, 'muscleGroup', e.target.value)}>
                {MUSCLE_GROUPS.map(g => <option key={g}>{g}</option>)}
              </select>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div>
                  <label className="text-sm text-muted" style={{ display: 'block', marginBottom: 4 }}>Series</label>
                  <input type="number" value={ex.sets} onChange={e => updateExercise(ex.id, 'sets', +e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-muted" style={{ display: 'block', marginBottom: 4 }}>Reps</label>
                  <input type="number" value={ex.reps} onChange={e => updateExercise(ex.id, 'reps', +e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-muted" style={{ display: 'block', marginBottom: 4 }}>Descanso (s)</label>
                  <input type="number" step="15" value={ex.restSeconds} onChange={e => updateExercise(ex.id, 'restSeconds', +e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveExerciseEdit}>Guardar</button>
                <button className="btn btn-secondary" onClick={() => setEditing(null)}>Cancelar</button>
              </div>
            </div>
          ) : (
            // View mode
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 500, marginBottom: 2 }}>{ex.name}</p>
                <p className="text-sm text-muted">
                  {ex.sets}×{ex.reps} · {ex.restSeconds}s descanso · <span className="tag" style={{ fontSize: 11 }}>{ex.muscleGroup}</span>
                </p>
              </div>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <button className="btn btn-ghost" style={{ padding: '4px 6px', fontSize: 14 }} onClick={() => moveExercise(ex.id, -1)} disabled={idx === 0}>↑</button>
                <button className="btn btn-ghost" style={{ padding: '4px 6px', fontSize: 14 }} onClick={() => moveExercise(ex.id, 1)} disabled={idx === (dayData?.exercises?.length || 1) - 1}>↓</button>
                <button className="btn btn-ghost" style={{ padding: '4px 6px', fontSize: 14 }} onClick={() => setEditing(ex.id)}>✎</button>
                <button className="btn btn-ghost" style={{ padding: '4px 6px', fontSize: 14, color: 'var(--red)' }} onClick={() => removeExercise(ex.id)}>✕</button>
              </div>
            </div>
          )}
        </div>
      ))}

      <button className="btn btn-secondary btn-full" onClick={() => setShowAdd(true)}>
        + Agregar ejercicio
      </button>

      {saving && <p className="text-sm text-muted" style={{ textAlign: 'center', marginTop: 8 }}>Guardando...</p>}

      {/* Add exercise modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal slide-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nuevo ejercicio</h3>
              <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input value={newEx.name} onChange={e => setNewEx(p => ({ ...p, name: e.target.value }))} placeholder="Nombre del ejercicio" />
              <select value={newEx.muscleGroup} onChange={e => setNewEx(p => ({ ...p, muscleGroup: e.target.value }))}>
                {MUSCLE_GROUPS.map(g => <option key={g}>{g}</option>)}
              </select>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div>
                  <label className="text-sm text-muted" style={{ display: 'block', marginBottom: 4 }}>Series</label>
                  <input type="number" value={newEx.sets} onChange={e => setNewEx(p => ({ ...p, sets: +e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm text-muted" style={{ display: 'block', marginBottom: 4 }}>Reps</label>
                  <input type="number" value={newEx.reps} onChange={e => setNewEx(p => ({ ...p, reps: +e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm text-muted" style={{ display: 'block', marginBottom: 4 }}>Descanso (s)</label>
                  <input type="number" step="15" value={newEx.restSeconds} onChange={e => setNewEx(p => ({ ...p, restSeconds: +e.target.value }))} />
                </div>
              </div>
              <button className="btn btn-primary btn-full" onClick={addExercise} disabled={!newEx.name.trim()}>Agregar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
