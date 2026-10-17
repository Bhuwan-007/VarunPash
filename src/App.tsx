import React, { useEffect, useRef } from 'react';
import { CONFIG } from './config';
import { GameEngine } from './game/engine';
import { GameRenderer } from './game/renderer';

export const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create the dedicated read-only renderer
    const renderer = new GameRenderer(ctx);

    // Create and start the game engine (fixed timestep 60Hz loop)
    const engine = new GameEngine();

    // The renderer only reads state passed from engine and never modifies it
    engine.setRenderCallback((readonlyState) => {
      renderer.render(readonlyState);
    });

    engine.start();

    return () => {
      engine.dispose();
    };
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100vw',
        height: '100vh',
        backgroundColor: '#07090f',
      }}
    >
      <canvas
        ref={canvasRef}
        width={CONFIG.CANVAS_WIDTH}
        height={CONFIG.CANVAS_HEIGHT}
        style={{
          width: 'min(100vw, 1280px)',
          aspectRatio: '16/9',
          boxShadow: '0 0 30px rgba(0, 0, 0, 0.8)',
          border: '1px solid #12303d',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
};

export default App;
