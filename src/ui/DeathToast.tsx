import React, { useEffect } from 'react';
import { CONFIG, PALETTE } from '../config';
import { getNextLead } from '../data/journalEntries';
import { useMemoryStore } from '../store/memoryStore';
import { useUIStore } from '../store/uiStore';

interface DeathToastProps {
  onRespawn: () => void;
}

export const DeathToast: React.FC<DeathToastProps> = ({ onRespawn }) => {
  const deathToast = useUIStore((s) => s.deathToast);
  const deathCount = useMemoryStore((s) => s.deathCount);

  useEffect(() => {
    if (!deathToast?.visible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onRespawn();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deathToast, onRespawn]);

  if (!deathToast || !deathToast.visible) return null;

  const isDrownedLoop = deathCount >= CONFIG.MAX_DEATHS;
  const respawnShiftSec = Math.min(deathCount * CONFIG.RESPAWN_SHIFT, CONFIG.TIMELINE);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(7, 9, 15, 0.94)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 50,
        fontFamily: 'monospace',
        padding: '24px',
        animation: 'fadeIn 0.3s ease',
      }}
    >
      <div
        style={{
          maxWidth: '680px',
          width: '100%',
          backgroundColor: '#0b1320',
          border: `2px solid ${deathToast.strategic ? PALETTE.TideGlow : PALETTE.BloodRust}`,
          borderRadius: '6px',
          padding: '36px 48px',
          textAlign: 'center',
          boxShadow: `0 0 35px ${deathToast.strategic ? 'rgba(95, 211, 196, 0.25)' : 'rgba(178, 58, 58, 0.25)'}`,
        }}
      >
        {/* Main Title */}
        <h2
          style={{
            fontSize: '32px',
            color: PALETTE.Bone,
            margin: '0 0 16px 0',
            letterSpacing: '2px',
          }}
        >
          {isDrownedLoop ? 'THE 20TH TIDE SINKING' : 'The tide takes you.'}
        </h2>

        {/* Cause */}
        <div style={{ fontSize: '14px', color: PALETTE.Ash, marginBottom: '24px' }}>
          Cause: <span style={{ color: PALETTE.Bone }}>{deathToast.cause}</span>
        </div>

        {/* Strategic vs Wasted Message */}
        <div
          style={{
            fontSize: '18px',
            lineHeight: '1.6',
            padding: '16px 20px',
            backgroundColor: 'rgba(7, 9, 15, 0.75)',
            border: `1px dashed ${deathToast.strategic ? PALETTE.TideGlow : PALETTE.BloodRust}`,
            borderRadius: '4px',
            marginBottom: '28px',
          }}
        >
          {deathToast.strategic ? (
            <div style={{ color: PALETTE.TideGlow }}>
              <div style={{ fontSize: '13px', textTransform: 'uppercase', marginBottom: '6px', color: PALETTE.Ash }}>
                [ STRATEGIC DEATH - MEMORY GAINED ]
              </div>
              <div>"{deathToast.remembered ?? 'You remember the whisper of the tide.'}"</div>
            </div>
          ) : (
            <div style={{ color: PALETTE.BloodRust }}>
              <div style={{ fontSize: '13px', textTransform: 'uppercase', marginBottom: '6px', color: PALETTE.Ash }}>
                [ WASTED DEATH ]
              </div>
              <div>Nothing remembered. 30 seconds of the tide lost.</div>
            </div>
          )}
        </div>

        {/* Dynamic Next Lead under death toast */}
        {(() => {
          const knowledge = useMemoryStore.getState().knowledge;
          const lead = getNextLead(knowledge);
          return (
            <div
              style={{
                fontSize: '14px',
                color: PALETTE.Lantern,
                marginBottom: '20px',
                padding: '8px 14px',
                backgroundColor: 'rgba(242, 165, 65, 0.08)',
                border: '1px solid rgba(242, 165, 65, 0.3)',
                borderRadius: '4px',
                fontStyle: 'italic',
              }}
            >
              <span style={{ fontWeight: 'bold', color: PALETTE.Bone, fontStyle: 'normal' }}>
                {lead.title}:{' '}
              </span>
              "{lead.hint}"
            </div>
          );
        })()}

        {/* Respawn Shift Stats */}
        <div style={{ fontSize: '13px', color: PALETTE.Ash, marginBottom: '32px' }}>
          {isDrownedLoop ? (
            <span style={{ color: PALETTE.BloodRust, fontWeight: 'bold' }}>
              The tide has completely run out. The sea claims the Jal-Doot.
            </span>
          ) : (
            <span>
              Next loop begins 30 seconds later: <strong style={{ color: PALETTE.Lantern }}>T+{respawnShiftSec}s</strong> (
              {CONFIG.TIMELINE - respawnShiftSec}s remaining of the tide)
            </span>
          )}
        </div>

        {/* Respawn Button */}
        <button
          onClick={onRespawn}
          style={{
            padding: '12px 32px',
            backgroundColor: deathToast.strategic ? PALETTE.TideGlow : PALETTE.Lantern,
            color: PALETTE.Tar,
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: 'bold',
            letterSpacing: '1px',
            cursor: 'pointer',
            transition: 'transform 0.1s ease, filter 0.1s ease',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.filter = 'brightness(1.15)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.filter = 'brightness(1)')}
        >
          AWAKEN TO THE TIDE (Space)
        </button>
      </div>
    </div>
  );
};
