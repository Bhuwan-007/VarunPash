import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MANGA_CUTSCENES, MangaCutsceneDef, MangaItem, MangaPanelDef } from '../data/mangaIntro';
import { playPageTurn } from '../utils/audio';

interface MangaPageProps {
  cutsceneId?: string;
  customDef?: MangaCutsceneDef;
  onComplete?: () => void;
}

export const MangaPage: React.FC<MangaPageProps> = ({
  cutsceneId = 'intro',
  customDef,
  onComplete,
}) => {
  const def = customDef ?? MANGA_CUTSCENES[cutsceneId];

  const [pageIndex, setPageIndex] = useState<number>(0);
  const [panelIndex, setPanelIndex] = useState<number>(0);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [showTitleCard, setShowTitleCard] = useState<boolean>(false);
  const [panelKey, setPanelKey] = useState<number>(0);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isImpactFlashing, setIsImpactFlashing] = useState<boolean>(false);

  const currentPage = def?.pages[pageIndex];
  const totalPanelsOnPage = currentPage?.panels.length ?? 0;

  const mountTimeRef = useRef<number>(Date.now());
  useEffect(() => {
    mountTimeRef.current = Date.now();
  }, [cutsceneId]);

  // Trigger impact effects (screen shake + white flash)
  const triggerImpact = useCallback(() => {
    setIsShaking(true);
    setIsImpactFlashing(true);
    setTimeout(() => setIsImpactFlashing(false), 280);
    setTimeout(() => setIsShaking(false), 400);
  }, []);

  // Advance beat
  const advance = useCallback(() => {
    // 250ms grace period on mount prevents accidental skip from holding interaction keys
    if (Date.now() - mountTimeRef.current < 250) {
      return;
    }

    if (!def) {
      onComplete?.();
      return;
    }

    if (showTitleCard) {
      return; // Waiting for title card timeout
    }

    // Still panels to reveal on current page
    if (panelIndex < totalPanelsOnPage - 1) {
      const nextPanel = currentPage?.panels[panelIndex + 1];
      setPanelIndex((prev) => prev + 1);
      setPanelKey((k) => k + 1);
      if (nextPanel?.impact) {
        triggerImpact();
      }
      return;
    }

    // Page complete: Flip to next page or finish
    if (pageIndex < def.pages.length - 1) {
      playPageTurn();
      setPageIndex((p) => p + 1);
      setPanelIndex(0);
      setPanelKey((k) => k + 1);
      const firstPanelNextPage = def.pages[pageIndex + 1]?.panels[0];
      if (firstPanelNextPage?.impact) {
        triggerImpact();
      }
      return;
    }

    // Cutscene complete: show title card if provided, else onComplete
    if (def.titleCard) {
      setShowTitleCard(true);
    } else {
      onComplete?.();
    }
  }, [def, showTitleCard, panelIndex, totalPanelsOnPage, pageIndex, currentPage, onComplete, triggerImpact]);

  // Handle skip (Escape key)
  const handleSkip = useCallback(() => {
    if (def?.titleCard && !showTitleCard) {
      setShowTitleCard(true);
    } else {
      onComplete?.();
    }
  }, [def, showTitleCard, onComplete]);

  // Keyboard navigation: Space, E, Enter, Click advances. Escape skips.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleSkip();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        e.stopPropagation();
        advance();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [advance, handleSkip]);

  // Title card 3-second timer
  useEffect(() => {
    if (!showTitleCard) return;

    const timer = setTimeout(() => {
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [showTitleCard, onComplete]);

  if (!def) {
    return null;
  }

  // --- Title Card Screen ---
  if (showTitleCard) {
    return (
      <div
        onClick={() => onComplete?.()}
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
          zIndex: 80,
          userSelect: 'none',
          cursor: 'pointer',
          backgroundImage:
            'radial-gradient(circle, rgba(95, 211, 196, 0.08) 0%, rgba(7, 9, 15, 0.95) 75%)',
          animation: 'titleFadeIn 0.8s ease-out forwards',
        }}
      >
        <div
          style={{
            fontFamily: "'IM Fell English SC', serif",
            fontSize: '56px',
            letterSpacing: '12px',
            color: '#e8dfc8',
            textAlign: 'center',
            textShadow: '0 0 30px rgba(95, 211, 196, 0.4), 0 0 10px rgba(232, 223, 200, 0.6)',
            padding: '0 40px',
            lineHeight: 1.2,
          }}
        >
          {def.titleCard}
        </div>
        <div
          style={{
            marginTop: '24px',
            fontFamily: "'Special Elite', monospace",
            fontSize: '15px',
            letterSpacing: '4px',
            color: '#f2a541',
            opacity: 0.85,
            textTransform: 'uppercase',
          }}
        >
          A Curse Set in Black Water
        </div>
      </div>
    );
  }

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
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 75,
        userSelect: 'none',
        cursor: 'pointer',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes panelScaleIn {
          0% { transform: scale(1.06); opacity: 0; }
          100% { transform: scale(1.0); opacity: 1; }
        }
        @keyframes inkFlash {
          0% { opacity: 0.85; }
          100% { opacity: 0; }
        }
        @keyframes bubblePop {
          0% { transform: scale(0.85); opacity: 0; }
          100% { transform: scale(1.0); opacity: 1; }
        }
        @keyframes sfxSlam {
          0% { transform: scale(1.6); opacity: 0; }
          65% { transform: scale(0.95); opacity: 1; }
          100% { transform: scale(1.0); opacity: 1; }
        }
        @keyframes titleFadeIn {
          0% { opacity: 0; transform: scale(0.96); }
          100% { opacity: 1; transform: scale(1.0); }
        }
        @keyframes screenShake {
          0% { transform: translate(0, 0); }
          20% { transform: translate(-6px, 4px); }
          40% { transform: translate(5px, -5px); }
          60% { transform: translate(-4px, -3px); }
          80% { transform: translate(3px, 3px); }
          100% { transform: translate(0, 0); }
        }
      `}</style>

      {/* Screen Shake Container */}
      <div
        style={{
          position: 'relative',
          width: 'min(100vw, 100vh * (16 / 9))',
          aspectRatio: '16 / 9',
          maxHeight: '100vh',
          backgroundColor: '#eee8dc', // Aged-paper white
          backgroundImage:
            'radial-gradient(circle, rgba(0, 0, 0, 0.07) 1px, transparent 1px)',
          backgroundSize: '6px 6px',
          boxShadow: '0 0 50px rgba(0, 0, 0, 0.95)',
          overflow: 'hidden',
          animation: isShaking ? 'screenShake 0.35s ease-in-out' : 'none',
        }}
      >
        {/* Render panels for current page up to panelIndex */}
        {currentPage?.panels.map((panel, idx) => {
          const isRevealed = idx <= panelIndex;
          if (!isRevealed) return null;

          const isNewlyRevealed = idx === panelIndex;
          const [px, py, pw, ph] = panel.rect;
          const leftPercent = (px / 1600) * 100;
          const topPercent = (py / 900) * 100;
          const widthPercent = (pw / 1600) * 100;
          const heightPercent = (ph / 900) * 100;

          const isMissing = !!failedImages[panel.id];
          const focusX = (panel.focus?.[0] ?? 0.5) * 100;
          const focusY = (panel.focus?.[1] ?? 0.5) * 100;

          return (
            <div
              key={`${panel.id}_${pageIndex}_${panelKey}`}
              style={{
                position: 'absolute',
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                width: `${widthPercent}%`,
                height: `${heightPercent}%`,
                border: '4px solid #07090f',
                boxSizing: 'border-box',
                backgroundColor: panel.fit === 'contain' ? '#07090f' : '#111722',
                overflow: 'visible', // Allow SFX to slightly cross panel edges
                animation: isNewlyRevealed ? 'panelScaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'none',
              }}
            >
              {/* Panel Image Container with Clip */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden',
                  backgroundColor: panel.fit === 'contain' ? '#07090f' : '#111722',
                }}
              >
                {!isMissing ? (
                  <img
                    src={`${import.meta.env.BASE_URL}assets/cinematics/${panel.image}`}
                    alt={panel.id}
                    onError={() =>
                      setFailedImages((prev) => ({ ...prev, [panel.id]: true }))
                    }
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: panel.fit ?? 'cover',
                      objectPosition: `${focusX}% ${focusY}%`,
                      display: 'block',
                      filter: 'contrast(1.08) brightness(0.98)',
                    }}
                  />
                ) : (
                  /* Black halftone fallback panel */
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#07090f',
                      backgroundImage:
                        'radial-gradient(circle, rgba(255, 255, 255, 0.12) 1px, transparent 1px)',
                      backgroundSize: '6px 6px',
                    }}
                  />
                )}

                {/* 80ms Ink Flash on reveal */}
                {isNewlyRevealed && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#ffffff',
                      pointerEvents: 'none',
                      animation: 'inkFlash 0.08s ease-out forwards',
                    }}
                  />
                )}
              </div>

              {/* Items Overlay (Narration, Speech, Shout, Whisper, SFX) */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                }}
              >
                {panel.items.map((item, iIdx) => (
                  <MangaBubbleItem
                    key={iIdx}
                    item={item}
                    isNewlyRevealed={isNewlyRevealed}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Global Impact White Flash */}
        {isImpactFlashing && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: '#ffffff',
              pointerEvents: 'none',
              animation: 'inkFlash 0.28s ease-out forwards',
              zIndex: 90,
            }}
          />
        )}

        {/* Prompt Indicator Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '24px',
            fontFamily: "'Special Elite', monospace",
            fontSize: '12px',
            letterSpacing: '2px',
            color: '#07090f',
            backgroundColor: 'rgba(238, 232, 220, 0.85)',
            padding: '4px 10px',
            border: '1.5px solid #07090f',
            borderRadius: '2px',
            zIndex: 85,
          }}
        >
          [SPACE / CLICK] Next • [ESC] Skip
        </div>
      </div>
    </div>
  );
};

// --- Manga Bubble Item Component ---
interface MangaBubbleItemProps {
  item: MangaItem;
  isNewlyRevealed: boolean;
}

// Helper to render directional manga tail pointing towards speaker
const renderBubbleTail = (
  tail?: [number, number],
  at?: [number, number],
  w?: number,
  bubbleBg = '#ffffff'
) => {
  if (!tail || !at) return null;
  const bubbleWidth = w ?? 36;
  const bubbleCenterX = at[0] + bubbleWidth / 2;
  const bubbleCenterY = at[1] + 12;
  const dx = tail[0] - bubbleCenterX;
  const dy = tail[1] - bubbleCenterY;

  // Speaker is to the right
  if (Math.abs(dx) > Math.abs(dy) && dx > 0) {
    return (
      <div
        style={{
          position: 'absolute',
          right: '-11px',
          top: '35%',
          width: 0,
          height: 0,
          borderTop: '6px solid transparent',
          borderBottom: '6px solid transparent',
          borderLeft: '11px solid #07090f',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-5px',
            right: '2px',
            width: 0,
            height: 0,
            borderTop: '5px solid transparent',
            borderBottom: '5px solid transparent',
            borderLeft: `9px solid ${bubbleBg}`,
          }}
        />
      </div>
    );
  }

  // Speaker is to the left
  if (Math.abs(dx) > Math.abs(dy) && dx < 0) {
    return (
      <div
        style={{
          position: 'absolute',
          left: '-11px',
          top: '35%',
          width: 0,
          height: 0,
          borderTop: '6px solid transparent',
          borderBottom: '6px solid transparent',
          borderRight: '11px solid #07090f',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-5px',
            left: '2px',
            width: 0,
            height: 0,
            borderTop: '5px solid transparent',
            borderBottom: '5px solid transparent',
            borderRight: `9px solid ${bubbleBg}`,
          }}
        />
      </div>
    );
  }

  // Speaker is above
  if (dy < 0) {
    const leftOffset = dx > 8 ? '75%' : dx < -8 ? '25%' : '50%';
    return (
      <div
        style={{
          position: 'absolute',
          top: '-11px',
          left: leftOffset,
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderBottom: '11px solid #07090f',
        }}
      >
        <div
          style={{
            position: 'absolute',
            bottom: '-10px',
            left: '-5px',
            width: 0,
            height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderBottom: `9px solid ${bubbleBg}`,
          }}
        />
      </div>
    );
  }

  // Speaker is below (default)
  const leftOffset = dx > 8 ? '75%' : dx < -8 ? '25%' : '50%';
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '-11px',
        left: leftOffset,
        transform: 'translateX(-50%)',
        width: 0,
        height: 0,
        borderLeft: '6px solid transparent',
        borderRight: '6px solid transparent',
        borderTop: '11px solid #07090f',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-13px',
          left: '-5px',
          width: 0,
          height: 0,
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop: `9px solid ${bubbleBg}`,
        }}
      />
    </div>
  );
};

const MangaBubbleItem: React.FC<MangaBubbleItemProps> = ({
  item,
  isNewlyRevealed,
}) => {
  const [posX, posY] = item.at;
  const widthVal = item.w ? `${item.w}%` : 'auto';

  // 1. NARRATION: Cream rectangle (#f2ede4), 3px black border, text in IM Fell English SC italic
  if (item.type === 'narration') {
    return (
      <div
        style={{
          position: 'absolute',
          left: `${posX}%`,
          top: `${posY}%`,
          width: widthVal,
          maxWidth: '92%',
          backgroundColor: '#f2ede4',
          border: '3px solid #07090f',
          boxShadow: '0 3px 8px rgba(0, 0, 0, 0.4)',
          padding: '6px 10px',
          boxSizing: 'border-box',
          fontFamily: "'IM Fell English SC', serif",
          fontStyle: 'italic',
          fontSize: '12px',
          lineHeight: 1.25,
          color: '#07090f',
          animation: isNewlyRevealed
            ? 'bubblePop 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.25s backwards'
            : 'none',
        }}
      >
        {item.text}
      </div>
    );
  }

  // 2. SPEECH: White ellipse bubble, 3px black outline, tail pointing to tail [x%, y%], Comic Neue Bold UPPERCASE
  if (item.type === 'speech') {
    return (
      <div
        style={{
          position: 'absolute',
          left: `${posX}%`,
          top: `${posY}%`,
          width: widthVal,
          maxWidth: '92%',
          backgroundColor: '#ffffff',
          border: '3px solid #07090f',
          borderRadius: '20px',
          boxShadow: '0 3px 8px rgba(0, 0, 0, 0.35)',
          padding: '6px 10px',
          boxSizing: 'border-box',
          fontFamily: "'Comic Neue', cursive, sans-serif",
          fontWeight: 700,
          textTransform: 'uppercase',
          fontSize: '11px',
          lineHeight: 1.2,
          color: '#07090f',
          textAlign: 'center',
          animation: isNewlyRevealed
            ? 'bubblePop 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.25s backwards'
            : 'none',
        }}
      >
        {item.text}
        {item.tail && renderBubbleTail(item.tail, item.at, item.w, '#ffffff')}
      </div>
    );
  }

  // 3. SHOUT: Spiky burst bubble, bold larger text
  if (item.type === 'shout') {
    return (
      <div
        style={{
          position: 'absolute',
          left: `${posX}%`,
          top: `${posY}%`,
          width: widthVal,
          maxWidth: '96%',
          backgroundColor: '#ffffff',
          border: '3px solid #07090f',
          borderRadius: '14px',
          padding: '8px 12px',
          boxSizing: 'border-box',
          fontFamily: "'Comic Neue', cursive, sans-serif",
          fontWeight: 800,
          textTransform: 'uppercase',
          fontSize: '13px',
          letterSpacing: '0.5px',
          lineHeight: 1.2,
          color: '#07090f',
          textAlign: 'center',
          boxShadow: '0 0 0 2px #ffffff, 0 0 0 5px #07090f, 0 4px 10px rgba(0,0,0,0.5)',
          animation: isNewlyRevealed
            ? 'bubblePop 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.25s backwards'
            : 'none',
        }}
      >
        {item.text}
        {item.tail && renderBubbleTail(item.tail, item.at, item.w, '#ffffff')}
      </div>
    );
  }

  // 4. WHISPER: Dashed-outline bubble, smaller italic text
  if (item.type === 'whisper') {
    return (
      <div
        style={{
          position: 'absolute',
          left: `${posX}%`,
          top: `${posY}%`,
          width: widthVal,
          maxWidth: '90%',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: '2.5px dashed #444444',
          borderRadius: '16px',
          padding: '5px 10px',
          boxSizing: 'border-box',
          fontFamily: "'Comic Neue', cursive, sans-serif",
          fontStyle: 'italic',
          fontSize: '11px',
          lineHeight: 1.2,
          color: '#222222',
          textAlign: 'center',
          animation: isNewlyRevealed
            ? 'bubblePop 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.25s backwards'
            : 'none',
        }}
      >
        {item.text}
        {item.tail && renderBubbleTail(item.tail, item.at, item.w, '#ffffff')}
      </div>
    );
  }

  // 5. SFX: Big stylized text in Bangers, white or teal fill, thick black outline, slight rotation
  if (item.type === 'sfx') {
    const sizeMap: Record<string, number> = {
      sm: 22,
      md: 34,
      lg: 48,
      xl: 68,
    };
    const fontSize = sizeMap[item.size ?? 'md'] ?? 34;
    const fillColor = item.color ?? '#ffffff';
    const rotation = item.rot ?? 0;

    return (
      <div
        style={{
          position: 'absolute',
          left: `${posX}%`,
          top: `${posY}%`,
          fontFamily: "'Bangers', cursive, sans-serif",
          fontSize: `${fontSize}px`,
          letterSpacing: '2px',
          color: fillColor,
          transform: `rotate(${rotation}deg)`,
          transformOrigin: 'center center',
          whiteSpace: 'nowrap',
          textShadow: `
            -2px -2px 0 #07090f,
             2px -2px 0 #07090f,
            -2px  2px 0 #07090f,
             2px  2px 0 #07090f,
            -3px  0   0 #07090f,
             3px  0   0 #07090f,
             0   -3px 0 #07090f,
             0    3px 0 #07090f,
             0    4px 8px rgba(0, 0, 0, 0.6)
          `,
          animation: isNewlyRevealed
            ? 'sfxSlam 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.25s backwards'
            : 'none',
        }}
      >
        {item.text}
      </div>
    );
  }

  return null;
};
