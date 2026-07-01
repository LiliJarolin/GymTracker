import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { MUSCLE_GROUPS } from '../utils/routines'

export default function Exercises() {
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterGroup, setFilterGroup] = useState('Todos')
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)
  const [newEx, setNewEx] = useState({ name: '', muscleGroup: 'Pecho', equipment: '', notes: '' })

  useEffect(() => { loadExercises() }, [])

  async function loadExercises() {
    const snap = await getDocs(collection(db, 'exercises'))
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => a.name.localeCompare(b.name))
    setExercises(data)
    setLoading(false)
  }

  async function addExercise() {
    if (!newEx.name.trim()) return
    await addDoc(collection(db, 'exercises'), newEx)
    setNewEx({ name: '', muscleGroup: 'Pecho', equipment: '', notes: '' })
    setShowAdd(false)
    loadExercises()
  }

  async function saveEdit() {
    await updateDoc(doc(db, 'exercises', editing.id), {
      name: editing.name,
      muscleGroup: editing.muscleGroup,
      equipment: editing.equipment,
      notes: editing.notes
    })
    setEditing(null)
    loadExercises()
  }

  async function removeExercise(id) {
    if (!confirm('¿Eliminar este ejercicio?')) return
    await deleteDoc(doc(db, 'exercises', id))
    loadExercises()
  }

  const filtered = exercises.filter(ex => {
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.equipment?.toLowerCase().includes(search.toLowerCase())
    const matchGroup = filterGroup === 'Todos' || ex.muscleGroup === filterGroup
    return matchSearch && matchGroup
  })

  const groups = ['Todos', ...MUSCLE_GROUPS]
  const groupColors = {
    Pecho: '#E84545', Espalda: '#4A90E2', Hombros: '#1ABC9C', Bíceps: '#F5A623',
    Tríceps: '#9B59B6', Piernas: '#27AE60', Glúteos: '#EC407A', Aductores: '#3498DB',
    Trapecios: '#E67E22', Abdominales: '#00BCD4', Cardio: '#607D8B', Otro: '#95A5A6'
  }

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>

  return (
    <div className="page fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1>Ejercicios</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Nuevo</button>
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Buscar por nombre o máquina..."
        style={{ marginBottom: 12 }}
      />

      {/* Group filter */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, marginBottom: 16 }}>
        {groups.map(g => (
          <button
            key={g}
            onClick={() => setFilterGroup(g)}
            style={{
              flexShrink: 0,
              padding: '5px 12px',
              borderRadius: 20,
              border: 'none',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 500,
              background: filterGroup === g
                ? (groupColors[g] || 'var(--red)')
                : 'var(--bg3)',
              color: filterGroup === g ? '#fff' : 'var(--text2)',
              transition: 'all 0.15s'
            }}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-sm text-muted" style={{ marginBottom: 12 }}>
        {filtered.length} ejercicio{filtered.length !== 1 ? 's' : ''}
        {search || filterGroup !== 'Todos' ? ' encontrados' : ' en total'}
      </p>

      {/* Exercise list */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text3)' }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>🔍</p>
          <p>No hay ejercicios que coincidan.</p>
          <button className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={() => setShowAdd(true)}>
            Agregar este ejercicio
          </button>
        </div>
      )}

      {filtered.map(ex => (
        <div key={ex.id} className="card" style={{ marginBottom: 8 }}>
          {editing?.id === ex.id ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input value={editing.name} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} placeholder="Nombre" />
              <select value={editing.muscleGroup} onChange={e => setEditing(p => ({ ...p, muscleGroup: e.target.value }))}>
                {MUSCLE_GROUPS.map(g => <option key={g}>{g}</option>)}
              </select>
              <input value={editing.equipment} onChange={e => setEditing(p => ({ ...p, equipment: e.target.value }))} placeholder="Máquina / equipo (opcional)" />
              <textarea value={editing.notes} onChange={e => setEditing(p => ({ ...p, notes: e.target.value }))} placeholder="Notas (opcional)" rows={2} style={{ resize: 'none' }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveEdit}>Guardar</button>
                <button className="btn btn-secondary" onClick={() => setEditing(null)}>Cancelar</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 4, alignSelf: 'stretch', borderRadius: 4, flexShrink: 0,
                background: groupColors[ex.muscleGroup] || 'var(--text3)'
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 500, marginBottom: 2 }}>{ex.name}</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span className="tag" style={{ fontSize: 11 }}>{ex.muscleGroup}</span>
                  {ex.equipment && <span className="tag" style={{ fontSize: 11 }}>🏋️ {ex.equipment}</span>}
                </div>
                {ex.notes && <p className="text-sm text-muted" style={{ marginTop: 4, fontStyle: 'italic' }}>{ex.notes}</p>}
              </div>
              <div style={{ display: 'flex', gap: 2 }}>
                <button className="btn btn-ghost" style={{ padding: '6px 8px' }} onClick={() => setEditing({ ...ex })}>✎</button>
                <button className="btn btn-ghost" style={{ padding: '6px 8px', color: 'var(--red)' }} onClick={() => removeExercise(ex.id)}>✕</button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal slide-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nuevo ejercicio</h3>
              <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label className="text-sm text-muted" style={{ display: 'block', marginBottom: 4 }}>Nombre *</label>
                <input value={newEx.name} onChange={e => setNewEx(p => ({ ...p, name: e.target.value }))} placeholder="Ej: Press banca plano" />
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
              <button className="btn btn-primary btn-full" onClick={addExercise} disabled={!newEx.name.trim()}>
                Agregar al listado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
