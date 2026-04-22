import { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'

// ─── Layout primitive compartido ─────────────────────────────────────────────

export function ChartBox({ title, sub, children, gray }) {
  return (
    <div
      className="border border-gray-200 rounded-sm p-6"
      style={{ backgroundColor: gray ? '#F9FAFB' : '#FFFFFF' }}
    >
      <h3 className="text-sm font-semibold text-gray-700 mb-1">{title}</h3>
      {sub && <p className="text-xs text-gray-400 mb-5">{sub}</p>}
      {children}
    </div>
  )
}

// ─── Número animado ───────────────────────────────────────────────────────────

export function AnimatedNumber({ value, format = v => Math.round(v).toLocaleString('es-UY') }) {
  const motionVal  = useMotionValue(value)
  const spring     = useSpring(motionVal, { stiffness: 80, damping: 20 })
  const [display, setDisplay] = useState(() => format(value))
  const formatRef  = useRef(format)
  formatRef.current = format  // siempre actualizado, sin re-suscribir

  useEffect(() => { motionVal.set(value) }, [value])  // anima al nuevo target
  useEffect(() => spring.on('change', v => setDisplay(formatRef.current(v))), [spring])  // suscripción estable

  return <span>{display}</span>
}
