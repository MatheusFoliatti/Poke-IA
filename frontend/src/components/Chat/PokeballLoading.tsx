import React, { useEffect, useRef } from 'react';
import './PokeballLoading.css';
import spriteUrl from '../../assets/pokeball_sprite.png';

interface PokeballLoadingProps {
  status: 'loading' | 'success' | 'error';
}

const FRAME_COUNT  = 34;
const FRAME_MS     = 30;       // 30ms por frame, fiel ao GIF original
const SPRITE_SIZE  = 160;      // cada frame no sprite tem 160×160px
const CANVAS_SIZE  = 80;       // tamanho de exibição no canvas

// Raio do botão branco central (em px no canvas de 80px)
// Sprite 160px → canvas 80px: fator 0.5
// Botão branco: r≈16 no sprite → r=8 no canvas
// Anel preto ao redor: r≈11 no canvas — NÃO pintamos além disso
const BTN_RADIUS = 8;

const PokeballLoading: React.FC<PokeballLoadingProps> = ({ status }) => {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const rafRef     = useRef<number>(0);
  const frameRef   = useRef<number>(0);
  const lastRef    = useRef<number>(0);
  const statusRef  = useRef(status);
  const spriteRef  = useRef<HTMLImageElement | null>(null);

  useEffect(() => { statusRef.current = status; }, [status]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width  = CANVAS_SIZE * dpr;
    canvas.height = CANVAS_SIZE * dpr;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    const cx = CANVAS_SIZE / 2;
    const cy = CANVAS_SIZE / 2;

    // Carrega spritesheet
    const img = new Image();
    img.src = spriteUrl;
    spriteRef.current = img;

    function render(now: number) {
      const dt = now - lastRef.current;

      // Avança frame a cada FRAME_MS ms
      if (dt >= FRAME_MS) {
        lastRef.current = now - (dt % FRAME_MS);
        if (statusRef.current === 'loading') {
          frameRef.current = (frameRef.current + 1) % FRAME_COUNT;
        } else {
          frameRef.current = 0; // trava no frame 0 quando parado
        }
      }

      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      if (!spriteRef.current?.complete) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      const frame = frameRef.current;

      // Desenha frame do sprite (com fundo já transparente)
      ctx.drawImage(
        spriteRef.current,
        frame * SPRITE_SIZE, 0,   // posição no sprite
        SPRITE_SIZE, SPRITE_SIZE, // tamanho fonte
        0, 0,                     // posição no canvas
        CANVAS_SIZE, CANVAS_SIZE, // tamanho destino
      );

      // Pinta APENAS o botão central com a cor de status
      const st = statusRef.current;
      if (st === 'success' || st === 'error') {
        const color = st === 'success' ? '#22c55e' : '#ef4444';

        // Usa composite 'source-atop' para pintar só onde já tem pixels
        // Mas queremos pintar apenas no círculo central — usamos clip
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, BTN_RADIUS, 0, Math.PI * 2);
        ctx.clip();

        // Preenche com cor sólida dentro do clip
        ctx.fillStyle = color;
        ctx.fill();

        // Glow suave
        ctx.shadowColor = color;
        ctx.shadowBlur  = 8;
        ctx.fill();

        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(render);
    }

    lastRef.current = performance.now();
    rafRef.current  = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const labelColor =
    status === 'success' ? '#22c55e' :
    status === 'error'   ? '#ef4444' : '#9ca3af';

  const label =
    status === 'loading' ? 'Pensando...' :
    status === 'success' ? 'Pronto!'     : 'Erro...';

  return (
    <div className="pokeball-wrapper">
      <div className={`pokeball-canvas-wrap ${status}`}>
        <canvas
          ref={canvasRef}
          style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
        />
      </div>
      <span className="pokeball-label" style={{ color: labelColor }}>
        {label}
      </span>
    </div>
  );
};

export default PokeballLoading;