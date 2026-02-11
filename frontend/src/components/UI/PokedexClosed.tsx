import { ReactNode } from 'react';
import './PokedexClosed.css';

interface PokedexClosedProps {
  children: ReactNode;
}

export default function PokedexClosed({ children }: PokedexClosedProps) {
  return (
    <div className="pokedex-background">
      <div className="pokedex-container">
        <div className="pokedex-body">
          {/* Top Section */}
          <div className="pokedex-top">
            <div className="main-light">
              <div className="main-light-inner"></div>
              <div className="main-light-highlight"></div>
            </div>
            
            <div className="indicator-lights">
              <div className="indicator-light red"></div>
              <div className="indicator-light yellow"></div>
              <div className="indicator-light green"></div>
            </div>
          </div>

          {/* Screen Area */}
          <div className="pokedex-screen">
            {children}
          </div>

          {/* Bottom Controls */}
          <div className="pokedex-controls">
            <div className="dpad">
              <div className="dpad-button dpad-up"></div>
              <div className="dpad-button dpad-down"></div>
              <div className="dpad-button dpad-left"></div>
              <div className="dpad-button dpad-right"></div>
              <div className="dpad-button dpad-center"></div>
            </div>

            <div className="action-buttons">
              <div className="action-button blue"></div>
              <div className="action-button red"></div>
            </div>
          </div>

          {/* Hinge */}
          <div className="pokedex-hinge"></div>
        </div>

        {/* Shadow */}
        <div className="pokedex-shadow"></div>
      </div>
      {/* REMOVIDO: <p className="footer-text">Press START to begin your journey</p> */}
    </div>
  );
}