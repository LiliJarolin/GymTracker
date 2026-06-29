import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { useAuth } from '../hooks/useAuth'
import { DAY_NAMES } from '../utils/routines'

export default function History() {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    if (!user) return
    getDocs(collection(db, 'sessions', user.uid, 'logs')).then(snap => {
      const data = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => b.id.localeCompare(a.id))
      setLogs(data)
      setLoading(false)
    })
  }, [user])

  // Weekly streak calculation
  const loggedDates = new Set(logs.map(l => l.date))
  const streak = calculateStreak(loggedDates)

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>

  return (
    <div className="page fade-in">
      <h1 style={{ marginBottom: 16 }}>Historial</h1>

      {/* Streak card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <h3>Racha actual</h3>
            <p className="text-muted text-sm">{logs.length} sesiones en total</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--red)' }}>{streak}</span>
            <p className="text-muted text-sm">semanas</p>
          </div>
        </div>
        <WeekCalendar loggedDates={loggedDates} />
      </div>

      {/* Session list */}
      {logs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text3)' }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>🏋️</p>
          <p>Todavía no hay sesiones registradas.</p>
        </div>
      )}

      {logs.map(log => {
        const d = new Date(log.date + 'T12:00:00')
        const isOpen = expanded === log.id
        const totalDone = log.exercises?.reduce((acc, ex) => acc + (ex.sets?.filter(s => s.done)?.length || 0), 0) || 0
        const totalSets = log.exercises?.reduce((acc, ex) => acc + (ex.sets?.length || 0), 0) || 0

        return (
          <div key={log.id} className="card" style={{ marginBottom: 10 }}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => setExpanded(isOpen ? null : log.id)}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>
                    {DAY_NAMES[d.getDay()]} {d.getDate()}/{d.getMonth() + 1}/{d.getFullYear()}
                  </span>
                  <span className={`badge ${log.mode === 'routine' ? 'badge-red' : 'badge-blue'}`}>
                    {log.mode === 'routine' ? 'Rutina' : 'Libre'}
                  </span>
                </div>
                <p className="text-sm text-muted">
                  {log.focusLabel} · {log.exercises?.length} ejercicios · {totalDone}/{totalSets} series
                </p>
              </div>
              <span style={{ color: 'var(--text3)', fontSize: 18 }}>{isOpen ? '▲' : '▼'}</span>
            </div>

            {isOpen && (
              <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                {log.exercises?.map(ex => (
                  <div key={ex.id} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 500, fontSize: 14 }}>{ex.name}</span>
                      <span className="tag" style={{ fontSize: 11 }}>{ex.muscleGroup}</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {ex.sets?.map((s, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: 12,
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: s.done ? 'rgba(39,174,96,0.15)' : 'var(--bg3)',
                            color: s.done ? 'var(--green)' : 'var(--text3)',
                            border: `1px solid ${s.done ? 'rgba(39,174,96,0.3)' : 'var(--border)'}`
                          }}
                        >
                          {s.kg ? `${s.kg}kg` : '—'} × {s.reps}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {log.notes && (
                  <p className="text-sm" style={{ color: 'var(--text2)', fontStyle: 'italic', marginTop: 8 }}>
                    "{log.notes}"
                  </p>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function WeekCalendar({ loggedDates }) {
  const days = []
  for (let i = 27; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    days.push({ key, dayOfWeek: d.getDay(), day: d.getDate() })
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
      {['D','L','M','X','J','V','S'].map(d => (
        <span key={d} style={{ fontSize: 10, color: 'var(--text3)', textAlign: 'center', marginBottom: 2 }}>{d}</span>
      ))}
      {days.map(d => {
        const logged = loggedDates.has(d.key)
        const isToday = d.key === new Date().toISOString().split('T')[0]
        return (
          <div
            key={d.key}
            style={{
              height: 28,
              borderRadius: 6,
              background: logged ? 'var(--green)' : 'var(--bg3)',
              border: isToday ? '2px solid var(--red)' : '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              color: logged ? '#fff' : 'var(--text3)',
              fontWeight: logged ? 600 : 400
            }}
          >
            {d.day}
          </div>
        )
      })}
    </div>
  )
}

function calculateStreak(loggedDates) {
  let streak = 0
  const today = new Date()
  // Count consecutive weeks with at least 2 training days
  for (let w = 0; w < 52; w++) {
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay() - w * 7)
    let daysThisWeek = 0
    for (let d = 0; d < 7; d++) {
      const dd = new Date(weekStart)
      dd.setDate(weekStart.getDate() + d)
      const key = dd.toISOString().split('T')[0]
      if (loggedDates.has(key)) daysThisWeek++
    }
    if (daysThisWeek >= 2) streak++
    else if (w > 0) break
  }
  return streak
}
