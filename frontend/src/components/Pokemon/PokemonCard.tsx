import './PokemonCard.css';

interface PokemonCardProps {
  pokemon: {
    id: number;
    name: string;
    sprites: {
      front_default?: string;
    };
    types: string[];
    stats: {
      hp: number;
      attack: number;
      defense: number;
      'special-attack': number;
      'special-defense': number;
      speed: number;
    };
  };
}

export default function PokemonCard({ pokemon }: PokemonCardProps) {
  const totalStats = Object.values(pokemon.stats).reduce((a, b) => a + b, 0);
  const maxStat = 255;
  
  const getStatClass = (value: number) => {
    const percentage = (value / maxStat) * 100;
    if (percentage >= 60) return 'high';
    if (percentage >= 30) return 'medium';
    return 'low';
  };

  const getStrengthStars = () => {
    const stars = Math.min(Math.floor(totalStats / 120), 5);
    return stars;
  };

  const statIcons: { [key: string]: string } = {
    hp: '❤️',
    attack: '⚔️',
    defense: '🛡️',
    'special-attack': '✨',
    'special-defense': '💫',
    speed: '⚡'
  };

  return (
    <div className="pokemon-card">
      <div className="pokemon-header">
        <div className="pokemon-image-container">
          <div className="pokemon-image-wrapper">
            <img
              src={pokemon.sprites.front_default || '/placeholder.png'}
              alt={pokemon.name}
              className="pokemon-image"
            />
          </div>
          <div className="pokemon-number">#{pokemon.id.toString().padStart(3, '0')}</div>
        </div>

        <div className="pokemon-info">
          <h3 className="pokemon-name">{pokemon.name}</h3>
          
          <div className="pokemon-types">
            {pokemon.types.map((type) => (
              <span key={type} className={`type-badge type-${type}`}>
                {type}
              </span>
            ))}
          </div>

          <div className="pokemon-total-stats">
            <div className="total-label">Total Stats</div>
            <div className="total-value">{totalStats}</div>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <div className="stats-title">Base Stats</div>
        
        {Object.entries(pokemon.stats).map(([name, value]) => (
          <div key={name} className="stat-row">
            <div className="stat-info">
              <div className="stat-name">
                <span>{statIcons[name]}</span>
                <span>{name.replace('-', ' ')}</span>
              </div>
              <div className="stat-value">{value}</div>
            </div>
            <div className="stat-bar">
              <div
                className={`stat-fill ${getStatClass(value)}`}
                style={{ width: `${(value / maxStat) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="pokemon-footer">
        <div className="strength-indicator">
          <span className="strength-label">Overall Strength</span>
          <div className="strength-stars">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`star ${i < getStrengthStars() ? 'filled' : 'empty'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}