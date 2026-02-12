import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PokedexAnimationProps {
  onComplete: () => void;
}

export const PokedexAnimation: React.FC<PokedexAnimationProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'closed' | 'opening' | 'open'>('closed');

  useEffect(() => {
    // Inicia animação de abertura após 500ms
    const timer1 = setTimeout(() => {
      setStage('opening');
    }, 500);

    // Completa animação após 2s
    const timer2 = setTimeout(() => {
      setStage('open');
      onComplete();
    }, 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
      <motion.div
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Pokédex fechada */}
        <motion.div
          className="relative w-80 h-96"
          animate={{
            rotateY: stage === 'opening' || stage === 'open' ? -180 : 0,
          }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Parte da frente (tampa) */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800 rounded-3xl shadow-2xl border-8 border-red-900"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* Círculo superior grande (azul) */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg border-4 border-white flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-300 to-blue-400">
                  <motion.div
                    className="w-full h-full rounded-full"
                    animate={{
                      boxShadow: stage === 'opening' 
                        ? ['0 0 10px rgba(59, 130, 246, 0.5)', '0 0 30px rgba(59, 130, 246, 1)', '0 0 10px rgba(59, 130, 246, 0.5)']
                        : '0 0 10px rgba(59, 130, 246, 0.5)',
                    }}
                    transition={{ duration: 0.5, repeat: stage === 'opening' ? 3 : 0 }}
                  />
                </div>
              </div>
            </div>

            {/* Luzes decorativas */}
            <div className="absolute top-8 right-12 flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-lg"></div>
              <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg"></div>
            </div>

            {/* Logo Pokédex */}
            <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <h1 className="text-4xl font-bold text-white drop-shadow-lg" style={{ fontFamily: 'Press Start 2P, cursive' }}>
                  POKéDEX
                </h1>
                <p className="text-white text-sm mt-2">AI Edition</p>
              </motion.div>
            </div>

            {/* Detalhe inferior */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-32 h-2 bg-red-900 rounded-full"></div>
          </motion.div>

          {/* Parte de trás (tela interna) */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl border-8 border-slate-700"
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <div className="p-8 h-full flex flex-col items-center justify-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: stage === 'open' ? 1 : 0 }}
                transition={{ delay: 1.8 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 animate-pulse"></div>
                <p className="text-green-400 text-lg font-semibold">Sistema Iniciado</p>
                <p className="text-slate-400 text-sm mt-2">Bem-vindo, Treinador!</p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Texto de loading */}
        <AnimatePresence>
          {stage === 'opening' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 text-center w-full"
            >
              <p className="text-white text-xl font-semibold">Abrindo Pokédex...</p>
              <div className="flex justify-center gap-2 mt-3">
                <motion.div
                  className="w-3 h-3 bg-white rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-3 h-3 bg-white rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-3 h-3 bg-white rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default PokedexAnimation;