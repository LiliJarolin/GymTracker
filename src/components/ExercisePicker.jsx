import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, getDocs, addDoc } from 'firebase/firestore'
import { MUSCLE_GROUPS } from '../utils/routines'

export default function ExercisePicker({ onSelect, onClose, defaultSets = 3, defaultReps = 10, defaultRest = 90 }) {
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterGroup, setFilterGroup] = useState('Todos')
  const [showCreate, setShowCreate] = useState(false)
  const [newEx, setNewEx] = useState({ name: '', muscleGroup: 'Pecho', equipment: '', notes: '' })
  const [sets, setSets] = useState(defaultSets)
  const [reps, setReps] = useState(defaultReps)
  const [rest, setRest] = useState(defaultRest)
  const [selected, setSelected] = useState(null)

  useEffect(() => { loadExercises() }, [])

  async function loadExercises() {
    const snap = await getDocs(collection(db, 'exercises'))
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => a.name.localeCompare(b.name))
    setExercises(data)
    setLoading(false)
  }

  async function createAndSelect() {
    if (!newEx.name.trim()) return
    const ref = await addDoc(collection(db, 'exercises'), newEx)
    const created = { id: ref.id, ...newEx }
    setExercises(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
    setSelected(created)
    setShowCreate(false)
  }

  function confirm() {
    if (!selected) return
    onSelect({
      id: 'ex_' + Date.now(),
      name: selected.name,
      muscleGroup: selected.muscleGroup,
      equipment: selected.equipment || '',
      notes: selected.notes || '',
      sets,
      reps,
      restSeconds: rest,
      libraryId: selected.id
    })
  }

  const filtered = exercises.filter(ex => {
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.equipment?.toLowerCase().includes(search.toLowerCase())
    const matchGroup = filterGroup === 'Todos' || ex.muscleGroup === filterGroup
    return matchSearch && matchGroup
  })

  const groupColors = {
    Pecho: '#E84545', Espalda: '#4A90E2', Hombros: '#1ABC9C', Bíceps: '#F5A623',
    Tríceps: '#9B59B6', Piernas: '#27AE60', Glúteos: '#EC407A', Aductores: '#3498DB',
    Trapecios: '#E67E22', Abdominales: '#00BCD4', Cardio: '#607D8B', Otro: '#95A5A6'
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal slide-up" style={{ maxHeight: '92vh' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Seleccionar ejercicio</h3>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>

        {!showCreate ? (
          <>
            {/* Search */}
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre o máquina..."
              style={{ marginBottom: 10 }}
              autoFocus
            />

            {/* Group filter */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, marginBottom: 12 }}>
              {['Todos', ...MUSCLE_GROUPS].map(g => (
                <button key={g} onClick={() => setFilterGroup(g)} style={{
                  flexShrink: 0, padding: '4px 10px', borderRadius: 20, border: 'none',
                  cursor: 'pointer', fontSize: 11, fontWeight: 500,
                  background: filterGroup === g ? (groupColors[g] || 'var(--red)') : 'var(--bg3)',
                  color: filterGroup === g ? '#fff' : 'var(--text2)'
                }}>{g}</button>
              ))}
            </div>

            {/* List */}
            {loading && <div style={{ textAlign: 'center', padding: 24 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>}

            <div style={{ maxHeight: 280, overflowY: 'auto', marginBottom: 12 }}>
              {filtered.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text3)' }}>
                  <p style={{ marginBottom: 8 }}>No encontrado.</p>
                  <button className="btn btn-secondary btn-sm" onClick={() => { setShowCreate(true); setNewEx(p => ({ ...p, name: search })) }}>
                    + Crear "{search}"
                  </button>
                </div>
              )}
              {filtered.map(ex => (
                <div
                  key={ex.id}
                  onClick={() => setSelected(ex)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                    borderRadius: 8, cursor: 'pointer', marginBottom: 4,
                    background: selected?.id === ex.id ? 'rgba(232,69,69,0.12)' : 'var(--bg3)',
                    border: `1px solid ${selected?.id === ex.id ? 'var(--red)' : 'transparent'}`,
                    transition: 'all 0.1s'
                  }}
                >
                  <div style={{ width: 3, alignSelf: 'stretch', borderRadius: 4, background: groupColors[ex.muscleGroup] || 'var(--text3)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 500, fontSize: 14 }}>{ex.name}</p>
                    <p className="text-sm text-muted">
                      {ex.muscleGroup}{ex.equipment ? ` · ${ex.equipment}` : ''}
                    </p>
                  </div>
                  {selected?.id === ex.id && <span style={{ color: 'var(--red)', fontSize: 18 }}>✓</span>}
                </div>
              ))}
            </div>

            <button className="btn btn-ghost btn-sm btn-full" style={{ marginBottom: 12 }} onClick={() => setShowCreate(true)}>
              + Crear nuevo ejercicio
            </button>

            {/* Sets/Reps/Rest config — shown when something is selected */}
            {selected && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginBottom: 12 }}>
                <p className="text-sm text-muted" style={{ marginBottom: 8 }}>Configuración para <strong>{selected.name}</strong></p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  <div>
                    <label className="text-sm text-muted" style={{ display: 'block', marginBottom: 4 }}>Series</label>
                    <input type="number" min="1" max="10" value={sets} onChange={e => setSets(+e.target.value)} style={{ textAlign: 'center' }} />
                  </div>
                  <div>
                    <label className="text-sm text-muted" style={{ display: 'block', marginBottom: 4 }}>Reps</label>
                    <input type="number" min="1" value={reps} onChange={e => setReps(+e.target.value)} style={{ textAlign: 'center' }} />
                  </div>
                  <div>
                    <label className="text-sm text-muted" style={{ display: 'block', marginBottom: 4 }}>Descanso (s)</label>
                    <input type="number" min="10" step="15" value={rest} onChange={e => setRest(+e.target.value)} style={{ textAlign: 'center' }} />
                  </div>
                </div>
              </div>
            )}

            <button className="btn btn-primary btn-full" onClick={confirm} disabled={!selected}>
              {selected ? `Agregar "${selected.name}"` : 'Seleccioná un ejercicio'}
            </button>
          </>
        ) : (
          <>
            {/* Create new exercise form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label className="text-sm text-muted" style={{ display: 'block', marginBottom: 4 }}>Nombre *</label>
                <input value={newEx.name} onChange={e => setNewEx(p => ({ ...p, name: e.target.value }))} placeholder="Ej: Press banca plano" autoFocus />
              </div>
              <div>
                <label className="text-sm text-muted" style={{ display: 'block', marginBottom: 4 }}>Grupo muscular *</label>
                <select value={newEx.muscleGroup} onChange={e => setNewEx(p => ({ ...p, muscleGroup: e.target.value }))}>
                  {MUSCLE_GROUPS.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-muted" style={{ display: 'block', marginBottom: 4 }}>Máquina / equipo</label>
                <input value={newEx.equipment} onChange={e => setNewEx(p => ({ ...p, equipment: e.target.value }))} placeholder="Ej: Banco plano, Polea, Barra..." />
              </div>
              <div>
                <label className="text-sm text-muted" style={{ display: 'block', marginBottom: 4 }}>Notas</label>
                <textarea value={newEx.notes} onChange={e => setNewEx(p => ({ ...p, notes: e.target.value }))} placeholder="Ej: Agarre pronado, bajar hasta 90°..." rows={2} style={{ resize: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={createAndSelect} disabled={!newEx.name.trim()}>
                  Crear y seleccionar
                </button>
                <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Volver</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
