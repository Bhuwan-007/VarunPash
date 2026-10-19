import React, { useEffect, useState, useRef } from 'react';
import { CINEMATICS, CinematicDef } from '../data/cinematics';
import { MANGA_CUTSCENES } from '../data/mangaIntro';
import { useUIStore } from '../store/uiStore';
import { MangaPage } from './MangaPage';

export const CutscenePlayer: React.FC = () => {
  const activeCutscene = useUIStore((s) => s.activeCutscene);
  const closeCutscene = useUIStore((s) => s.closeCutscene);

  if (activeCutscene && MANGA_CUTSCENES[activeCutscene.id]) {
    return (
      <MangaPage
        cutsceneId={activeCutscene.id}
        onComplete={() => {
          closeCutscene();
        }}
      />
    );
  }

  const [panelIndex, setPanelIndex] = useState<number>(0);
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const [imageError, setImageError] = useState<boolean>(false);

  const activeCutsceneRef = useRef(activeCutscene);
  activeCutsceneRef.current = activeCutscene;
  const mountTimeRef = useRef<number>(Date.now());

  // Reset when cutscene changes
  useEffect(() => {
    if (activeCutscene) {
      setPanelIndex(0);
      setImageError(false);
      mountTimeRef.current = Date.now();
    }
  }, [activeCutscene?.id]);

  const def: CinematicDef | undefined = activeCutscene ? CINEMATICS[activeCutscene.id] : undefined;
  const isEndCard = def ? panelIndex >= def.panels.length : false;
  const currentPanel = def && !isEndCard ? def.panels[panelIndex] : null;
  const fullCaption = currentPanel ? currentPanel.caption : '';

  // Typewriter effect for panel caption
  useEffect(() => {
    if (!activeCutscene || !def || isEndCard || !currentPanel) {
      return;
    }

    setDisplayedText('');
    setIsTyping(true);
    setImageError(false);

    let charIdx = 0;
    const text = fullCaption;
    const interval = setInterval(() => {
      charIdx++;
      setDisplayedText(text.slice(0, charIdx));
      if (charIdx >= text.length) {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 28);

    return () => clearInterval(interval);
  }, [panelIndex, activeCutscene?.id, isEndCard]);

  // Handle advancing & skipping
  const handleAdvance = () => {
    // 250ms grace period on mount prevents accidental skip from holding interaction keys
    if (Date.now() - mountTimeRef.current < 250) {
      return;
    }

    if (!def) {
      closeCutscene();
      return;
    }

    if (isEndCard) {
      closeCutscene();
      return;
    }

    if (isTyping) {
      // Complete typewriter immediately
      setDisplayedText(fullCaption);
      setIsTyping(false);
    } else {
      // Advance to next panel or end card
      setPanelIndex((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (!activeCutscene) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        closeCutscene();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        e.stopPropagation();
        handleAdvance();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [activeCutscene, isTyping, fullCaption, isEndCard, def]);

  if (!activeCutscene || !def) {
    return null;
  }

  // End card render
  if (isEndCard) {
    return (
      <div
        onClick={handleAdvance}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: '#05070a',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          userSelect: 'none',
          padding: '40px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            fontFamily: "'IM Fell English SC', serif",
            fontSize: '48px',
            color: '#e6ded3',
            letterSpacing: '6px',
            textAlign: 'center',
            textShadow: '0 0 25px rgba(242, 165, 65, 0.4)',
            marginBottom: '32px',
          }}
        >
          {def.endCard || def.title}
        </div>
        <div
          style={{
            fontFamily: "'Special Elite', monospace",
            fontSize: '14px',
            color: '#8b97a3',
            letterSpacing: '2px',
            animation: 'pulse 2s infinite',
          }}
        >
          [Press SPACE to continue]
        </div>
      </div>
    );
  }

  // Standard panel render
  return (
    <div
      onClick={handleAdvance}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#05070a',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        padding: '30px',
        boxSizing: 'border-box',
      }}
    >
      {/* Optional image display */}
      {currentPanel?.image && !imageError && (
        <div
          style={{
            maxWidth: '640px',
            maxHeight: '440px',
            marginBottom: '32px',
            borderRadius: '4px',
            overflow: 'hidden',
            boxShadow: '0 0 30px rgba(0,0,0,0.8)',
            border: '1px solid rgba(242, 165, 65, 0.2)',
          }}
        >
          <img
            src={`${import.meta.env.BASE_URL}assets/cinematics/${currentPanel.image}`}
            alt=""
            onError={() => setImageError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>
      )}

      {/* Caption with typewriter font */}
      <div
        style={{
          maxWidth: '720px',
          minHeight: '80px',
          fontFamily: "'IM Fell English SC', serif",
          fontSize: '28px',
          lineHeight: '1.5',
          color: '#e6ded3',
          textAlign: 'center',
          letterSpacing: '2px',
          textShadow: '0 0 15px rgba(0,0,0,0.9)',
          padding: '0 20px',
        }}
      >
        {displayedText}
        {isTyping && <span style={{ opacity: 0.7, marginLeft: '4px' }}>|</span>}
      </div>

      {/* Footer controls hint */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          display: 'flex',
          gap: '24px',
          fontFamily: "'Special Elite', monospace",
          fontSize: '13px',
          color: '#55606d',
          letterSpacing: '1px',
        }}
      >
        <span>[SPACE] Next</span>
        <span>[ESC] Skip</span>
      </div>
    </div>
  );
};
