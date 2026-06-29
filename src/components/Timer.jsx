import { useState, useEffect, useRef } from 'react'

export default function Timer({ defaultSeconds = 90, onClose }) {
  const [total, setTotal] = useState(defaultSeconds)
  const [remaining, setRemaining] = useState(defaultSeconds)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            setRunning(false)
            setDone(true)
            playBeep()
            return 0
          }
          return r - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  function playBeep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
      osc.start()
      osc.stop(ctx.currentTime + 0.8)
    } catch (_) {}
  }

  function start() {
    if (done) {
      setRemaining(total)
      setDone(false)
    }
    setRunning(true)
  }

  function pause() { setRunning(false) }

  function reset() {
    setRunning(false)
    setDone(false)
    setRemaining(total)
  }

  function changeTotal(delta) {
    const next = Math.max(10, total + delta)
    setTotal(next)
    if (!running) setRemaining(next)
  }

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const progress = remaining / total

  return (
    <div style={{ textAlign: 'center', padding: '8px 0' }}>
      {/* Circular progress */}
      <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 16px' }}>
        <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="70" cy="70" r="60" fill="none" stroke="var(--bg3)" strokeWidth="6"/>
          <circle
            cx="70" cy="70" r="60" fill="none"
            stroke={done ? 'var(--green)' : 'var(--red)'}
            strokeWidth="6"
            strokeDasharray={`${2 * Math.PI * 60}`}
            strokeDashoffset={`${2 * Math.PI * 60 * (1 - progress)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s linear, stroke 0.3s' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <span className="timer-display" style={{ fontSize: 32, color: done ? 'var(--green)' : 'var(--red)' }}>
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </span>
          {done && <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>¡Listo!</span>}
        </div>
      </div>

      {/* Adjust time */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => changeTotal(-15)}>−15s</button>
        <span className="text-muted text-sm">{Math.floor(total / 60)}:{String(total % 60).padStart(2, '0')} total</span>
        <button className="btn btn-secondary btn-sm" onClick={() => changeTotal(15)}>+15s</button>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        {!running
          ? <button className="btn btn-primary" onClick={start} style={{ flex: 1 }}>
              {done ? 'Reiniciar' : 'Iniciar'}
            </button>
          : <button className="btn btn-secondary" onClick={pause} style={{ flex: 1 }}>Pausar</button>
        }
        <button className="btn btn-ghost" onClick={reset}>↺</button>
        {onClose && <button className="btn btn-ghost" onClick={onClose}>✕</button>}
      </div>
    </div>
  )
}
