import { useState, useEffect, useCallback, useRef } from 'react'
import { PROFILE, MENU } from './NokiaData'
import { playBeep, playSnakeEat, playSnakeCrash, playStartupChime, playSaulTheme } from './audioUtils'

export default function NokiaUI() {
  const [screen, setScreen] = useState('off')
  const [menuIdx, setMenuIdx] = useState(0)
  const [timeStr, setTimeStr] = useState('')
  
  // States for sub-apps
  const [activeItemIdx, setActiveItemIdx] = useState(0)
  const scrollRef = useRef(null)

  // Snake Game States
  const gridW = 15;
  const gridH = 10;
  const snakeRef = useRef([{x: 7, y: 5}]);
  const foodRef = useRef({x: 10, y: 5});
  const scoreRef = useRef(0);
  const [gameState, setGameState] = useState('IDLE'); // IDLE, PLAYING, GAMEOVER
  const directionRef = useRef('RIGHT');
  const lastMoveDirectionRef = useRef('RIGHT');
  const [renderTick, setRenderTick] = useState(0);

  // GitHub Projects State
  const [projects, setProjects] = useState(PROFILE.projects);

  // Terminal App States
  const [termHistory, setTermHistory] = useState([{ type: 'output', text: 'Nokia OS v1.0\nType "help" for commands.' }]);
  const [termCwd, setTermCwd] = useState('~');
  const [termInput, setTermInput] = useState('');
  const termScrollRef = useRef(null);
  
  const VFS = useRef({
    '~': {
      'about.txt': PROFILE.about.join(' '),
      'contact.txt': PROFILE.contacts.map(c => `${c.label}: ${c.value}`).join('\n'),
      'projects': {}
    }
  });

  useEffect(() => {
    if (projects.length > 0) {
      VFS.current['~']['projects'] = projects.reduce((acc, p) => {
        acc[p.name.toLowerCase().replace(/[^a-z0-9]/g, '-')] = p.desc || p.content;
        return acc;
      }, {});
    }
  }, [projects]);

  const handleTerminalCommand = useCallback((e) => {
    if (e.key === 'Enter') {
      const cmd = termInput.trim();
      setTermInput('');
      
      let newHistory = [...termHistory, { type: 'input', text: `${termCwd} > ${cmd}` }];
      
      if (!cmd) {
        setTermHistory(newHistory);
        return;
      }
      
      const args = cmd.split(' ').filter(Boolean);
      const program = args[0].toLowerCase();
      
      let currentDir = VFS.current['~'];
      if (termCwd !== '~') {
        const pathParts = termCwd.replace('~/', '').split('/');
        for (const part of pathParts) {
          if (part && currentDir[part]) currentDir = currentDir[part];
        }
      }

      if (program === 'help') {
        newHistory.push({ type: 'output', text: 'Commands: ls, cd, cat, clear, help, matrix, saul' });
      } else if (program === 'matrix') {
        newHistory.push({ type: 'output', text: 'Wake up, Neo...' });
        const screenNode = document.getElementById('nokia-ui-screen-inner');
        if (screenNode) {
          screenNode.classList.add('matrix-mode');
          setTimeout(() => screenNode.classList.remove('matrix-mode'), 5000);
        }
      } else if (program === 'saul') {
        newHistory.push({ type: 'output', text: 'Better Call Saul!\n\n      _.-""""`-.\n    ,\'      _  _`.\n   /      (o)(o) \\\n  |        (  )   |\n  |        _||_   |\n   \\      \'===\'  /\n    \'.          .\'\n      `-......-\'\n' });
        playSaulTheme();
      } else if (program === 'clear') {
        newHistory = [];
      } else if (program === 'ls') {
        const items = Object.keys(currentDir).map(k => typeof currentDir[k] === 'object' ? `${k}/` : k);
        newHistory.push({ type: 'output', text: items.length > 0 ? items.join('  ') : '(empty)' });
      } else if (program === 'cd') {
        const target = args[1];
        if (!target || target === '~' || target === '/') {
          setTermCwd('~');
        } else if (target === '..') {
          if (termCwd !== '~') {
            const parts = termCwd.split('/');
            parts.pop();
            setTermCwd(parts.length > 0 ? parts.join('/') : '~');
          }
        } else if (currentDir[target] && typeof currentDir[target] === 'object') {
          setTermCwd(termCwd === '~' ? `~/${target}` : `${termCwd}/${target}`);
        } else {
          newHistory.push({ type: 'output', text: `cd: ${target}: No such directory` });
        }
      } else if (program === 'cat') {
        const target = args[1];
        if (!target) {
          newHistory.push({ type: 'output', text: 'cat: missing operand' });
        } else if (currentDir[target] && typeof currentDir[target] === 'string') {
          newHistory.push({ type: 'output', text: currentDir[target] });
        } else if (currentDir[target] && typeof currentDir[target] === 'object') {
          newHistory.push({ type: 'output', text: `cat: ${target}: Is a directory` });
        } else {
          newHistory.push({ type: 'output', text: `cat: ${target}: No such file or directory` });
        }
      } else {
        newHistory.push({ type: 'output', text: `Command not found: ${program}` });
      }
      
      setTermHistory(newHistory);
    }
  }, [termInput, termHistory, termCwd]);

  useEffect(() => {
    if (screen === 'terminal' && termScrollRef.current) {
      termScrollRef.current.scrollTop = termScrollRef.current.scrollHeight;
    }
  }, [termHistory, screen]);

  useEffect(() => {
    fetch('https://api.github.com/users/tanmayhutt/repos?sort=updated')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const myProjects = data.filter(repo => !repo.fork);
          const formatted = myProjects.map(repo => ({
            name: repo.name,
            desc: repo.description || '',
            url: repo.html_url,
            content: `Language: ${repo.language || 'N/A'}\nStars: ${repo.stargazers_count}\nURL: ${repo.html_url}`
          }));
          if (formatted.length > 0) {
            setProjects(formatted);
          }
        }
      })
      .catch(err => console.error('Failed to fetch github repos', err));
  }, []);

  useEffect(() => {
    if (screen === 'boot') {
      playStartupChime();
      const timer = setTimeout(() => setScreen('idle'), 3500)
      return () => clearTimeout(timer)
    }
  }, [screen])

  useEffect(() => {
    if (screen === 'projects' || screen === 'contacts') {
      const activeEl = document.getElementById(`list-item-${activeItemIdx}`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeItemIdx, screen])

  useEffect(() => {
    const updateTime = () => {
      const d = new Date()
      let h = d.getHours(), m = d.getMinutes().toString().padStart(2, '0')
      const ap = h >= 12 ? 'PM' : 'AM'
      setTimeStr(`${h%12||12}:${m}${ap}`)
    }
    updateTime()
    const t = setInterval(updateTime, 60000)
    return () => clearInterval(t)
  }, [])

  // Snake Game Engine
  useEffect(() => {
    if (screen !== 'snake' || gameState !== 'PLAYING') return;
    
    const tick = () => {
      const prev = snakeRef.current;
      const head = { ...prev[0] };
      const currentDir = directionRef.current;
      lastMoveDirectionRef.current = currentDir;
      
      if (currentDir === 'UP') head.y -= 1;
      if (currentDir === 'DOWN') head.y += 1;
      if (currentDir === 'LEFT') head.x -= 1;
      if (currentDir === 'RIGHT') head.x += 1;

      // Collision with walls or self
      if (head.x < 0 || head.x >= gridW || head.y < 0 || head.y >= gridH || prev.some(seg => seg.x === head.x && seg.y === head.y)) {
        playSnakeCrash();
        setGameState('GAMEOVER');
        return;
      }

      const newSnake = [head, ...prev];
      const currentFood = foodRef.current;
      
      if (head.x === currentFood.x && head.y === currentFood.y) {
        scoreRef.current += 10;
        playSnakeEat();
        // Spawn new food
        let newFood;
        while (true) {
          newFood = {
            x: Math.floor(Math.random() * gridW),
            y: Math.floor(Math.random() * gridH)
          };
          if (!newSnake.some(s => s.x === newFood.x && s.y === newFood.y)) break;
        }
        foodRef.current = newFood;
      } else {
        newSnake.pop();
      }
      
      snakeRef.current = newSnake;
      setRenderTick(t => t + 1);
    };

    const interval = setInterval(tick, 200); // Constant speed 200ms
    return () => clearInterval(interval);
  }, [screen, gameState]);

  const handleOpenApp = useCallback((appId) => {
    setScreen(appId)
    setActiveItemIdx(0)
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [])

  const handleKeyDown = useCallback((e) => {
    if (screen === 'off') {
      setScreen('boot');
      return;
    }

    // Only beep for printable characters or control keys we use
    if (e.key.length === 1 || ['Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Backspace', 'Escape'].includes(e.key)) {
      playBeep();
    }

    if (screen === 'terminal') {
      if (e.key === 'Escape') {
        setScreen('menu');
        e.preventDefault();
      }
      return;
    }

    // Prevent default scrolling for arrow keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
    }

    if (screen === 'boot') return

    if (screen === 'idle') {
      if (e.key === 'Enter') {
        setScreen('menu')
        setMenuIdx(0)
      }
      return
    }

    if (screen === 'menu') {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') setMenuIdx(prev => (prev - 1 + MENU.length) % MENU.length)
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') setMenuIdx(prev => (prev + 1) % MENU.length)
      if (e.key === 'Enter') {
        const selected = MENU[menuIdx].id;
        if (selected === 'github') {
          window.open('https://github.com/tanmayhutt', '_blank');
          setScreen('idle');
        } else if (selected === 'instagram') {
          window.open('https://www.instagram.com/tanmayhutt/', '_blank');
          setScreen('idle');
        } else {
          handleOpenApp(selected);
        }
      }
      if (e.key === 'Escape' || e.key === 'Backspace') setScreen('idle')
      return
    }

    // Generic list navigation (Contacts, Projects)
    if (screen === 'contacts' || screen === 'projects') {
      const listLen = screen === 'contacts' ? PROFILE.contacts.length : projects.length
      if (e.key === 'ArrowUp') setActiveItemIdx(prev => Math.max(0, prev - 1))
      if (e.key === 'ArrowDown') setActiveItemIdx(prev => Math.min(listLen - 1, prev + 1))
      if (e.key === 'Enter') {
        if (screen === 'contacts' && PROFILE.contacts[activeItemIdx]) {
          window.open(PROFILE.contacts[activeItemIdx].url, '_blank')
        } else if (screen === 'projects' && projects[activeItemIdx] && projects[activeItemIdx].url) {
          window.open(projects[activeItemIdx].url, '_blank')
        }
      }
      if (e.key === 'Escape' || e.key === 'Backspace') setScreen('menu')
      return
    }

    // Scrollable text view (Messages/About)
    if (screen === 'messages') {
      if (e.key === 'ArrowUp' && scrollRef.current) scrollRef.current.scrollBy({ top: -20, behavior: 'smooth' })
      if (e.key === 'ArrowDown' && scrollRef.current) scrollRef.current.scrollBy({ top: 20, behavior: 'smooth' })
      if (e.key === 'Escape' || e.key === 'Backspace') setScreen('menu')
      return
    }

    if (screen === 'snake') {
      if (gameState === 'IDLE' || gameState === 'GAMEOVER') {
        if (e.key === 'Enter' || ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', '2', '8', '4', '6'].includes(e.key)) {
          snakeRef.current = [{x: 7, y: 5}];
          foodRef.current = {x: 10, y: 5};
          scoreRef.current = 0;
          
          let initialDir = 'RIGHT';
          if (e.key === 'ArrowUp' || e.key === '2') initialDir = 'UP';
          if (e.key === 'ArrowDown' || e.key === '8') initialDir = 'DOWN';
          if (e.key === 'ArrowLeft' || e.key === '4') initialDir = 'LEFT';
          if (e.key === 'ArrowRight' || e.key === '6') initialDir = 'RIGHT';
          
          directionRef.current = initialDir;
          lastMoveDirectionRef.current = initialDir;
          
          setGameState('PLAYING');
          setRenderTick(t => t + 1);
        }
      } else if (gameState === 'PLAYING') {
        const lastMove = lastMoveDirectionRef.current;
        if ((e.key === 'ArrowUp' || e.key === '2') && lastMove !== 'DOWN') directionRef.current = 'UP';
        if ((e.key === 'ArrowDown' || e.key === '8') && lastMove !== 'UP') directionRef.current = 'DOWN';
        if ((e.key === 'ArrowLeft' || e.key === '4') && lastMove !== 'RIGHT') directionRef.current = 'LEFT';
        if ((e.key === 'ArrowRight' || e.key === '6') && lastMove !== 'LEFT') directionRef.current = 'RIGHT';
      }
      if (e.key === 'Escape' || e.key === 'Backspace') {
        setScreen('menu');
        setGameState('IDLE');
      }
      return
    }

    if (e.key === 'Escape' || e.key === 'Backspace') setScreen('idle')
  }, [screen, menuIdx, activeItemIdx, handleOpenApp, gameState])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (screen === 'off') {
    return (
      <div 
        className="w-full h-full flex flex-col items-center justify-center p-4 cursor-pointer"
        onClick={() => setScreen('boot')}
      >
      </div>
    )
  }

  if (screen === 'boot') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 animate-[bootFade_3.5s_ease-in-out_forwards]">
        <img 
          src="/boot_logo.png" 
          alt="Boot Logo"
          className="w-full h-full object-contain filter grayscale contrast-200 mix-blend-multiply opacity-90"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
    )
  }

  return (
    <div 
      id="nokia-ui-screen-inner"
      className="w-full h-full flex flex-col text-[2.5cqw] text-[#1a2e0e] bg-transparent p-[1cqw] font-sans"
      style={{ fontFamily: '"Nokia Cellphone FC", monospace' }}
    >
      {/* Top area for time if needed, though usually idle screen has it centered. Let's keep a tiny spacer */}
      <div className="h-[2cqw] w-full"></div>

      {/* Main Content Area flanked by vertical bars */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* Left Vertical Signal Bar */}
        {screen !== 'boot' && (
          <div className="w-[6cqw] flex flex-col items-start py-[1cqw] justify-between h-full pl-[1.5cqw]">
            <div className="w-[3cqw] h-[3.5cqw] bg-[#1a2e0e]"></div>
            <div className="w-[2.2cqw] h-[3.5cqw] bg-[#1a2e0e]"></div>
            <div className="w-[1.5cqw] h-[3.5cqw] bg-[#1a2e0e]"></div>
            <div className="w-[0.8cqw] h-[3.5cqw] bg-[#1a2e0e]"></div>
            <svg viewBox="0 0 10 12" className="w-[3.5cqw] h-[4cqw] mt-[0.5cqw] -ml-[1.2cqw]">
              <path d="M5,12 L5,4 M5,4 L0.5,0 M5,4 L9.5,0" fill="none" stroke="#1a2e0e" strokeWidth="1.5" strokeLinecap="square" />
            </svg>
          </div>
        )}

        {/* Central Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative px-[1cqw]">
          {screen === 'idle' && (
            <div className="flex-1 flex flex-col justify-between py-[1cqw]">
              {/* Top row */}
              <div className="flex justify-between items-start w-full px-[1cqw]">
                {/* Key Icon */}
                <svg viewBox="0 0 16 16" className="w-[3cqw] h-[3cqw]">
                  <path d="M5,8 A2,2 0 1,1 5,7.9 M7,8 L15,8 M13,8 L13,11 M15,8 L15,11" fill="none" stroke="#1a2e0e" strokeWidth="1.5" strokeLinecap="square" />
                </svg>
                <div className="text-[3cqw] font-bold tracking-widest">{timeStr}</div>
              </div>
              
              {/* Central Graphic */}
              <div className="flex-1 flex items-center justify-center px-[3cqw]">
                <img 
                  src="/idle_logo.png" 
                  alt="Idle Graphic" 
                  className="w-full max-h-[12cqw] object-contain filter grayscale contrast-200 opacity-90 mix-blend-multiply" 
                  style={{ imageRendering: 'pixelated' }} 
                />
              </div>
              
              {/* Bottom text */}
              <div className="text-[3cqw] font-bold text-center mt-auto tracking-widest">
                {PROFILE.operator}
              </div>
            </div>
          )}

          {screen === 'menu' && (
            <div className="flex-1 flex flex-col mt-[1cqw]">
              <div className="flex justify-between items-center mb-[1cqw] text-[2.5cqw] border-b-[2px] border-[#1a2e0e] pb-[1cqw] flex-shrink-0 font-bold tracking-wider">
                <div className="flex items-center gap-[1cqw]">
                  <span className="opacity-80 scale-x-75">◀</span>
                  <span>{MENU[menuIdx].label}</span>
                  <span className="opacity-80 scale-x-75">▶</span>
                </div>
                <span>{menuIdx + 1}</span>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center px-[4cqw]">
                <div className="w-[14cqw] h-[14cqw] flex items-center justify-center">
                  {MENU[menuIdx].icon}
                </div>
              </div>
            </div>
          )}

          {screen === 'messages' && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="text-[2cqw] border-b-[2px] border-[#1a2e0e] mb-2 pb-2 flex-shrink-0 font-bold">ABOUT ME</div>
              <div ref={scrollRef} className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] relative">
                <div className="w-full">
                  {PROFILE.about.map((p, i) => <p key={i} className="mb-4 leading-relaxed">{p}</p>)}
                </div>
              </div>
            </div>
          )}

          {screen === 'contacts' && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex justify-between text-[2cqw] font-bold border-b-[2px] border-[#1a2e0e] mb-2 pb-2 flex-shrink-0">
                <span>CONTACTS</span>
                <span>{activeItemIdx + 1}/{PROFILE.contacts.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                <div className="flex flex-col">
                  {PROFILE.contacts.map((c, i) => (
                    <div 
                      key={c.label} 
                      id={`list-item-${i}`}
                      onClick={() => { setActiveItemIdx(i); window.open(c.url, '_blank'); }}
                      className={`flex justify-between items-center py-4 px-2 cursor-pointer ${i === activeItemIdx ? 'bg-[#1a2e0e] text-[#9dc87a]' : ''}`}
                    >
                      <span className="text-[2cqw]">{c.label}</span>
                      <span className="text-[1.2cqw]">{c.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {screen === 'projects' && (
            <div className="flex-1 overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 bg-[#9dc87a] z-10 font-bold border-b-[2px] border-[#1a2e0e] text-[2.5cqw] px-[1cqw] flex justify-between">
                <span>Projects</span>
                <span>{activeItemIdx + 1}/{projects.length}</span>
              </div>
              <div className="mt-[4cqw] h-[calc(100%-4cqw)] overflow-y-auto px-[1cqw]" ref={scrollRef}>
                <div className="flex flex-col space-y-[1.5cqw] pt-[1cqw] pb-[2cqw]">
                  {projects.map((p, i) => (
                    <div 
                      key={p.name} 
                      id={`list-item-${i}`}
                      onClick={() => { setActiveItemIdx(i); if (p.url) window.open(p.url, '_blank'); }}
                      className={`flex flex-col justify-center py-4 px-2 border-b-[2px] border-[#1a2e0e]/50 cursor-pointer ${i === activeItemIdx ? 'bg-[#1a2e0e] text-[#9dc87a]' : ''}`}
                    >
                      <span className="font-bold text-[2cqw]">{p.name}</span>
                      {p.desc && <span className="text-[1.2cqw] mt-2 leading-loose">{p.desc}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {screen === 'snake' && (
            <div className="flex-1 flex flex-col items-center justify-center relative w-full h-full">
              {gameState === 'IDLE' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                  <div className="bg-[#9dc87a] border-[0.5cqw] border-[#1a2e0e] rounded-[3cqw] px-[4cqw] py-[2cqw] flex flex-col items-center shadow-lg">
                    <div className="text-[2.5cqw] mb-2 font-bold">SNAKE</div>
                    <div className="text-[1.5cqw] opacity-70 mt-2 text-center leading-tight">Press Enter<br/>or Arrows</div>
                  </div>
                </div>
              )}
              {gameState === 'GAMEOVER' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 backdrop-blur-[1px]">
                  <div className="bg-[#9dc87a] border-[0.5cqw] border-[#1a2e0e] rounded-[3cqw] px-[4cqw] py-[2cqw] flex flex-col items-center shadow-lg">
                    <div className="text-[2.5cqw] mb-2 font-bold">GAME OVER</div>
                    <div className="text-[1.5cqw] mb-4">Score: {scoreRef.current}</div>
                    <div className="text-[1.5cqw] opacity-70">Press Enter</div>
                  </div>
                </div>
              )}
              <div 
                className="grid w-full aspect-[1.5] bg-transparent"
                style={{ 
                  gridTemplateColumns: `repeat(${gridW}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${gridH}, minmax(0, 1fr))` 
                }}
              >
                {Array.from({ length: gridH * gridW }).map((_, i) => {
                  const x = i % gridW;
                  const y = Math.floor(i / gridW);
                  const isSnake = snakeRef.current.some(seg => seg.x === x && seg.y === y);
                  const isFood = foodRef.current.x === x && foodRef.current.y === y;
                  return (
                    <div 
                      key={i} 
                      className={`w-full h-full border-[0.5px] border-[#1a2e0e]/10 ${isSnake ? 'bg-[#1a2e0e]' : isFood ? 'bg-[#1a2e0e] scale-75 rounded-[1px]' : ''}`}
                    ></div>
                  )
                })}
              </div>
              <div className="absolute top-0 right-0 text-[1.5cqw]">Score: {scoreRef.current}</div>
            </div>
          )}

          {screen === 'terminal' && (
            <div className="flex-1 flex flex-col p-[1cqw] overflow-hidden text-[1.5cqw] leading-tight" onClick={() => { const input = document.getElementById('term-input'); if(input) input.focus(); }}>
              <div className="flex-1 overflow-y-auto break-words whitespace-pre-wrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']" ref={termScrollRef}>
                {termHistory.map((line, i) => (
                  <div key={i} className={line.type === 'input' ? 'font-bold mt-[1cqw]' : 'mt-[0.5cqw]'}>
                    {line.text}
                  </div>
                ))}
                <div className="flex mt-[1cqw] items-center">
                  <span className="mr-[1cqw] whitespace-nowrap">{termCwd} &gt;</span>
                  <input 
                    id="term-input"
                    type="text" 
                    autoFocus
                    value={termInput}
                    onChange={e => setTermInput(e.target.value)}
                    onKeyDown={handleTerminalCommand}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    className="flex-1 bg-transparent outline-none border-none text-inherit font-inherit caret-[#1a2e0e] p-0 m-0 shadow-none focus:ring-0 w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Vertical Battery Bar */}
        {screen !== 'boot' && (
          <div className="w-[6cqw] flex flex-col items-end py-[1cqw] justify-between h-full pr-[1cqw]">
            <div className="w-[3cqw] h-[3.5cqw] bg-[#1a2e0e]"></div>
            <div className="w-[2.2cqw] h-[3.5cqw] bg-[#1a2e0e]"></div>
            <div className="w-[1.5cqw] h-[3.5cqw] bg-[#1a2e0e]"></div>
            <div className="w-[0.8cqw] h-[3.5cqw] bg-[#1a2e0e]"></div>
            <div className="flex flex-col items-center mt-[0.5cqw] mr-[-0.2cqw]">
              {/* Battery Nub */}
              <div className="w-[1.2cqw] h-[0.5cqw] bg-[#1a2e0e]"></div>
              {/* Battery Body Outline */}
              <div className="w-[3cqw] h-[4.5cqw] border-[1.5px] border-[#1a2e0e]"></div>
            </div>
          </div>
        )}
      </div>

      {/* Soft keys */}
      <div className="flex justify-between px-[2cqw] py-[1cqw] border-t-[3px] border-[#1a2e0e] mt-1 text-[2cqw] font-bold">
        <span 
          className="cursor-pointer"
          onClick={() => {
            if (screen === 'idle') {
              setScreen('menu')
              setMenuIdx(0)
            } else if (screen === 'contacts' && PROFILE.contacts[activeItemIdx]) {
              window.open(PROFILE.contacts[activeItemIdx].url, '_blank')
            } else if (screen === 'projects' && projects[activeItemIdx]) {
              if (projects[activeItemIdx].url) {
                window.open(projects[activeItemIdx].url, '_blank')
              }
            } else if (screen === 'terminal') {
              handleTerminalCommand({ key: 'Enter' });
            } else if (screen === 'menu') {
              const selected = MENU[menuIdx].id;
              if (selected === 'github') {
                window.open('https://github.com/tanmayhutt', '_blank');
                setScreen('idle');
              } else if (selected === 'instagram') {
                window.open('https://www.instagram.com/tanmayhutt/', '_blank');
                setScreen('idle');
              } else {
                handleOpenApp(selected);
              }
            }
          }}
        >
          {screen === 'idle' ? 'Menu' : (screen === 'contacts' || screen === 'projects') ? 'Open' : screen === 'terminal' ? 'Enter' : 'Select'}
        </span>
        <span 
          className="cursor-pointer"
          onClick={() => {
            if (screen === 'menu' || screen === 'messages' || screen === 'contacts' || screen === 'projects' || screen === 'snake' || screen === 'terminal') {
              setScreen('menu')
            }
            if (screen === 'menu' && menuIdx === 0) {
              setScreen('idle')
            } else {
              setScreen('idle')
            }
          }}
        >
          {screen === 'idle' ? 'Names' : 'Back'}
        </span>
      </div>
    </div>
  )
}
