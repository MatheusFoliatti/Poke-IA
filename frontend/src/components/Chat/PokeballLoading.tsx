import React from 'react';
import './PokeballLoading.css';

interface PokeballLoadingProps {
  status: 'loading' | 'success' | 'error';
}

const PokeballLoading: React.FC<PokeballLoadingProps> = ({ status }) => {
  return (
    <div className={`pokeball-wrapper ${status}`}>
      <div className="pokeball">
        <div className="pokeball-top" />
        <div className="pokeball-middle">
          <div className="pokeball-button" />
        </div>
        <div className="pokeball-bottom" />
      </div>
      <span className="pokeball-label">
        {status === 'loading' && 'Pensando...'}
        {status === 'success' && 'Pronto!'}
        {status === 'error' && 'Erro...'}
      </span>
    </div>
  );
};

export default PokeballLoading;