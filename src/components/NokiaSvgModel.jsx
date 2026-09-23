import { useState, useCallback, useEffect, useRef } from 'react'
import NokiaUI from './NokiaUI'
import nokiaImg from '../assets/nokia3310_model.svg'

// Hotspots in percent of the phone box, traced from nokia3310_model.svg.
const KEYS = [
  { id: 'navi', label: 'Navi key, menu or select', top: 50.7, left: 32.3, width: 35.6, height: 3.9 },
  { id: 'c', label: 'C key, back or clear', top: 52.4, left: 18.6, width: 14, height: 7, rotate: 38 },
  { id: 'up', label: 'Scroll up', top: 52.2, left: 67.6, width: 17.2, height: 4.6, rotate: -28 },
  { id: 'down', label: 'Scroll down', top: 56.6, left: 55.4, width: 16.2, height: 5.2, rotate: -28 },
  { id: '1', top: 63.2, left: 14.4, rotate: 9 },
  { id: '2', top: 65.2, left: 41.1, width: 18.6, height: 4.4 },
  { id: '3', top: 63.2, left: 68.6, rotate: -9 },
  { id: '4', top: 70.2, left: 15.8, rotate: 7 },
  { id: '5', top: 72.4, left: 41.1, width: 18.6, height: 4.4 },
  { id: '6', top: 70.2, left: 67.6, rotate: -7 },
  { id: '7', top: 77.2, left: 16.7, rotate: 6 },
  { id: '8', top: 79.4, left: 41.1, width: 18.6, height: 4.4 },
  { id: '9', top: 77.2, left: 66.8, rotate: -6 },
  { id: '*', label: 'Star key', top: 84.2, left: 17.6, rotate: 8 },
  { id: '0', top: 85.9, left: 41.1, width: 18.6, height: 4.4 },
  { id: '#', label: 'Hash key', top: 84.2, left: 66.2, rotate: -8 },
]

const KEYMAP = {
  Enter: 'navi',
  Escape: 'c',
  Backspace: 'c',
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
}

function mapKey(key) {
  if (KEYMAP[key]) return KEYMAP[key]
  if (/^[0-9*#]$/.test(key)) return key
  return null
}

export default function NokiaSvgModel({ cover = 'none', sound, onSoundChange, onPowerChange }) {
  const uiRef = useRef(null)
  const phoneRef = useRef(null)
  const flashTimer = useRef(null)
  const [pressed, setPressed] = useState(null)

  const trigger = useCallback((key, raw) => {
    const visual = key === 'left' ? null : key === 'right' ? null : key
    if (visual) {
      setPressed(visual)
      clearTimeout(flashTimer.current)
      flashTimer.current = setTimeout(() => setPressed(null), 140)
    }
    uiRef.current?.press(key, raw)
  }, [])

  useEffect(() => () => clearTimeout(flashTimer.current), [])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return
      const key = mapKey(e.key)
      if (!key) return
      const target = e.target
      const tag = target?.tagName
      const isField = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable
      if (isField) {
        // Only the phone's own terminal field forwards a few control keys.
        if (!phoneRef.current?.contains(target)) return
        if (!['Enter', 'Escape', 'ArrowUp', 'ArrowDown'].includes(e.key)) return
      }
      // Let focused buttons and links handle their own activation keys.
      if ((tag === 'BUTTON' || tag === 'A') && e.key === 'Enter') return
      e.preventDefault()
      trigger(key, e.key)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [trigger])

  return (
    <div className="phone" ref={phoneRef}>
      <img src={nokiaImg} alt="" className="phone-img" style={{ filter: cover }} draggable="false" />
      {cover !== 'none' && <img src={nokiaImg} alt="" className="phone-img phone-screen-copy" draggable="false" />}

      <div className="phone-lcd">
        <NokiaUI ref={uiRef} sound={sound} onSoundChange={onSoundChange} onPowerChange={onPowerChange} />
      </div>

      {KEYS.map((k) => (
        <button
          key={k.id}
          type="button"
          className={`phone-key ${pressed === k.id ? 'is-pressed' : ''}`}
          style={{
            top: `${k.top}%`,
            left: `${k.left}%`,
            width: `${k.width || 17}%`,
            height: `${k.height || 4.8}%`,
            transform: k.rotate ? `rotate(${k.rotate}deg)` : undefined,
          }}
          aria-label={k.label || `Key ${k.id}`}
          onPointerDown={(e) => {
            if (e.button !== 0) return
            e.preventDefault()
            trigger(k.id, 'pad')
          }}
          onClick={(e) => {
            // Keyboard activation of a focused key (Enter or Space) arrives as a click with no pointer.
            if (e.detail === 0) trigger(k.id, 'pad')
          }}
        />
      ))}
    </div>
  )
}
