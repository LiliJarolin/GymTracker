import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'
import { useAuth } from '../hooks/useAuth'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function Progress() {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedExercise, setSelectedExercise] = useState(null)

  useEffect(() => {
    if (!user) return
    getDocs(collection(db, 'sessions', user.uid, 'logs')).then(snap => {
      const data = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => a.id.localeCompare(b.id))
      setLogs(data)
      setLoading(false)
    })
  }, [user])

  // Build exercise map: name -> [{date, maxKg, totalVolume}]
  const exerciseMap = {}
  logs.forEach(log => {
    log.exercises?.forEach(ex => {
      if (!ex.name) return
      const doneSets = ex.sets?.filter(s => s.done && s.kg) || []
      if (doneSets.length === 0) return
      const maxKg = Math.max(...doneSets.map(s => parseFloat(s.kg) || 0))
      const totalVol = doneSets.reduce((acc, s) => acc + (parseFloat(s.kg) || 0) * (parseInt(s.reps) || 0), 0)
      if (!exerciseMap[ex.name]) exerciseMap[ex.name] = []
      exerciseMap[ex.name].push({
        date: log.date,
        maxKg,
        totalVol: Math.round(totalVol),
        sets: doneSets.length
      })
    })
  })

  const exercises = Object.keys(exerciseMap).sort()
  const selected = selectedExercise || exercises[0]
  const chartData = (exerciseMap[selected] || []).map(d => ({
    ...d,
    label: d.date.slice(5) // MM-DD
  }))

  const latestKg = chartData[chartData.length - 1]?.maxKg
  const firstKg = chartData[0]?.maxKg
  const improvement = latestKg && firstKg ? ((latestKg - firstKg) / firstKg * 100).toFixed(0) : null

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>

  if (exercises.length === 0) {
    return (
      <div className="page fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80%' }}>
        <p style={{ fontSize: 48, marginBottom: 12 }}>📈</p>
        <h2 style={{ marginBottom: 8 }}>Sin datos aún</h2>
        <p className="text-muted" style={{ textAlign: 'center' }}>Registrá algunos entrenamientos para ver tu progreso aquí.</p>
      </div>
    )
  }

  return (
    <div className="page fade-in">
      <h1 style={{ marginBottom: 16 }}>Progreso</h1>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
        <StatCard label="Sesiones" value={logs.length} />
        <StatCard label="Ejercicios" value={exercises.length} />
        <StatCard label="Este mes" value={logs.filter(l => l.date?.startsWith(new Date().toISOString().slice(0,7))).length} />
      </div>

      {/* Exercise selector */}
      <div style={{ marginBottom: 12 }}>
        <label className="text-sm text-muted" style={{ display: 'block', marginBottom: 6 }}>Ejercicio</label>
        <select value={selected} onChange={e => setSelectedExercise(e.target.value)}>
          {exercises.map(ex => <option key={ex}>{ex}</option>)}
        </select>
      </div>

      {/* Chart card */}
      {chartData.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <h3 style={{ marginBottom: 2 }}>{selected}</h3>
              <p className="text-sm text-muted">{chartData.length} sesiones registradas</p>
            </div>
            {improvement !== null && (
              <span className={`badge ${+improvement >= 0 ? 'badge-green' : 'badge-red'}`}>
                {+improvement >= 0 ? '+' : ''}{improvement}%
              </span>
            )}
          </div>

          {/* Peso máximo */}
          <p className="text-sm text-muted" style={{ marginBottom: 8 }}>Peso máximo (kg)</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="var(--bg3)" strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text3)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text3)' }} />
              <Tooltip
                contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}
                labelStyle={{ color: 'var(--text2)' }}
                itemStyle={{ color: 'var(--red)' }}
                formatter={(v) => [`${v} kg`, 'Máximo']}
              />
              <Line type="monotone" dataKey="maxKg" stroke="var(--red)" strokeWidth={2} dot={{ r: 3, fill: 'var(--red)' }} />
            </LineChart>
          </ResponsiveContainer>

          {/* Volumen total */}
          <p className="text-sm text-muted" style={{ margin: '16px 0 8px' }}>Volumen total (kg × reps)</p>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="var(--bg3)" strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text3)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text3)' }} />
              <Tooltip
                contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}
                labelStyle={{ color: 'var(--text2)' }}
                itemStyle={{ color: 'var(--blue)' }}
                formatter={(v) => [`${v} kg`, 'Volumen']}
              />
              <Line type="monotone" dataKey="totalVol" stroke="var(--blue)" strokeWidth={2} dot={{ r: 3, fill: 'var(--blue)' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Muscle groups worked */}
      <div className="card">
        <h3 style={{ marginBottom: 12 }}>Grupos musculares</h3>
        <MuscleGroupsBar logs={logs} />
      </div>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '12px 8px' }}>
      <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--red)' }}>{value}</p>
      <p className="text-muted text-sm">{label}</p>
    </div>
  )
}

function MuscleGroupsBar({ logs }) {
  const counts = {}
  logs.forEach(log => {
    log.exercises?.forEach(ex => {
      if (ex.muscleGroup) counts[ex.muscleGroup] = (counts[ex.muscleGroup] || 0) + 1
    })
  })
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const max = sorted[0]?.[1] || 1

  const colors = { Pecho: '#E84545', Espalda: '#4A90E2', Piernas: '#27AE60', Bíceps: '#F5A623', Tríceps: '#9B59B6', Hombros: '#1ABC9C', Abdominales: '#E67E22', Glúteos: '#EC407A', Cardio: '#00BCD4', Otro: '#607D8B' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {sorted.map(([muscle, count]) => (
        <div key={muscle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span className="text-sm">{muscle}</span>
            <span className="text-sm text-muted">{count}</span>
          </div>
          <div style={{ height: 6, background: 'var(--bg3)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${(count / max) * 100}%`,
              background: colors[muscle] || 'var(--red)',
              borderRadius: 4,
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>
      ))}
    </div>
  )
}
