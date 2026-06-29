import { useState } from 'react'
import NokiaSvgModel from './components/NokiaSvgModel'
import ModernOverlay from './components/ModernOverlay'

export default function App() {
    const [activeOverlay, setActiveOverlay] = useState(null)

    return (
        <div className="w-screen min-h-screen bg-[#e8ecef] overflow-x-hidden overflow-y-auto font-sans flex flex-col items-center relative">
            <NokiaSvgModel onOpenLink={(type, data) => setActiveOverlay({ type, data })} />
            {activeOverlay && (
                <ModernOverlay 
                    overlay={activeOverlay} 
                    onClose={() => setActiveOverlay(null)} 
                />
            )}
        </div>
    )
}
