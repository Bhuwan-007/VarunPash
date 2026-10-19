import React, { useEffect } from 'react';
import { PALETTE } from '../config';
import { ROLE_CARDS } from '../data/journalEntries';
import { addDirectJournalEntry } from '../game/systems/knowledge';
import { useMemoryStore } from '../store/memoryStore';
import { useUIStore } from '../store/uiStore';

export const RoleCard: React.FC = () => {
  const isOpen = useUIStore((s) => s.roleCardOpen);
  const closeCard = useUIStore((s) => s.closeRoleCard);
  const playerRole = useMemoryStore((s) => s.playerRole) ?? 'deckhand';

  const roleInfo = ROLE_CARDS[playerRole] ?? ROLE_CARDS.deckhand;

  const handleDismiss = () => {
    // Add Clues entry in the player's voice for the role
    addDirectJournalEntry({
      id: roleInfo.journalEntry.id,
      tab: roleInfo.journalEntry.tab,
      title: roleInfo.journalEntry.title,
      text: roleInfo.journalEntry.text,
    });
    closeCard();
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'e' ||
        e.key === 'E' ||
        e.code === 'KeyE' ||
        e.key === 'Enter' ||
        e.code === 'Space' ||
        e.key === 'Escape'
      ) {
        e.preventDefault();
        e.stopPropagation();
        handleDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, roleInfo]);

  if (!isOpen) return null;

  return (
    <div
      onClick={handleDismiss}
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
        padding: '20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '540px',
          maxWidth: '92%',
          backgroundColor: '#0c1622',
          border: `2px solid ${PALETTE.Lantern}`,
          borderRadius: '8px',
          boxShadow: '0 0 40px rgba(0, 0, 0, 0.95), inset 0 0 20px rgba(18, 48, 61, 0.4)',
          color: PALETTE.Bone,
          fontFamily: "'Special Elite', monospace, sans-serif",
          padding: '28px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          position: 'relative',
        }}
      >
        {/* Header Ribbon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(229, 169, 59, 0.3)',
            paddingBottom: '12px',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '11px',
                letterSpacing: '2px',
                color: PALETTE.Ash,
                textTransform: 'uppercase',
              }}
            >
              ASSIGNED BILLET
            </div>
            <div
              style={{
                fontSize: '28px',
                fontFamily: "'IM Fell English SC', serif, monospace",
                fontWeight: 'bold',
                color: PALETTE.Bone,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              {roleInfo.title}
              <span
                style={{
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  backgroundColor: roleInfo.sashColor,
                  borderRadius: '3px',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: `0 0 8px ${roleInfo.sashColor}`,
                }}
                title={`${roleInfo.sashColorName} Sash`}
              />
            </div>
          </div>

          <div
            style={{
              padding: '4px 10px',
              backgroundColor: 'rgba(7, 9, 15, 0.8)',
              border: `1px solid ${roleInfo.sashColor}`,
              borderRadius: '4px',
              fontSize: '11px',
              color: roleInfo.sashColor,
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            {roleInfo.sashColorName} Sash
          </div>
        </div>

        {/* Content Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px', lineHeight: '1.6' }}>
          <div>
            <div style={{ color: PALETTE.Lantern, fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 'bold' }}>
              WHAT YOU CARRY
            </div>
            <div style={{ color: PALETTE.Bone, marginTop: '2px' }}>{roleInfo.carry}</div>
          </div>

          <div>
            <div style={{ color: PALETTE.Lantern, fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 'bold' }}>
              HOW YOU REACH THE HOLD
            </div>
            <div style={{ color: PALETTE.Bone, marginTop: '2px' }}>{roleInfo.holdAccess}</div>
          </div>

          <div>
            <div style={{ color: PALETTE.Lantern, fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 'bold' }}>
              HOW THE CREW TREAT YOU
            </div>
            <div style={{ color: PALETTE.Bone, marginTop: '2px' }}>{roleInfo.crewTreatment}</div>
          </div>
        </div>

        {/* Footer Hint */}
        <div
          style={{
            marginTop: '8px',
            borderTop: '1px solid rgba(229, 169, 59, 0.2)',
            paddingTop: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '11px', color: PALETTE.Ash, fontStyle: 'italic' }}>
            Recorded in your Journal under Clues.
          </span>

          <button
            onClick={handleDismiss}
            style={{
              backgroundColor: PALETTE.Deepwater,
              border: `1.5px solid ${PALETTE.Lantern}`,
              borderRadius: '4px',
              padding: '8px 18px',
              color: PALETTE.Lantern,
              fontWeight: 'bold',
              fontSize: '13px',
              letterSpacing: '1px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}
          >
            <span>PRESS [E] TO SKIP</span>
            <span>➔</span>
          </button>
        </div>
      </div>
    </div>
  );
};
