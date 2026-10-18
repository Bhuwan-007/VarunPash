import React, { useEffect, useState } from 'react';
import { PALETTE } from '../config';
import { useUIStore } from '../store/uiStore';

const INTRO_CAPTIONS = [
  'The Jal-Doot left port with a full hold and a crew that never said where they were going.',
  'Past the last chart, the tide stopped moving. Then it began to run backwards.',
  'In the hold, something that had no business aboard began to hum.',
  'You were nobody important. That is why you were awake.',
  'At the sixth bell, the sea stood up.',
  'Then: the deck again. The same gull. The same locket. The same sky.',
];

export const IntroCutscene: React.FC = () => {
  const setGameScreen = useUIStore((s) => s.setGameScreen);
  const [panelIndex, setPanelIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const fullCaption = INTRO_CAPTIONS[panelIndex];

  // Typewriter effect
  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    let charIdx = 0;

    const interval = setInterval(() => {
      charIdx++;
      if (charIdx <= fullCaption.length) {
        setDisplayedText(fullCaption.slice(0, charIdx));
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 28);

    return () => clearInterval(interval);
  }, [panelIndex, fullCaption]);

  const advance = () => {
    if (isTyping) {
      // Complete typewriter immediately
      setDisplayedText(fullCaption);
      setIsTyping(false);
    } else {
      // Advance to next panel or finish
      if (panelIndex < INTRO_CAPTIONS.length - 1) {
        setPanelIndex((prev) => prev + 1);
      } else {
        setGameScreen('game');
      }
    }
  };

  // Keyboard navigation: Space or Enter skips/advances
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        advance();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div
      onClick={advance}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#07090f',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 65,
        color: PALETTE.Bone,
        padding: '0 60px',
        userSelect: 'none',
        cursor: 'pointer',
      }}
    >
      {/* Chapter Indicator */}
      <div
        style={{
          position: 'absolute',
          top: '36px',
          fontSize: '14px',
          letterSpacing: '3px',
          color: PALETTE.Lantern,
          textTransform: 'uppercase',
          fontFamily: 'monospace',
        }}
      >
        PROLOGUE • {panelIndex + 1} / {INTRO_CAPTIONS.length}
      </div>

      {/* Typewriter Caption */}
      <div
        style={{
          maxWidth: '820px',
          fontSize: '28px',
          lineHeight: '1.6',
          fontFamily: "'IM Fell English SC', serif, monospace",
          textAlign: 'center',
          letterSpacing: '1.5px',
          minHeight: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: PALETTE.Bone,
        }}
      >
        "{displayedText}
        {isTyping && <span style={{ opacity: 0.8, color: PALETTE.Lantern }}>|</span>}"
      </div>

      {/* Skip / Advance Prompt */}
      <div
        style={{
          position: 'absolute',
          bottom: '36px',
          fontSize: '13px',
          letterSpacing: '2px',
          color: PALETTE.Ash,
          fontFamily: 'monospace',
        }}
      >
        [ SPACE ] {isTyping ? 'Skip' : panelIndex === INTRO_CAPTIONS.length - 1 ? 'Begin' : 'Next'}
      </div>
    </div>
  );
};
