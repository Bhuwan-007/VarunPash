import React from 'react';
import { CONFIG, PALETTE } from '../config';
import { useLoopStore } from '../store/loopStore';
import { useMemoryStore } from '../store/memoryStore';
import { useUIStore } from '../store/uiStore';

function toRoman(num: number): string {
  if (num <= 0) return 'I';
  const lookup: [number, string][] = [
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let roman = '';
  let n = num;
  for (const [val, sym] of lookup) {
    while (n >= val) {
      roman += sym;
      n -= val;
    }
  }
  return roman;
}

export const Hud: React.FC = () => {
  const shipTime = useLoopStore((s) => s.shipTime);
  const timeScale = useLoopStore((s) => s.timeScale);
  const deathCount = useMemoryStore((s) => s.deathCount);
  const playerRole = useMemoryStore((s) => s.playerRole);
  const knowledge = useMemoryStore((s) => s.knowledge);
  const journalPulse = useUIStore((s) => s.journalPulse);
  const toggleJournal = useUIStore((s) => s.toggleJournal);

  const inventory = useLoopStore((s) => s.inventory);
  const coins = useLoopStore((s) => s.coins);

  const hasGullOmen = knowledge.includes('K_OMEN_GULL');
  const showGullOmen = hasGullOmen && shipTime >= 345 && shipTime <= 360;

  const remainingSeconds = Math.max(0, Math.floor(CONFIG.TIMELINE - shipTime));
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const currentLoopNumber = deathCount + 1;

  // Render tally scratches in clusters of 5 without revealing any cap or total
  const fullClusters = Math.floor(deathCount / 5);
  const remainderMarks = deathCount % 5;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        padding: '18px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        fontFamily: 'monospace',
      }}
    >
      {/* Top Left: Loop Number, Countdown & Inventory Strip */}
      <div
        style={{
          backgroundColor: 'rgba(7, 9, 15, 0.88)',
          border: `2px solid ${PALETTE.Deepwater}`,
          padding: '10px 16px',
          borderRadius: '4px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: PALETTE.Bone,
              letterSpacing: '1px',
            }}
          >
            LOOP {toRoman(currentLoopNumber)}
          </span>
          <span
            style={{
              fontSize: '12px',
              padding: '2px 6px',
              backgroundColor: PALETTE.Deepwater,
              color: PALETTE.TideGlow,
              borderRadius: '2px',
              textTransform: 'uppercase',
            }}
          >
            {playerRole ?? 'Deckhand'}
          </span>
          {timeScale > 1 && (
            <span style={{ fontSize: '11px', color: PALETTE.Lantern, fontWeight: 'bold' }}>
              [{timeScale}x SPEED]
            </span>
          )}
        </div>

        <div style={{ marginTop: '4px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: remainingSeconds <= 60 ? PALETTE.BloodRust : PALETTE.Lantern,
              letterSpacing: '2px',
            }}
          >
            {timeFormatted}
          </span>
          <span style={{ fontSize: '12px', color: PALETTE.Ash }}>UNTIL SINKING</span>
        </div>

        {/* Flapping Gull Omen HUD Indicator (345s - 360s with K_OMEN_GULL) */}
        {showGullOmen && (
          <div
            style={{
              marginTop: '6px',
              padding: '4px 8px',
              backgroundColor: 'rgba(178, 58, 58, 0.22)',
              border: `1px solid ${PALETTE.BloodRust}`,
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title="The gull cries three times before the knives come (T-4:05)"
          >
            <span
              style={{
                display: 'inline-block',
                fontSize: '14px',
                animation: 'gullFlap 0.35s infinite alternate ease-in-out',
              }}
            >
              🕊️
            </span>
            <span
              style={{
                fontSize: '11px',
                color: PALETTE.BloodRust,
                fontWeight: 'bold',
                letterSpacing: '0.5px',
              }}
            >
              GULL OMEN (T-4:05)
            </span>
            <style>
              {`@keyframes gullFlap {
                0% { transform: translateY(0px) scaleY(1); }
                50% { transform: translateY(-2px) scaleY(0.75); }
                100% { transform: translateY(1px) scaleY(1.1); }
              }`}
            </style>
          </div>
        )}

        {/* Inventory Strip */}
        <div
          style={{
            marginTop: '8px',
            paddingTop: '8px',
            borderTop: '1px solid rgba(229, 169, 59, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexWrap: 'wrap',
          }}
        >
          {/* Coin Counter */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 6px',
              backgroundColor: 'rgba(11, 19, 32, 0.9)',
              border: `1px solid ${coins > 0 ? PALETTE.Lantern : '#223843'}`,
              borderRadius: '3px',
              fontSize: '11px',
              color: coins > 0 ? PALETTE.Lantern : PALETTE.Ash,
              fontWeight: 'bold',
            }}
            title={`${coins} Silver Coins`}
          >
            <span>🪙</span>
            <span>{coins}</span>
          </div>

          {/* Item Pills */}
          {inventory.map((item, idx) => (
            <div
              key={`${item}-${idx}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 6px',
                backgroundColor: 'rgba(11, 19, 32, 0.9)',
                border: '1px solid #1a4253',
                borderRadius: '3px',
                fontSize: '10px',
                color: PALETTE.Bone,
              }}
              title={item}
            >
              <span>{item.includes('Key') ? '🗝️' : item === 'Map' ? '🗺️' : '📦'}</span>
              <span>{item}</span>
            </div>
          ))}

          {inventory.length === 0 && coins === 0 && (
            <span style={{ fontSize: '10px', color: PALETTE.Ash, fontStyle: 'italic' }}>
              No carried items
            </span>
          )}
        </div>
      </div>

      {/* Top Center: Journal Hint & Pulse Indicator */}
      <div
        onClick={toggleJournal}
        style={{
          pointerEvents: 'auto',
          cursor: 'pointer',
          backgroundColor: 'rgba(7, 9, 15, 0.92)',
          border: `2px solid ${journalPulse ? PALETTE.TideGlow : PALETTE.Deepwater}`,
          padding: '9px 16px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: journalPulse
            ? `0 0 20px ${PALETTE.TideGlow}`
            : '0 4px 12px rgba(0,0,0,0.5)',
          transition: 'all 0.2s ease',
          transform: journalPulse ? 'scale(1.05)' : 'scale(1)',
        }}
        title="Open Journal (J)"
      >
        <span style={{ fontSize: '16px' }}>📖</span>
        <span
          style={{
            fontSize: '13px',
            fontWeight: 'bold',
            color: journalPulse ? PALETTE.TideGlow : PALETTE.Bone,
            letterSpacing: '0.8px',
          }}
        >
          [J] JOURNAL
        </span>
      </div>

      {/* Top Right: Scratched Tally Marks on the Rail (No empty slots, No total) */}
      {deathCount > 0 && (
        <div
          style={{
            backgroundColor: 'rgba(7, 9, 15, 0.88)',
            border: `2px solid ${PALETTE.Deepwater}`,
            padding: '10px 16px',
            borderRadius: '4px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
          }}
        >
          <div style={{ fontSize: '11px', color: PALETTE.Ash, marginBottom: '6px', letterSpacing: '1px' }}>
            SCRACHED ON THE RAIL
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* Completed Clusters of 5 */}
            {Array.from({ length: fullClusters }).map((_, cIdx) => (
              <div
                key={`full-${cIdx}`}
                style={{
                  position: 'relative',
                  display: 'flex',
                  gap: '4px',
                  padding: '2px 4px',
                }}
              >
                {/* 4 Vertical Scratches */}
                {[0, 1, 2, 3].map((sIdx) => (
                  <div
                    key={sIdx}
                    style={{
                      width: '3px',
                      height: '22px',
                      backgroundColor: PALETTE.BloodRust,
                      boxShadow: `0 0 3px ${PALETTE.BloodRust}`,
                      borderRadius: '1px',
                    }}
                  />
                ))}
                {/* 1 Crossing Diagonal Slash */}
                <div
                  style={{
                    position: 'absolute',
                    top: '11px',
                    left: '1px',
                    width: '30px',
                    height: '3px',
                    backgroundColor: PALETTE.BloodRust,
                    transform: 'rotate(-24deg)',
                    boxShadow: `0 0 3px ${PALETTE.BloodRust}`,
                    borderRadius: '1px',
                  }}
                />
              </div>
            ))}

            {/* Incomplete Remainder Cluster */}
            {remainderMarks > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: '4px',
                  padding: '2px 4px',
                }}
              >
                {Array.from({ length: remainderMarks }).map((_, rIdx) => (
                  <div
                    key={`rem-${rIdx}`}
                    style={{
                      width: '3px',
                      height: '22px',
                      backgroundColor: PALETTE.BloodRust,
                      boxShadow: `0 0 3px ${PALETTE.BloodRust}`,
                      borderRadius: '1px',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* One-time controls hint in loop 1 (Prompt Issue 6) */}
      {deathCount === 0 && !useUIStore.getState().hasDismissedControlsHint && (
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(7, 9, 15, 0.92)',
            border: `1.5px solid ${PALETTE.Lantern}`,
            borderRadius: '6px',
            padding: '8px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: PALETTE.Bone,
            fontSize: '14px',
            letterSpacing: '1px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.8)',
            pointerEvents: 'auto',
            animation: 'fadeIn 0.3s ease',
          }}
        >
          <span>WASD move, E interact, J journal</span>
          <button
            onClick={() => useUIStore.getState().dismissControlsHint()}
            style={{
              background: 'none',
              border: 'none',
              color: PALETTE.Lantern,
              cursor: 'pointer',
              fontSize: '14px',
              padding: '0 4px',
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
