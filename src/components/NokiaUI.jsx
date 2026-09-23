import { useState, useEffect, useRef, useImperativeHandle, useCallback } from 'react'
import { PROFILE, MENU, LINKS, PixelIcon } from './NokiaData'
import { playBeep, playSnakeEat, playSnakeCrash, playStartupChime, playSaulTheme } from './audioUtils'
import bootLogo from '../assets/boot_logo.png'
import idleLogo from '../assets/idle_logo.png'

const GRID_W = 18
const GRID_H = 9
const BOOT_MS = 3200
const BACKLIGHT_MS = 15000
const SCREENSAVER_MS = 30000
const BEST_KEY = 'nokia-desk:snake-best'

const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' }
const DIRECTION_KEYS = { up: 'up', down: 'down', left: 'left', right: 'right', 2: 'up', 8: 'down', 4: 'left', 6: 'right' }
const STEP = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }

const LISTS = {
  contacts: { title: 'Phonebook', items: PROFILE.contacts.map((c) => ({ title: c.label, sub: c.value, url: c.url })) },
  projects: { title: 'Projects', items: PROFILE.projects.map((p) => ({ title: p.name, sub: p.desc, url: p.url })) },
  desks: { title: 'Desks', items: PROFILE.desks.map((d) => ({ title: d.label, sub: d.value, url: d.url, sameTab: d.sameTab })) },
  profiles: { title: 'Profiles', items: [{ title: 'General', sub: 'Keypad tones on', value: true }, { title: 'Silent', sub: 'All tones off', value: false }] },
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const VFS = {
  'about.txt': PROFILE.about.join(' '),
  'contact.txt': PROFILE.contacts.map((c) => `${c.label}: ${c.url.replace(/^mailto:/, '')}`).join('\n'),
  'resume.txt': `Resume: ${LINKS.resume}\nType "open resume".`,
  projects: Object.fromEntries(PROFILE.projects.slice(0, -1).map((p) => [slug(p.name), `${p.name}: ${p.desc}\n${p.url}`])),
}

const TERM_WELCOME = [{ type: 'output', text: 'Nokia OS v1.0\nType "help".' }]

function readBest() {
  try {
    return Number(window.localStorage.getItem(BEST_KEY)) || 0
  } catch {
    return 0
  }
}

function writeBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value))
  } catch {
    // Storage can be unavailable in private windows.
  }
}

function newSnakeGame() {
  const body = [{ x: 5, y: 4 }, { x: 4, y: 4 }, { x: 3, y: 4 }]
  return { body, dir: 'right', queue: [], food: spawnFood(body), score: 0 }
}

function spawnFood(body) {
  const taken = new Set(body.map((s) => `${s.x},${s.y}`))
  const free = []
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      if (!taken.has(`${x},${y}`)) free.push({ x, y })
    }
  }
  return free.length ? free[Math.floor(Math.random() * free.length)] : null
}

