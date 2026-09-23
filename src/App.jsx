import { useState, useEffect, useCallback } from 'react'
import NokiaSvgModel from './components/NokiaSvgModel'
import { setSoundEnabled } from './components/audioUtils'
import { LINKS } from './components/NokiaData'

// Xpress-on covers. The screen keeps its own LCD green whatever the cover.
const COVERS = [
  { name: 'Navy', swatch: '#3f4466', filter: 'none' },
  { name: 'Red', swatch: '#9d2f33', filter: 'hue-rotate(128deg) saturate(3.6) brightness(1.18)' },
  { name: 'Yellow', swatch: '#d6ae2f', filter: 'hue-rotate(176deg) saturate(4.6) brightness(1.8)' },
  { name: 'Green', swatch: '#3e7a52', filter: 'hue-rotate(250deg) saturate(1.9) brightness(1.05)' },
  { name: 'Grey', swatch: '#a3a5ad', filter: 'saturate(0) brightness(1.45)' },
]

const PREFS_KEY = 'nokia-desk:prefs'

function readPrefs() {
  try {
    return JSON.parse(window.localStorage.getItem(PREFS_KEY)) || {}
  } catch {
    return {}
  }
}

function ArrowLeft() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="desk-icon" shapeRendering="crispEdges" fill="currentColor">
      <path d="M6 3h2v2H6zM4 5h2v2H4zM2 7h12v2H2zM4 9h2v2H4zM6 11h2v2H6z" />
    </svg>
  )
}

function Keycap({ children, wide }) {
  return <kbd className={`keycap ${wide ? 'is-wide' : ''}`}>{children}</kbd>
}

function Arrow({ dir }) {
  const paths = {
    up: 'M7 3h2v2H7zM5 5h6v2H5zM7 7h2v6H7z',
    down: 'M7 3h2v6H7zM5 9h6v2H5zM7 11h2v2H7z',
  }
  return (
    <svg viewBox="0 0 16 16" className="keycap-icon" shapeRendering="crispEdges" fill="currentColor" aria-hidden="true">
      <path d={paths[dir]} />
    </svg>
  )
}

export default function App() {
  const [prefs] = useState(readPrefs)
  const [cover, setCover] = useState(() => COVERS.find((c) => c.name === prefs.cover) || COVERS[0])
  const [sound, setSound] = useState(prefs.sound !== false)
  const [powered, setPowered] = useState(false)

  useEffect(() => {
    setSoundEnabled(sound)
  }, [sound])

  useEffect(() => {
    try {
      window.localStorage.setItem(PREFS_KEY, JSON.stringify({ cover: cover.name, sound }))
    } catch {
      // Preferences are a convenience only.
    }
  }, [cover, sound])

  const onPowerChange = useCallback((on) => setPowered(on), [])

  return (
    <div className="desk">
      <header className="desk-bar">
        <a className="desk-link desk-back" href={LINKS.portfolio}>
          <ArrowLeft />
          <span>Tanmay Tiwari</span>
        </a>
        <nav className="desk-nav" aria-label="Other desks">
          <span className="desk-nav-label">Desks</span>
          <a className="desk-link is-current" href="/nokia-desk/" aria-current="page">Nokia</a>
          <a className="desk-link" href="/linux-desk/">Linux</a>
          <a className="desk-link" href="/spotify-desk/">Spotify</a>
        </nav>
      </header>

      <main className="desk-stage">
        <h1 className="sr-only">Nokia Desk: a Nokia 3310 you can use in the browser</h1>

        <section className="desk-card desk-guide" aria-labelledby="guide-title">
          <div className="desk-card-band">
            <h2 id="guide-title">Quick guide</h2>
            <span>3310</span>
          </div>
          <ul className="guide-list">
            <li><Keycap wide>Enter</Keycap><span>Navi key. Menu, select</span></li>
            <li><Keycap wide>Esc</Keycap><span>C key. Back, clear</span></li>
            <li><span className="keycap-pair"><Keycap><Arrow dir="up" /></Keycap><Keycap><Arrow dir="down" /></Keycap></span><span>Scroll</span></li>
            <li><Keycap wide>1-8</Keycap><span>Jump to a menu item</span></li>
            <li><Keycap wide>2468</Keycap><span>Steer the snake</span></li>
            <li><Keycap wide>5</Keycap><span>Pause Snake</span></li>
          </ul>
          <p className="guide-note">Or tap the phone keys. In Terminal, type help.</p>
        </section>

        <div className="phone-wrap">
          <NokiaSvgModel cover={cover.filter} sound={sound} onSoundChange={setSound} onPowerChange={onPowerChange} />
          <p className={`phone-hint ${powered ? 'is-hidden' : ''}`} aria-hidden={powered}>
            Tap the screen or press any key to switch it on
          </p>
        </div>

        <section className="desk-card desk-covers" aria-labelledby="covers-title">
          <div className="desk-card-band">
            <h2 id="covers-title">Xpress-on</h2>
            <span>Covers</span>
          </div>
          <div className="cover-grid" role="group" aria-label="Phone cover colour">
            {COVERS.map((c) => (
              <button
                key={c.name}
                type="button"
                aria-pressed={cover.name === c.name}
                className={`cover-chip ${cover.name === c.name ? 'is-active' : ''}`}
                onClick={(e) => {
                  setCover(c)
                  // Mouse clicks should not leave focus here, or Enter would re-press this chip instead of the phone.
                  if (e.detail) e.currentTarget.blur()
                }}
              >
                <span className="cover-swatch" style={{ '--swatch': c.swatch }} />
                <span>{c.name}</span>
              </button>
            ))}
          </div>
          <div className="profile-row">
            <span>Profile</span>
            <div className="profile-toggle" role="group" aria-label="Sound profile">
              <button type="button" aria-pressed={sound} className={sound ? 'is-active' : ''} onClick={(e) => { setSound(true); if (e.detail) e.currentTarget.blur() }}>
                General
              </button>
              <button type="button" aria-pressed={!sound} className={!sound ? 'is-active' : ''} onClick={(e) => { setSound(false); if (e.detail) e.currentTarget.blur() }}>
                Silent
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
