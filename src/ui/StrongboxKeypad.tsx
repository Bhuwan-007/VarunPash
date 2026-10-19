import React, { useEffect, useState } from 'react';
import { PALETTE } from '../config';
import { addDirectJournalEntry } from '../game/systems/knowledge';
import { useLoopStore } from '../store/loopStore';
import { useUIStore } from '../store/uiStore';

export const StrongboxKeypad: React.FC = () => {
  const isOpen = useUIStore((s) => s.strongboxKeypadOpen);
  const closeKeypad = useUIStore((s) => s.closeStrongboxKeypad);

  const strongboxOpened = useLoopStore((s) => s.strongboxOpened);
  const strongboxJammed = useLoopStore((s) => s.strongboxJammed);
  const wrongAttempts = useLoopStore((s) => s.strongboxWrongAttempts);

  const [digits, setDigits] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDigits('');
      setErrorMessage(null);
    }
  }, [isOpen]);

  const handleDigit = (digit: string) => {
    if (strongboxOpened || strongboxJammed) return;
    if (digits.length < 3) {
      setDigits((prev) => prev + digit);
      setErrorMessage(null);
    }
  };

  const handleClear = () => {
    setDigits('');
    setErrorMessage(null);
  };

  const handleSubmit = () => {
    if (digits.length < 3) {
      setErrorMessage('Enter 3 digits.');
      return;
    }

    if (digits === '731') {
      // Success!
      const loopStore = useLoopStore.getState();
      loopStore.openStrongbox();
      loopStore.addItem('Helm Key');
      loopStore.addItem('Armory Key');

      addDirectJournalEntry({
        id: 'clue_strongbox_second_locket',
        tab: 'Clues',
        title: 'A Second Locket',
        text: 'A second locket in the strongbox, engraved the same as the one on the deck. Both cannot be real.',
      });

      closeKeypad();
    } else {
      // Failed attempt
      const loopStore = useLoopStore.getState();
      const isJammed = loopStore.recordWrongStrongboxAttempt();
      setDigits('');
      if (isJammed) {
        setErrorMessage('Mechanism jammed! The tumblers are locked for this loop.');
        setTimeout(() => {
          closeKeypad();
        }, 1200);
      } else {
        const remaining = 3 - (loopStore.strongboxWrongAttempts);
        setErrorMessage(`Incorrect combination (${remaining} ${remaining === 1 ? 'try' : 'tries'} left)`);
      }
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        setDigits((prev) => prev.slice(0, -1));
        setErrorMessage(null);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeKeypad();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, digits, strongboxOpened, strongboxJammed]);

  if (!isOpen) return null;

  return (
    <div
      onClick={closeKeypad}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(7, 9, 15, 0.88)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 55,
        userSelect: 'none',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '380px',
          backgroundColor: '#0c1622',
          border: `2px solid ${PALETTE.Lantern}`,
          borderRadius: '8px',
          boxShadow: '0 0 40px rgba(0, 0, 0, 0.95), inset 0 0 20px rgba(18, 48, 61, 0.4)',
          color: PALETTE.Bone,
          fontFamily: "'Special Elite', monospace, sans-serif",
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: PALETTE.Ash, letterSpacing: '2px', textTransform: 'uppercase' }}>
            BRASS COMBINATION LOCK
          </div>
          <div
            style={{
              fontSize: '22px',
              fontFamily: "'IM Fell English SC', serif, monospace",
              fontWeight: 'bold',
              color: PALETTE.Lantern,
              letterSpacing: '2px',
            }}
          >
            QUARTERMASTER'S STRONGBOX
          </div>
        </div>

        {/* Status / readout */}
        {strongboxOpened ? (
          <div style={{ color: PALETTE.TideGlow, fontSize: '15px', textAlign: 'center', margin: '20px 0' }}>
            ✓ The strongbox has been unlocked and emptied.
          </div>
        ) : strongboxJammed ? (
          <div style={{ color: PALETTE.BloodRust, fontSize: '14px', textAlign: 'center', margin: '20px 0' }}>
            ⚠ Mechanism jammed. It will not turn again this loop.
          </div>
        ) : (
          <>
            {/* Display digits */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                margin: '8px 0',
              }}
            >
              {[0, 1, 2].map((idx) => {
                const char = digits[idx] ?? '';
                return (
                  <div
                    key={idx}
                    style={{
                      width: '56px',
                      height: '64px',
                      backgroundColor: 'rgba(7, 9, 15, 0.9)',
                      border: `2px solid ${char ? PALETTE.Lantern : PALETTE.Deepwater}`,
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '32px',
                      fontFamily: 'monospace',
                      fontWeight: 'bold',
                      color: PALETTE.Bone,
                      boxShadow: char ? `0 0 10px rgba(229, 169, 59, 0.3)` : 'none',
                    }}
                  >
                    {char || '·'}
                  </div>
                );
              })}
            </div>

            {/* Error or hint */}
            <div
              style={{
                minHeight: '20px',
                fontSize: '12px',
                color: errorMessage ? PALETTE.BloodRust : PALETTE.Ash,
                textAlign: 'center',
              }}
            >
              {errorMessage || 'Three wrong tries jam it for this loop.'}
            </div>

            {/* Keypad 3x4 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                width: '100%',
                maxWidth: '240px',
              }}
            >
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
                <button
                  key={d}
                  onClick={() => handleDigit(d)}
                  style={{
                    padding: '12px',
                    fontSize: '18px',
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(18, 48, 61, 0.6)',
                    border: '1px solid #1a4253',
                    borderRadius: '4px',
                    color: PALETTE.Bone,
                    cursor: 'pointer',
                  }}
                >
                  {d}
                </button>
              ))}
              <button
                onClick={handleClear}
                style={{
                  padding: '12px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  backgroundColor: 'rgba(178, 58, 58, 0.2)',
                  border: `1px solid ${PALETTE.BloodRust}`,
                  borderRadius: '4px',
                  color: PALETTE.Bone,
                  cursor: 'pointer',
                }}
              >
                CLR
              </button>
              <button
                onClick={() => handleDigit('0')}
                style={{
                  padding: '12px',
                  fontSize: '18px',
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(18, 48, 61, 0.6)',
                  border: '1px solid #1a4253',
                  borderRadius: '4px',
                  color: PALETTE.Bone,
                  cursor: 'pointer',
                }}
              >
                0
              </button>
              <button
                onClick={handleSubmit}
                style={{
                  padding: '12px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(95, 211, 196, 0.2)',
                  border: `1px solid ${PALETTE.TideGlow}`,
                  borderRadius: '4px',
                  color: PALETTE.TideGlow,
                  cursor: 'pointer',
                }}
              >
                OPEN
              </button>
            </div>
          </>
        )}

        {/* Close Button */}
        <button
          onClick={closeKeypad}
          style={{
            marginTop: '8px',
            backgroundColor: 'transparent',
            border: `1px solid ${PALETTE.Deepwater}`,
            borderRadius: '4px',
            padding: '6px 16px',
            color: PALETTE.Ash,
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          [ESC] Step Away
        </button>
      </div>
    </div>
  );
};