function formatTime(d) {
  const h = d.getHours()
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${String(h).padStart(2, '0')}:${m}`
}

// LCD controls are mouse and touch shortcuts. Keyboard users drive the phone through its keys,
// so these never take focus (a focused row would otherwise swallow Enter).
const noFocus = { tabIndex: -1, onMouseDown: (e) => e.preventDefault() }

function openLink(url, sameTab) {
  if (url.startsWith('mailto:') || sameTab) {
    window.location.assign(url)
    return false
  }
  window.open(url, '_blank', 'noopener,noreferrer')
  return true
}

export default function NokiaUI({ ref, sound, onSoundChange, onPowerChange }) {
  const [screen, setScreen] = useState('off')
  const [menuIdx, setMenuIdx] = useState(0)
  const [listIdx, setListIdx] = useState(0)
  const [listReturn, setListReturn] = useState('menu')
  const [clock, setClock] = useState(() => formatTime(new Date()))
  const [dialNumber, setDialNumber] = useState('')
  const [notice, setNotice] = useState(null)
  const [activity, setActivity] = useState(0)
  const [backlight, setBacklight] = useState(false)
  const [matrix, setMatrix] = useState(false)

  // Snake
  const gameRef = useRef(null)
  if (!gameRef.current) gameRef.current = newSnakeGame()
  const [snakeStatus, setSnakeStatus] = useState('ready')
  const [, setFrame] = useState(0)
  const [best, setBest] = useState(readBest)
  const overAtRef = useRef(0)

  // Terminal
  const [termHistory, setTermHistory] = useState(TERM_WELCOME)
  const [termCwd, setTermCwd] = useState('~')
  const [termInput, setTermInput] = useState('')
  const [cmdLog, setCmdLog] = useState([])
  const [cmdCursor, setCmdCursor] = useState(-1)
  const termScrollRef = useRef(null)
  const termInputRef = useRef(null)

  const listScrollRef = useRef(null)
  const messageScrollRef = useRef(null)

  useEffect(() => {
    onPowerChange?.(screen !== 'off')
  }, [screen, onPowerChange])

  // Clock, aligned to the start of each minute.
  useEffect(() => {
    let timer
    const tick = () => {
      const now = new Date()
      setClock(formatTime(now))
      timer = setTimeout(tick, 60000 - (now.getSeconds() * 1000 + now.getMilliseconds()) + 50)
    }
    tick()
    return () => clearTimeout(timer)
  }, [])

  // Timed screens.
  useEffect(() => {
    let timer
    if (screen === 'boot') timer = setTimeout(() => setScreen('idle'), BOOT_MS)
    if (screen === 'calling') {
      timer = setTimeout(() => {
        setNotice({ title: 'No SIM card', text: 'This phone lives in a browser', next: 'idle' })
        setScreen('notice')
      }, 2000)
    }
    if (screen === 'notice') timer = setTimeout(() => setScreen(notice?.next || 'idle'), 1800)
    return () => clearTimeout(timer)
  }, [screen, notice])

  // Screensaver only from the idle screen, restarted by every key press.
  useEffect(() => {
    if (screen !== 'idle') return undefined
    const timer = setTimeout(() => setScreen('screensaver'), SCREENSAVER_MS)
    return () => clearTimeout(timer)
  }, [screen, activity])

  // Backlight turns on with any key and fades after a quiet period, like the real phone.
  useEffect(() => {
    if (!activity) return undefined
    setBacklight(true)
    const timer = setTimeout(() => setBacklight(false), BACKLIGHT_MS)
    return () => clearTimeout(timer)
  }, [activity])

  useEffect(() => {
    if (!matrix) return undefined
    const timer = setTimeout(() => setMatrix(false), 5000)
    return () => clearTimeout(timer)
  }, [matrix])

  // Snake engine. Speed rises gently with length.
  useEffect(() => {
    if (screen !== 'snake' || snakeStatus !== 'playing') return undefined
    let timer
    const step = () => {
      const g = gameRef.current
      if (g.queue.length) g.dir = g.queue.shift()
      const [dx, dy] = STEP[g.dir]
      const head = { x: g.body[0].x + dx, y: g.body[0].y + dy }
      const eats = g.food && head.x === g.food.x && head.y === g.food.y
      const rest = eats ? g.body : g.body.slice(0, -1)
      const hitWall = head.x < 0 || head.x >= GRID_W || head.y < 0 || head.y >= GRID_H
      if (hitWall || rest.some((s) => s.x === head.x && s.y === head.y)) {
        playSnakeCrash()
        overAtRef.current = Date.now()
        setBest((b) => {
          if (g.score > b) {
            writeBest(g.score)
            return g.score
          }
          return b
        })
        setSnakeStatus('over')
        return
      }
      g.body = [head, ...rest]
      if (eats) {
        g.score += 1
        g.food = spawnFood(g.body)
        playSnakeEat()
      }
      setFrame((f) => f + 1)
      timer = setTimeout(step, Math.max(85, 210 - g.body.length * 5))
    }
    timer = setTimeout(step, Math.max(85, 210 - gameRef.current.body.length * 5))
    const pause = () => setSnakeStatus('paused')
    const onVisibility = () => document.hidden && pause()
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('blur', pause)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('blur', pause)
    }
  }, [screen, snakeStatus])

  // Keep the selected list row visible without scrolling the page.
  useEffect(() => {
    const box = listScrollRef.current
    if (!box) return
    const row = box.querySelector(`[data-row="${listIdx}"]`)
    if (!row) return
    if (row.offsetTop < box.scrollTop) box.scrollTop = row.offsetTop
    else if (row.offsetTop + row.offsetHeight > box.scrollTop + box.clientHeight) {
      box.scrollTop = row.offsetTop + row.offsetHeight - box.clientHeight
    }
  }, [listIdx, screen])

  useEffect(() => {
    if (screen === 'terminal') {
      termInputRef.current?.focus({ preventScroll: true })
    }
  }, [screen])

  useEffect(() => {
    if (termScrollRef.current) termScrollRef.current.scrollTop = termScrollRef.current.scrollHeight
  }, [termHistory, screen])

  const showNotice = useCallback((title, text, next) => {
    setNotice({ title, text, next })
    setScreen('notice')
  }, [])

  const openItem = useCallback(
    (item, next) => {
      const newTab = openLink(item.url, item.sameTab)
      if (newTab) showNotice('Opened', item.title, next)
    },
    [showNotice],
  )

  const openList = (id, from) => {
    setListIdx(id === 'profiles' ? (sound ? 0 : 1) : 0)
    setListReturn(from)
    setScreen(id)
  }

  const openApp = (id) => {
    if (id === 'resume') {
      openItem({ url: LINKS.resume, title: 'Resume' }, 'menu')
    } else if (LISTS[id]) {
      openList(id, 'menu')
    } else if (id === 'messages') {
      setScreen('messages')
    } else {
      setScreen(id)
    }
  }

  const startSnake = (dir) => {
    gameRef.current = newSnakeGame()
    if (dir && dir !== 'left') gameRef.current.dir = dir
    setSnakeStatus('playing')
    setFrame((f) => f + 1)
  }

  const queueDirection = (dir) => {
    const g = gameRef.current
    const last = g.queue.length ? g.queue[g.queue.length - 1] : g.dir
    if (dir === last || dir === OPPOSITE[last] || g.queue.length >= 2) return
    g.queue.push(dir)
  }

  const runCommand = (raw) => {
    const cmd = raw.trim()
    let history = [...termHistory, { type: 'input', text: `${termCwd}> ${cmd}` }]
    const out = (text) => history.push({ type: 'output', text })
    if (cmd) {
      setCmdLog((log) => [...log, cmd].slice(-20))
    }
    setCmdCursor(-1)
    setTermInput('')
    if (!cmd) {
      setTermHistory(history)
      return
    }
    const [program, target] = cmd.split(/\s+/)
    const dir = termCwd === '~' ? VFS : VFS[termCwd.replace('~/', '')] || VFS
    switch (program.toLowerCase()) {
      case 'help':
        out('ls cd cat open\nwhoami date clear\nmatrix saul exit')
        break
      case 'whoami':
        out(`${PROFILE.name} (${PROFILE.operator})`)
        break
      case 'date':
        out(new Date().toDateString())
        break
      case 'matrix':
        out('Wake up, Neo...')
        setMatrix(true)
        break
      case 'saul':
        out("It's all good, man.")
        playSaulTheme()
        break
      case 'clear':
        history = []
        break
      case 'exit':
        setTermHistory(history)
        setScreen('menu')
        return
      case 'ls': {
        const names = Object.keys(dir).map((k) => (typeof dir[k] === 'object' ? `${k}/` : k))
        out(names.join('\n') || '(empty)')
        break
      }
      case 'cd':
        if (!target || target === '~' || target === '/' || target === '..') setTermCwd('~')
        else if (termCwd === '~' && typeof VFS[target.replace(/\/$/, '')] === 'object') setTermCwd(`~/${target.replace(/\/$/, '')}`)
        else out(`cd: ${target}: no such dir`)
        break
      case 'cat':
        if (!target) out('cat: missing file')
        else if (typeof dir[target] === 'string') out(dir[target])
        else if (dir[target]) out(`cat: ${target}: is a dir`)
        else out(`cat: ${target}: not found`)
        break
      case 'open': {
        const name = slug(target || '')
        const project = PROFILE.projects.find((p) => slug(p.name) === name)
        const contact = PROFILE.contacts.find((c) => slug(c.label) === name)
        if (name === 'resume') {
          openLink(LINKS.resume)
          out('Opened resume')
        } else if (project || contact) {
          const item = project || contact
          openLink(item.url)
          out(`Opened ${project ? project.name : contact.label}`)
        } else {
          out('open: try "open blend"\nor "open github"')
        }
        break
      }
      default:
        out(`${program}: not found`)
    }
    setTermHistory(history)
  }

  const press = (key, raw) => {
    setActivity((n) => n + 1)
    if (screen === 'off') {
      playStartupChime()
      setScreen('boot')
      return
    }
    if (screen === 'boot') return
    playBeep()

    if (screen === 'screensaver') {
      setScreen('idle')
      return
    }

    const isDigit = /^[0-9*#]$/.test(key)

    switch (screen) {
      case 'idle':
        if (key === 'navi') {
          setMenuIdx(0)
          setScreen('menu')
        } else if (key === 'down' || key === 'up') {
          openList('contacts', 'idle')
        } else if (isDigit) {
          setDialNumber(key)
          setScreen('dialing')
        }
        return

      case 'menu':
        if (key === 'up' || key === 'left') setMenuIdx((i) => (i - 1 + MENU.length) % MENU.length)
        else if (key === 'down' || key === 'right') setMenuIdx((i) => (i + 1) % MENU.length)
        else if (key === 'navi') openApp(MENU[menuIdx].id)
        else if (key === 'c') setScreen('idle')
        else if (/^[1-9]$/.test(key) && MENU[Number(key) - 1]) {
          setMenuIdx(Number(key) - 1)
          openApp(MENU[Number(key) - 1].id)
        }
        return

      case 'contacts':
      case 'projects':
      case 'desks':
      case 'profiles': {
        const items = LISTS[screen].items
        if (key === 'up' || key === 'left') setListIdx((i) => (i - 1 + items.length) % items.length)
        else if (key === 'down' || key === 'right') setListIdx((i) => (i + 1) % items.length)
        else if (key === 'c') setScreen(listReturn)
        else if (key === 'navi') {
          const item = items[listIdx]
          if (screen === 'profiles') {
            onSoundChange?.(item.value)
            showNotice(item.title, 'Profile active', 'menu')
          } else {
            openItem(item, screen)
          }
        }
        return
      }

      case 'messages': {
        const box = messageScrollRef.current
        if (key === 'up' && box) box.scrollTop -= box.clientHeight * 0.6
        else if (key === 'down' && box) box.scrollTop += box.clientHeight * 0.6
        else if (key === 'c' || key === 'navi') setScreen('menu')
        return
      }

      case 'snake': {
        const dir = DIRECTION_KEYS[key]
        if (key === 'c') {
          if (snakeStatus === 'playing') setSnakeStatus('paused')
          setScreen('menu')
          return
        }
        if (snakeStatus === 'playing') {
          if (dir) queueDirection(dir)
          else if (key === 'navi' || key === '5') setSnakeStatus('paused')
        } else if (snakeStatus === 'paused') {
          if (dir || key === 'navi' || key === '5') setSnakeStatus('playing')
        } else if (snakeStatus === 'ready') {
          if (dir || key === 'navi' || key === '5') startSnake(dir)
        } else if (snakeStatus === 'over' && Date.now() - overAtRef.current > 600) {
          if (key === 'navi' || key === '5') startSnake()
        }
        return
      }

      case 'terminal':
        if (key === 'navi') runCommand(termInput)
        else if (key === 'c') {
          if (raw === 'Escape' || !termInput) setScreen('menu')
          else setTermInput((v) => v.slice(0, -1))
        } else if (key === 'up' && cmdLog.length) {
          const next = cmdCursor === -1 ? cmdLog.length - 1 : Math.max(0, cmdCursor - 1)
          setCmdCursor(next)
          setTermInput(cmdLog[next])
        } else if (key === 'down' && cmdCursor !== -1) {
          const next = cmdCursor + 1
          setCmdCursor(next >= cmdLog.length ? -1 : next)
          setTermInput(next >= cmdLog.length ? '' : cmdLog[next])
        } else if (isDigit) {
          setTermInput((v) => v + key)
        }
        if (raw && raw !== 'pad') termInputRef.current?.focus({ preventScroll: true })
        return

      case 'dialing':
        if (key === 'c') {
          const next = dialNumber.slice(0, -1)
          setDialNumber(next)
          if (!next) setScreen('idle')
        } else if (key === 'navi') {
          setScreen('calling')
        } else if (isDigit && dialNumber.length < 15) {
          setDialNumber((n) => n + key)
        }
        return

      case 'calling':
        if (key === 'c' || key === 'navi') {
          setDialNumber('')
          setScreen('idle')
        }
        return

      case 'notice':
        setScreen(notice?.next || 'idle')
        return

      default:
    }
  }

  const pressRef = useRef(press)
  useEffect(() => {
    pressRef.current = press
  })
  useImperativeHandle(ref, () => ({ press: (key, raw) => pressRef.current(key, raw) }), [])

  const tap = (key) => (e) => {
    e.stopPropagation()
    pressRef.current(key)
  }

  // --- Rendering -------------------------------------------------------

  const lcdClass = `lcd ${backlight && screen !== 'off' ? 'is-lit' : ''} ${screen === 'off' ? 'is-off' : ''} ${matrix ? 'matrix-mode' : ''}`

  const softLabel = {
    idle: 'Menu',
    menu: 'Select',
    contacts: 'Open',
    projects: 'Open',
    desks: 'Open',
    profiles: 'Select',
    messages: 'Back',
    terminal: 'Run',
    dialing: 'Call',
    calling: 'End',
    notice: 'OK',
    snake: { ready: 'Start', playing: 'Pause', paused: 'Continue', over: 'Again' }[snakeStatus],
  }[screen]

  const srTitle = {
    off: 'Phone is off. Press any key to power on.',
    boot: 'Starting',
    idle: `Idle screen, ${clock}`,
    menu: `Menu, ${MENU[menuIdx].label}, ${menuIdx + 1} of ${MENU.length}`,
    messages: 'Message from Tanmay',
    snake: `Snake, ${snakeStatus === 'over' ? 'game over' : snakeStatus}`,
    terminal: 'Terminal',
    dialing: 'Dialing',
    calling: 'Calling',
    screensaver: 'Screensaver',
    notice: notice ? `${notice.title}. ${notice.text}` : '',
  }[screen]
  const srStatus = LISTS[screen]
    ? `${LISTS[screen].title}, ${LISTS[screen].items[listIdx]?.title}, ${listIdx + 1} of ${LISTS[screen].items.length}`
    : srTitle

  let body = null

  if (screen === 'off') {
    body = (
      <button {...noFocus} type="button" className="lcd-off-hint" onClick={tap('navi')} aria-label="Power on the phone">
        <PixelIcon name="power" className="lcd-off-icon" />
        <span>Press any key</span>
      </button>
    )
  } else if (screen === 'boot') {
    body = (
      <div className="lcd-boot">
        <img src={bootLogo} alt="Nokia start-up screen" />
      </div>
    )
  } else if (screen === 'idle') {
    body = (
      <div className="lcd-idle">
        <div className="lcd-bars" aria-hidden="true">
          {[4.6, 3.4, 2.3, 1.3].map((w) => <i key={w} style={{ width: `${w}cqw` }} />)}
          <svg viewBox="0 0 10 12" className="lcd-status-icon">
            <path d="M5,12 L5,4 M5,4 L0.5,0 M5,4 L9.5,0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
          </svg>
        </div>
        <div className="lcd-idle-center">
          <div className="lcd-idle-top">
            <span>{sound ? '' : 'Silent'}</span>
            <span>{clock}</span>
          </div>
          <img src={idleLogo} alt="" className="lcd-idle-logo" />
          <div className="lcd-idle-operator">{PROFILE.operator}</div>
        </div>
        <div className="lcd-bars is-right" aria-hidden="true">
          {[4.6, 3.4, 2.3, 1.3].map((w) => <i key={w} style={{ width: `${w}cqw` }} />)}
          <svg viewBox="0 0 8 12" className="lcd-status-icon">
            <rect x="0.8" y="1.8" width="6.4" height="9.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <rect x="2.5" y="0" width="3" height="1.8" fill="currentColor" />
          </svg>
        </div>
      </div>
    )
  } else if (screen === 'menu') {
    const item = MENU[menuIdx]
    body = (
      <div className="lcd-menu">
        <div className="lcd-head">
          <span>{item.label}</span>
          <span>{menuIdx + 1}</span>
        </div>
        <div className="lcd-menu-body">
          <button {...noFocus} type="button" className="lcd-menu-icon" onClick={tap('navi')} aria-label={`Open ${item.label}`}>
            <PixelIcon name={item.id} />
          </button>
          <div className="lcd-scrollbar" aria-hidden="true">
            <i style={{ '--p': menuIdx / (MENU.length - 1) }} />
          </div>
        </div>
      </div>
    )
  } else if (LISTS[screen]) {
    const { title, items } = LISTS[screen]
    body = (
      <div className="lcd-list">
        <div className="lcd-head">
          <span>{title}</span>
          <span>{listIdx + 1}/{items.length}</span>
        </div>
        <div className="lcd-list-rows" ref={listScrollRef}>
          {items.map((item, i) => {
            const active = i === listIdx
            const chosen = screen === 'profiles' && item.value === sound
            return (
              <button
                {...noFocus}
                type="button"
                key={item.title}
                data-row={i}
                className={`lcd-row ${active ? 'is-active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  setListIdx(i)
                  setActivity((n) => n + 1)
                  if (screen === 'profiles') {
                    onSoundChange?.(item.value)
                  } else {
                    openItem(item, screen)
                  }
                }}
              >
                <span className="lcd-row-title">
                  {item.title}
                  {screen === 'profiles' && <span className="lcd-radio">{chosen ? <b /> : null}</span>}
                </span>
                {active && <span className="lcd-row-sub">{item.sub}</span>}
              </button>
            )
          })}
        </div>
      </div>
    )
  } else if (screen === 'messages') {
    body = (
      <div className="lcd-list">
        <div className="lcd-head">
          <span>Inbox</span>
          <span>1/1</span>
        </div>
        <div className="lcd-message" ref={messageScrollRef}>
          <p className="lcd-message-from">From: {PROFILE.name}</p>
          {PROFILE.about.map((p) => <p key={p}>{p}</p>)}
        </div>
      </div>
    )
  } else if (screen === 'snake') {
    const g = gameRef.current
    const cells = new Set(g.body.map((s) => `${s.x},${s.y}`))
    const headKey = `${g.body[0].x},${g.body[0].y}`
    body = (
      <div className="lcd-snake">
        <div className="lcd-snake-score">
          <span>{String(g.score).padStart(4, '0')}</span>
          <span>Best {best}</span>
        </div>
        <div className="lcd-snake-board" style={{ gridTemplateColumns: `repeat(${GRID_W}, 1fr)`, aspectRatio: `${GRID_W} / ${GRID_H}` }}>
          {Array.from({ length: GRID_W * GRID_H }, (_, i) => {
            const k = `${i % GRID_W},${Math.floor(i / GRID_W)}`
            const isFood = g.food && k === `${g.food.x},${g.food.y}`
            return <i key={k} className={cells.has(k) ? (k === headKey ? 'is-head' : 'is-body') : isFood ? 'is-food' : ''} />
          })}
          {snakeStatus !== 'playing' && (
            <div className="lcd-snake-card">
              <strong>{{ ready: 'Snake', paused: 'Paused', over: 'Game over' }[snakeStatus]}</strong>
              <span>
                {snakeStatus === 'over' ? `Score ${g.score}` : snakeStatus === 'ready' ? 'Arrows or 2 4 6 8' : 'Press 5'}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  } else if (screen === 'terminal') {
    body = (
      <div className="lcd-term" onClick={() => termInputRef.current?.focus({ preventScroll: true })}>
        <div className="lcd-term-scroll" ref={termScrollRef}>
          {termHistory.map((line, i) => (
            <div key={i} className={line.type === 'input' ? 'is-input' : ''}>{line.text}</div>
          ))}
          <label className="lcd-term-prompt">
            <span>{termCwd}&gt;</span>
            <input
              ref={termInputRef}
              type="text"
              value={termInput}
              onChange={(e) => {
                setTermInput(e.target.value)
                setActivity((n) => n + 1)
              }}
              aria-label="Terminal command"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck="false"
              enterKeyHint="go"
            />
          </label>
        </div>
      </div>
    )
  } else if (screen === 'dialing' || screen === 'calling') {
    body = (
      <div className="lcd-dial">
        {screen === 'calling' && <span className="lcd-dial-label">Calling</span>}
        <span className="lcd-dial-number">{dialNumber}</span>
      </div>
    )
  } else if (screen === 'notice' && notice) {
    body = (
      <div className="lcd-notice">
        <strong>{notice.title}</strong>
        <span>{notice.text}</span>
      </div>
    )
  } else if (screen === 'screensaver') {
    body = <div className="lcd-saver">{clock}</div>
  }

  return (
    <div className={lcdClass}>
      <p className="sr-only" aria-live="polite">{srStatus}</p>
      <div className="lcd-content">
        <div className="lcd-body">{body}</div>
        {softLabel && (
          <button {...noFocus} type="button" className="lcd-soft" onClick={tap('navi')}>
            {softLabel}
          </button>
        )}
      </div>
      <div className="lcd-pixels" aria-hidden="true" />
      <div className="lcd-glow" aria-hidden="true" />
    </div>
  )
}
