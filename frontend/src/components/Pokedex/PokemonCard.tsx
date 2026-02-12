import React from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, Shield, Zap, Heart, Swords } from 'lucide-react';

interface PokemonCardProps {
  pokemon: {
    id: number;
    name: string;
    types: string[];
    sprite?: string;
    stats: Record<string, number>;
  };
}

const typeColors: Record<string, string> = {
  normal: 'bg-gray-400',
  fire: 'bg-red-500',
  water: 'bg-blue-500',
  electric: 'bg-yellow-400',
  grass: 'bg-green-500',
  ice: 'bg-cyan-400',
  fighting: 'bg-red-700',
  poison: 'bg-purple-500',
  ground: 'bg-yellow-600',
  flying: 'bg-indigo-400',
  psychic: 'bg-pink-500',
  bug: 'bg-lime-500',
  rock: 'bg-yellow-700',
  ghost: 'bg-purple-700',
  dragon: 'bg-indigo-700',
  dark: 'bg-gray-800',
  steel: 'bg-gray-500',
  fairy: 'bg-pink-300',
};

const statIcons: Record<string, React.ReactNode> = {
  hp: <Heart className="w-4 h-4" />,
  attack: <Swords className="w-4 h-4" />,
  defense: <Shield className="w-4 h-4" />,
  'special-attack': <Zap className="w-4 h-4" />,
  'special-defense': <Shield className="w-4 h-4" />,
  speed: <TrendingUp className="w-4 h-4" />,
};

const statNames: Record<string, string> = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defesa',
  'special-attack': 'Atq. Esp.',
  'special-defense': 'Def. Esp.',
  speed: 'Velocidade',
};

export const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon }) => {
  const getStatColor = (value: number) => {
    if (value >= 100) return 'bg-green-500';
    if (value >= 70) return 'bg-yellow-500';
    if (value >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const totalStats = Object.values(pokemon.stats).reduce((a, b) => a + b, 0);
  const maxStat = Math.max(...Object.values(pokemon.stats));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border-2 border-slate-700 shadow-2xl max-w-md"
    >
      {/* Header com imagem e info básica */}
      <div className="flex items-start gap-6 mb-6">
        {/* Imagem do Pokémon */}
        <div className="relative">
          <div className="w-32 h-32 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl flex items-center justify-center shadow-lg border border-slate-600">
            {pokemon.sprite ? (
              <motion.img
                src={pokemon.sprite}
                alt={pokemon.name}
                className="w-28 h-28 object-contain"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              />
            ) : (
              <div className="w-20 h-20 bg-slate-600 rounded-full"></div>
            )}
          </div>
          {/* Número da Pokédex */}
          <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            #{pokemon.id.toString().padStart(3, '0')}
          </div>
        </div>

        {/* Info básica */}
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-white capitalize mb-2">
            {pokemon.name}
          </h3>
          
          {/* Tipos */}
          <div className="flex gap-2 mb-3">
            {pokemon.types.map((type) => (
              <span
                key={type}
                className={`${typeColors[type] || 'bg-gray-500'} text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide shadow-lg`}
              >
                {type}
              </span>
            ))}
          </div>

          {/* Total de Stats */}
          <div className="bg-slate-700 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-slate-400 text-sm">Total</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalStats}</p>
          </div>
        </div>
      </div>

      {/* Stats detalhadas */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
          Estatísticas Base
        </h4>
        
        {Object.entries(pokemon.stats).map(([stat, value]) => (
          <div key={stat} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">{statIcons[stat]}</span>
                <span className="text-sm text-slate-300">{statNames[stat] || stat}</span>
              </div>
              <span className="text-sm font-bold text-white">{value}</span>
            </div>
            
            {/* Barra de progresso */}
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(value / maxStat) * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full ${getStatColor(value)} rounded-full`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Footer com indicador de força */}
      <div className="mt-6 pt-4 border-t border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm">Força Geral</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.div
                key={star}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: star * 0.1 }}
              >
                <div
                  className={`w-4 h-4 ${
                    totalStats / 6 >= star * 20 
                      ? 'bg-yellow-400' 
                      : 'bg-slate-700'
                  } rounded-sm`}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PokemonCard;