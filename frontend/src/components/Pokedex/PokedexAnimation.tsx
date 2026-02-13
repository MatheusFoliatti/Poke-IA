import { useEffect, useState } from 'react';
import './PokedexAnimation.css';

interface PokedexAnimationProps {
  onComplete: () => void;
}

export default function PokedexAnimation({ onComplete }: PokedexAnimationProps) {
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    // Inicia a animação de pulso da lente
    const pulseTimer = setTimeout(() => {
      setIsOpening(true);
    }, 800);

    // Completa após a animação
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(pulseTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="pokedex-animation-container">
      <div className="pokedex-wrapper">
        <div className={`pokedex-3d ${isOpening ? 'opening' : ''}`}>
          {/* Frente */}
          <div className="pokedex-front">
            <div className="lens-container">
              <div className="big-lens">
                <div className={`lens-inner ${isOpening ? 'pulsing' : ''}`}></div>
              </div>
            </div>

            <div className="small-lights">
              <div className="light red"></div>
              <div className="light yellow"></div>
              <div className="light green"></div>
            </div>

            <div className="pokedex-logo">
              <div className="logo-text">POKEDEX</div>
              <div className="logo-subtitle">AI SYSTEM</div>
            </div>

            <div className="bottom-detail"></div>
          </div>

          {/* Traseira */}
          <div className="pokedex-back">
            <div className="screen-container">
              <div className="status-circle">
                <div className="status-circle-inner"></div>
              </div>
              <div className="system-text">SYSTEM READY</div>
              <div className="welcome-text">Welcome, Trainer!</div>
            </div>
          </div>
        </div>

        <div className="loading-text-container">
          <div className="loading-text">Carregando Pokedex...</div>
          <div className="loading-dots-container">
            <div className="loading-dot-anim"></div>
            <div className="loading-dot-anim"></div>
            <div className="loading-dot-anim"></div>
          </div>
        </div>
      </div>
    </div>
  );
}