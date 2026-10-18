import React from 'react';
import { PALETTE } from '../config';
import { INITIAL_CLUES_ENTRY } from '../data/journalEntries';
import { addDirectJournalEntry } from '../game/systems/knowledge';
import { useLoopStore } from '../store/loopStore';
import { useMemoryStore } from '../store/memoryStore';
import { useUIStore } from '../store/uiStore';

export const TitleScreen: React.FC = () => {
  const setGameScreen = useUIStore((s) => s.setGameScreen);
  const deathCount = useMemoryStore((s) => s.deathCount);
  const knowledge = useMemoryStore((s) => s.knowledge);
  const journal = useMemoryStore((s) => s.journal);

  const hasSave = deathCount > 0 || knowledge.length > 0 || journal.length > 0;

  const handleNewGame = () => {
    // Reset loop & memory
    useMemoryStore.getState().newGame();
    useLoopStore.getState().reset();

    // First Clues entry in player's voice (Prompt Issue 6)
    addDirectJournalEntry({
      id: INITIAL_CLUES_ENTRY.id,
      tab: INITIAL_CLUES_ENTRY.tab,
      title: INITIAL_CLUES_ENTRY.title,
      text: INITIAL_CLUES_ENTRY.text,
    });

    // Play opening cutscene on New Game only
    setGameScreen('intro');
  };

  const handleContinue = () => {
    setGameScreen('game');
  };

  return (
    <div
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
        zIndex: 60,
        color: PALETTE.Bone,
        userSelect: 'none',
        backgroundImage: 'radial-gradient(ellipse at center, #12303d 0%, #07090f 75%)',
      }}
    >
      {/* Decorative Frame */}
      <div
        style={{
          border: '2px solid rgba(242, 165, 65, 0.4)',
          borderRadius: '8px',
          padding: '48px 64px',
          backgroundColor: 'rgba(11, 19, 32, 0.85)',
          boxShadow: '0 0 60px rgba(0, 0, 0, 0.9), inset 0 0 30px rgba(18, 48, 61, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: '560px',
          width: '90%',
          textAlign: 'center',
        }}
      >
        {/* Title */}
        <h1
          style={{
            margin: 0,
            fontSize: '56px',
            letterSpacing: '8px',
            color: PALETTE.Bone,
            fontFamily: "'IM Fell English SC', serif, monospace",
            textShadow: '0 0 20px rgba(242, 165, 65, 0.35)',
          }}
        >
          VARUNPASH
        </h1>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '18px',
            color: PALETTE.Lantern,
            fontStyle: 'italic',
            letterSpacing: '3px',
            margin: '12px 0 36px 0',
            fontFamily: "'Special Elite', monospace",
          }}
        >
          A Tale of Ink & Brine
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          <button
            onClick={handleNewGame}
            style={{
              padding: '14px 28px',
              backgroundColor: PALETTE.Lantern,
              color: '#07090f',
              border: '2px solid #5a4430',
              borderRadius: '4px',
              fontFamily: "'Special Elite', monospace",
              fontSize: '20px',
              fontWeight: 'bold',
              letterSpacing: '2px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 4px 14px rgba(242, 165, 65, 0.35)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
          >
            NEW GAME
          </button>

          <button
            onClick={handleContinue}
            disabled={!hasSave}
            style={{
              padding: '14px 28px',
              backgroundColor: hasSave ? '#12303d' : '#1a1f26',
              color: hasSave ? PALETTE.Bone : '#55606d',
              border: `2px solid ${hasSave ? PALETTE.TideGlow : '#2b333d'}`,
              borderRadius: '4px',
              fontFamily: "'Special Elite', monospace",
              fontSize: '20px',
              fontWeight: 'bold',
              letterSpacing: '2px',
              cursor: hasSave ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s ease',
              boxShadow: hasSave ? '0 4px 14px rgba(95, 211, 196, 0.25)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (hasSave) e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              if (hasSave) e.currentTarget.style.transform = 'scale(1.0)';
            }}
          >
            CONTINUE
          </button>
        </div>

        {/* Small loop save footer */}
        {hasSave && (
          <div
            style={{
              marginTop: '24px',
              fontSize: '13px',
              color: PALETTE.Ash,
              fontFamily: 'monospace',
            }}
          >
            Saved Record: Loop {deathCount + 1} • {knowledge.length} Secrets Known
          </div>
        )}
      </div>
    </div>
  );
};
