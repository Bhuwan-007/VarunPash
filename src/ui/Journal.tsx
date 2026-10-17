import React, { useEffect, useState } from 'react';
import { PALETTE } from '../config';
import { JournalTab } from '../data/journalEntries';
import { useMemoryStore } from '../store/memoryStore';
import { useUIStore } from '../store/uiStore';

export const Journal: React.FC = () => {
  const isOpen = useUIStore((s) => s.journalOpen);
  const setJournalOpen = useUIStore((s) => s.setJournalOpen);

  const journalEntries = useMemoryStore((s) => s.journal);
  const knowledge = useMemoryStore((s) => s.knowledge);
  const [activeTab, setActiveTab] = useState<JournalTab>('Clues');

  // Handle J or Escape to close journal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'j' || e.key === 'J' || e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setJournalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setJournalOpen]);

  if (!isOpen) return null;

  // Filter entries for the selected tab
  const entriesForTab = journalEntries.filter((e) => e.tab === activeTab);

  const tabs: { name: JournalTab; ribbonColor: string }[] = [
    { name: 'Clues', ribbonColor: PALETTE.TideGlow },
    { name: 'Tide Table', ribbonColor: PALETTE.Deepwater },
    { name: 'People', ribbonColor: PALETTE.Lantern },
    { name: 'Codes', ribbonColor: PALETTE.BloodRust },
  ];

  const hasSafeCode = knowledge.includes('K_SAFE_CODE');

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(7, 9, 15, 0.85)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 55,
        backdropFilter: 'blur(3px)',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setJournalOpen(false);
        }
      }}
    >
      {/* Open Book Container */}
      <div
        style={{
          position: 'relative',
          width: '900px',
          height: '560px',
          display: 'flex',
          boxShadow: '0 12px 48px rgba(0, 0, 0, 0.95)',
          borderRadius: '8px',
          fontFamily: "'Caveat', cursive, sans-serif",
          color: '#1c1611',
          userSelect: 'none',
        }}
      >
        {/* Top Ribbon Bookmark Tabs */}
        <div
          style={{
            position: 'absolute',
            top: '-34px',
            left: '42px',
            display: 'flex',
            gap: '12px',
            zIndex: 10,
          }}
        >
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.name;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                style={{
                  position: 'relative',
                  padding: isSelected ? '8px 22px 14px 22px' : '6px 18px 10px 18px',
                  backgroundColor: isSelected ? '#f4eedb' : tab.ribbonColor,
                  color: isSelected ? '#1c1611' : PALETTE.Bone,
                  border: isSelected ? '2px solid #5a4430' : '1px solid #1c1611',
                  borderBottom: 'none',
                  borderRadius: '6px 6px 0 0',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 -2px 8px rgba(0,0,0,0.4)',
                  transition: 'all 0.15s ease',
                  fontFamily: "'Caveat', cursive, sans-serif",
                  letterSpacing: '0.5px',
                }}
              >
                {/* Ribbon notch detail */}
                <span style={{ position: 'relative', zIndex: 2 }}>{tab.name}</span>
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-3px',
                      left: 0,
                      width: '100%',
                      height: '5px',
                      backgroundColor: '#f4eedb',
                      zIndex: 3,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Close button [✕ J] */}
        <button
          onClick={() => setJournalOpen(false)}
          style={{
            position: 'absolute',
            top: '-32px',
            right: '24px',
            padding: '6px 14px',
            backgroundColor: 'rgba(7, 9, 15, 0.95)',
            border: `1px solid ${PALETTE.Lantern}`,
            borderRadius: '4px',
            color: PALETTE.Lantern,
            fontFamily: 'monospace',
            fontSize: '13px',
            fontWeight: 'bold',
            cursor: 'pointer',
            zIndex: 20,
          }}
        >
          ✕ CLOSE [J]
        </button>

        {/* Left Book Page */}
        <div
          style={{
            flex: 1,
            backgroundColor: '#f4eedb',
            border: '2px solid #5a4430',
            borderRight: '1px solid #c2b396',
            borderRadius: '8px 0 0 8px',
            padding: '42px 48px',
            position: 'relative',
            boxShadow: 'inset -12px 0 24px rgba(60, 40, 20, 0.12)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              borderBottom: '2px dashed #9e876d',
              paddingBottom: '8px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#382516',
                letterSpacing: '1px',
              }}
            >
              {activeTab}
            </h2>
            <span style={{ fontSize: '16px', color: '#7a634e', fontStyle: 'italic' }}>
              Log of the Jal-Doot
            </span>
          </div>

          {/* Left Page Content */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              paddingRight: '10px',
            }}
          >
            {activeTab === 'Codes' ? (
              hasSafeCode ? (
                <div>
                  <div
                    style={{
                      padding: '20px 24px',
                      backgroundColor: 'rgba(232, 223, 200, 0.6)',
                      border: '2px dashed #7a4224',
                      borderRadius: '6px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      marginBottom: '20px',
                      transform: 'rotate(-0.8deg)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '18px',
                        textTransform: 'uppercase',
                        color: '#6e3518',
                        letterSpacing: '1px',
                        marginBottom: '6px',
                        fontWeight: 'bold',
                      }}
                    >
                      Quartermaster's Safe:
                    </div>
                    <div
                      style={{
                        fontSize: '44px',
                        fontWeight: 'bold',
                        letterSpacing: '12px',
                        color: '#1a120c',
                        textAlign: 'center',
                        margin: '12px 0',
                        fontFamily: 'monospace',
                      }}
                    >
                      7 - 3 - 1
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '21px',
                        lineHeight: '1.4',
                        color: '#2a1f18',
                      }}
                    >
                      "The Nakhuda screamed seven-three-one before the pistol spoke. Odd thing to remember."
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    paddingTop: '60px',
                    textAlign: 'center',
                    color: '#8f7964',
                    fontStyle: 'italic',
                    fontSize: '22px',
                  }}
                >
                  No codes or combinations recorded yet.
                </div>
              )
            ) : entriesForTab.length === 0 ? (
              <div
                style={{
                  paddingTop: '60px',
                  textAlign: 'center',
                  color: '#8f7964',
                  fontStyle: 'italic',
                  fontSize: '22px',
                }}
              >
                {activeTab === 'Tide Table'
                  ? 'The tide keeps its own time. No events yet deciphered.'
                  : 'The page is blank. Explore the ship to uncover the truth.'}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                {entriesForTab.map((entry) => (
                  <div
                    key={entry.id}
                    style={{
                      borderBottom: '1px solid rgba(138, 110, 80, 0.25)',
                      paddingBottom: '14px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        marginBottom: '4px',
                      }}
                    >
                      <h3
                        style={{
                          margin: 0,
                          fontSize: '22px',
                          color: '#422817',
                          fontWeight: 'bold',
                        }}
                      >
                        {entry.title ?? entry.id}
                      </h3>
                      {entry.tideTime && (
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '13px',
                            color: '#6e3518',
                            backgroundColor: 'rgba(178, 58, 58, 0.12)',
                            padding: '2px 8px',
                            borderRadius: '3px',
                            fontWeight: 'bold',
                          }}
                        >
                          {entry.tideTime}
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '21px',
                        lineHeight: '1.4',
                        color: '#21160e',
                      }}
                    >
                      "{entry.text}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Page Footer */}
          <div
            style={{
              textAlign: 'center',
              marginTop: '12px',
              fontSize: '15px',
              color: '#9e876d',
            }}
          >
            ~ Page I ~
          </div>
        </div>

        {/* Book Center Binding Crease */}
        <div
          style={{
            width: '18px',
            backgroundColor: '#423122',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.85)',
            zIndex: 5,
            borderTop: '2px solid #5a4430',
            borderBottom: '2px solid #5a4430',
          }}
        />

        {/* Right Book Page */}
        <div
          style={{
            flex: 1,
            backgroundColor: '#f4eedb',
            border: '2px solid #5a4430',
            borderLeft: '1px solid #c2b396',
            borderRadius: '0 8px 8px 0',
            padding: '42px 48px',
            position: 'relative',
            boxShadow: 'inset 12px 0 24px rgba(60, 40, 20, 0.12)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Right Header */}
          <div
            style={{
              borderBottom: '2px dashed #9e876d',
              paddingBottom: '8px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <span style={{ fontSize: '18px', color: '#6e5138', fontWeight: 'bold' }}>
              Memories of the Loop
            </span>
            <span style={{ fontSize: '15px', color: '#7a634e', fontStyle: 'italic' }}>
              Written in salt and pitch
            </span>
          </div>

          {/* Right Page Body */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              color: '#2a1f18',
            }}
          >
            <div>
              <p style={{ fontSize: '20px', lineHeight: '1.45', margin: '0 0 16px 0' }}>
                "The sea swallows the hours, but the ink remembers. What is etched here endures across the drowning."
              </p>
              {knowledge.length > 0 && (
                <div
                  style={{
                    marginTop: '24px',
                    padding: '16px',
                    backgroundColor: 'rgba(230, 219, 195, 0.5)',
                    borderRadius: '4px',
                    borderLeft: '3px solid #7a634e',
                  }}
                >
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#573d27', marginBottom: '8px' }}>
                    OBSERVATIONS:
                  </div>
                  <div style={{ fontSize: '19px', lineHeight: '1.4', fontStyle: 'italic' }}>
                    {knowledge.includes('K_BHIMA_GOSSIP') && (
                      <div style={{ marginBottom: '8px' }}>
                        • Bhima watches everyone from his galley pots. He speaks the truth of the crew.
                      </div>
                    )}
                    {knowledge.includes('K_MUTINEER') && (
                      <div style={{ marginBottom: '8px' }}>
                        • Kedar's ambition runs deeper than the hold. The mutiny is inevitable unless averted.
                      </div>
                    )}
                    {hasSafeCode && (
                      <div style={{ marginBottom: '8px' }}>
                        • The safe holds the keys to the ship's armory and helm.
                      </div>
                    )}
                    {knowledge.includes('K_CHANT') && (
                      <div>
                        • The relic responds to the spoken tongue. It must not be handled carelessly.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                borderTop: '1px solid rgba(138, 110, 80, 0.25)',
                paddingTop: '10px',
                textAlign: 'center',
                fontSize: '15px',
                color: '#9e876d',
              }}
            >
              ~ Page II ~
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
