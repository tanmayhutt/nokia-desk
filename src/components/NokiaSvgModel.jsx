import { useState, useCallback, useEffect } from 'react'
import NokiaUI from './NokiaUI'
import nokiaImg from '../assets/nokia3310_model.svg'

export default function NokiaSvgModel() {
  const [coverColor, setCoverColor] = useState('hue-rotate(0deg)');
  const [isBacklightOn, setIsBacklightOn] = useState(true);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === '*') setIsBacklightOn(prev => !prev);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const colors = [
    { name: 'Navy', filter: 'hue-rotate(0deg)' },
    { name: 'Red', filter: 'hue-rotate(150deg) saturate(2)' },
    { name: 'Yellow', filter: 'hue-rotate(200deg) saturate(2.5) brightness(1.2)' },
    { name: 'Green', filter: 'hue-rotate(280deg) saturate(1.5)' },
    { name: 'Grey', filter: 'saturate(0) brightness(1.5)' }
  ];

  const dispatchKey = useCallback((key) => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key }))
  }, [])

  return (
    <div className="w-full bg-[#434553] flex flex-col items-center select-none overflow-x-hidden min-h-screen">
      
      {/* Xpress-on Covers Color Picker */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-50">
        <div className="text-white text-xs font-bold font-sans uppercase mb-1 drop-shadow-md">Xpress-on™</div>
        {colors.map(c => (
          <button 
            key={c.name}
            onClick={() => setCoverColor(c.filter)}
            className={`px-3 py-1 text-xs font-sans rounded-full border-[1.5px] ${coverColor === c.filter ? 'border-white bg-white/20' : 'border-white/20 bg-black/20'} text-white/90 hover:text-white backdrop-blur-sm transition-colors shadow-lg cursor-pointer`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="relative w-full" style={{ aspectRatio: '280/640' }}>
        {/* The SVG Model */}
        <img 
          src={nokiaImg}
          alt="Nokia 3310 Model" 
          className="w-full h-full block pointer-events-none drop-shadow-2xl transition-all duration-500" 
          style={{ filter: coverColor }}
        />

        {/* The Screen Overlay */}
        <div 
          className="absolute overflow-hidden"
          style={{
            top: '26.3%', left: '17%', width: '67%', height: '20%',
            backgroundColor: isBacklightOn ? 'transparent' : 'rgba(0,0,0,0.6)',
            borderRadius: '4%',
            containerType: 'inline-size'
          }}
        >
          <div className="w-full h-full overflow-hidden relative" style={{ opacity: isBacklightOn ? 1 : 0.6 }}>
            <NokiaUI isMassive={true} />
          </div>
        </div>

        {/* Soft Key: Navi (Enter) */}
        <button 
          onClick={() => dispatchKey('Enter')}
          className="absolute cursor-pointer rounded-full opacity-0"
          style={{ top: '50.5%', left: '32.1%', width: '36.1%', height: '4.4%' }}
          title="Menu / Select"
        />

        {/* Soft Key: C (Escape) */}
        <button 
          onClick={() => dispatchKey('Escape')}
          className="absolute cursor-pointer rounded-full opacity-0"
          style={{ top: '52.3%', left: '16.8%', width: '18.9%', height: '7.7%' }}
          title="Back / Clear"
        />

        {/* Rocker: Up */}
        <button 
          onClick={() => dispatchKey('ArrowUp')}
          className="absolute cursor-pointer rounded-full opacity-0"
          style={{ top: '52.5%', left: '55.7%', width: '28.6%', height: '5.2%' }}
          title="Up"
        />

        {/* Rocker: Down */}
        <button 
          onClick={() => dispatchKey('ArrowDown')}
          className="absolute cursor-pointer rounded-full opacity-0"
          style={{ top: '57.7%', left: '55.7%', width: '28.6%', height: '5.2%' }}
          title="Down"
        />

        {/* Numpad Grid */}
        <div 
          className="absolute grid grid-cols-3 gap-1"
          style={{ top: '65%', left: '20%', width: '64%', height: '25%' }}
        >
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((key) => (
            <button
              key={key}
              onClick={() => dispatchKey(key)}
              className="w-full h-full cursor-pointer rounded-full opacity-0"
              title={key}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
