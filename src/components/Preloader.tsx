import { useState, useEffect } from 'react';
import { BrandMark } from './BrandMark';
import './Preloader.css';

interface PreloaderProps {
    onEnter: () => void;
}

export function Preloader({ onEnter }: PreloaderProps) {
    const [isExiting, setIsExiting] = useState(false);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Delay para permitir que el comp montado gatille la clase ready
        const timer = setTimeout(() => setIsReady(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleEnter = () => {
        setIsExiting(true);
        // Espera de salida antes de desmontar
        setTimeout(onEnter, 800);
    };

    return (
        <div className={`ag-preloader-root ${isExiting ? 'exit' : ''} ${isReady ? 'ready' : ''}`}>
            <div className="ag-preloader-content">
                <div className="ag-preloader-logo-wrapper -mb-8 sm:-mb-12 md:-mb-16">
                    <BrandMark />
                </div>

                <div className="ag-preloader-branding">
                    <h2 className="ag-preloader-title">GYMPLEX<sup className="text-primary">&reg;</sup></h2>
                    <p className="ag-preloader-subtitle font-body">DATA TRACKER SYSTEM</p>
                </div>

                <button
                    className="ag-preloader-enter-btn font-display"
                    onClick={handleEnter}
                    aria-label="Enter website"
                >
                    [ INICIAR ]
                </button>
            </div>
        </div>
    );
}
