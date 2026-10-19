import React, { useEffect, useRef } from 'react';
import { CONFIG } from './config';
import { GameEngine } from './game/engine';
import { GameRenderer } from './game/renderer';
import { useLoopStore } from './store/loopStore';
import { DeathToast } from './ui/DeathToast';
import { DebugPanel } from './ui/DebugPanel';
import { DialogueBox } from './ui/DialogueBox';
import { Hud } from './ui/Hud';
import { IntroCutscene } from './ui/IntroCutscene';
import { Journal } from './ui/Journal';
import { RoleCard } from './ui/RoleCard';
import { StrongboxKeypad } from './ui/StrongboxKeypad';
import { TitleScreen } from './ui/TitleScreen';
import { CutscenePlayer } from './ui/CutscenePlayer';
import { useUIStore } from './store/uiStore';

export const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const gameScreen = useUIStore((s) => s.gameScreen);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dedicated read-only renderer
    const renderer = new GameRenderer(ctx);

    // Fixed timestep 60Hz loop engine
    const engine = new GameEngine();
    engineRef.current = engine;

    // Renderer strictly reads state without modifying it
    engine.setRenderCallback((readonlyState) => {
      renderer.render(readonlyState);
    });

    engine.start();

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  const handleRespawn = () => {
    if (engineRef.current) {
      engineRef.current.loopManager.respawn();
    }
  };

  const handleDebugKill = (cause: string, strategic: boolean = false, clueText?: string) => {
    if (engineRef.current) {
      if (strategic) {
        useLoopStore.getState().markLearned(clueText ?? 'A cryptic whisper in the dark.');
      }
      engineRef.current.loopManager.handleDeath(cause);
    }
  };

  const handleRestartLoop = () => {
    if (engineRef.current) {
      engineRef.current.loopManager.restartLoop();
    }
  };

  const handleFullReset = () => {
    if (engineRef.current) {
      engineRef.current.loopManager.fullResetGame();
    }
  };

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
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 1280x720 Game Viewport Container */}
      <div
        style={{
          position: 'relative',
          width: 'min(100vw, 1280px)',
          aspectRatio: '16/9',
          boxShadow: '0 0 35px rgba(0, 0, 0, 0.85)',
          border: '1px solid #12303d',
          overflow: 'hidden',
        }}
      >
        {/* Game World Canvas 2D */}
        <canvas
          ref={canvasRef}
          width={CONFIG.CANVAS_WIDTH}
          height={CONFIG.CANVAS_HEIGHT}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            imageRendering: 'pixelated',
          }}
        />

        {/* HUD React DOM Overlay */}
        <Hud />

        {/* Dialogue Box Overlay */}
        <DialogueBox />

        {/* Journal Open-Book Overlay */}
        <Journal />

        {/* Death Toast Overlay */}
        <DeathToast onRespawn={handleRespawn} />

        {/* Title Screen Overlay */}
        {gameScreen === 'title' && <TitleScreen />}

        {/* Text-only Opening Cutscene Overlay */}
        {gameScreen === 'intro' && <IntroCutscene />}

        {/* One-time Role Card Modal */}
        <RoleCard />

        {/* Strongbox 3-Digit Keypad Overlay */}
        <StrongboxKeypad />

        {/* Cinematic Cutscene Player Overlay */}
        <CutscenePlayer />

        {/* Dev Debug Panel - Only present during development, stripped in itch.io production build */}
        {import.meta.env.DEV && (
          <DebugPanel
            onKillPlayer={handleDebugKill}
            onRestartLoop={handleRestartLoop}
            onFullReset={handleFullReset}
          />
        )}
      </div>
    </div>
  );
};


export default App;
