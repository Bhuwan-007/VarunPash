import React, { useEffect, useState } from 'react';
import { PALETTE } from '../config';
import { useUIStore } from '../store/uiStore';

export const DialogueBox: React.FC = () => {
  const activeDialogue = useUIStore((s) => s.activeDialogue);
  const closeDialogue = useUIStore((s) => s.closeDialogue);

  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  // Typewriter effect
  useEffect(() => {
    if (!activeDialogue) {
      setDisplayedText('');
      setIsTypingComplete(false);
      return;
    }

    const fullText = activeDialogue.line.text;
    let charIndex = 0;
    setDisplayedText('');
    setIsTypingComplete(false);

    const timer = setInterval(() => {
      charIndex++;
      setDisplayedText(fullText.slice(0, charIndex));
      if (charIndex >= fullText.length) {
        clearInterval(timer);
        setIsTypingComplete(true);
      }
    }, 22);

    return () => clearInterval(timer);
  }, [activeDialogue]);

  // Handle E or Space or Enter to complete or close dialogue
  useEffect(() => {
    if (!activeDialogue) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'e' || e.key === 'E' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();

        if (!isTypingComplete) {
          // Instant-finish typewriter
          setDisplayedText(activeDialogue.line.text);
          setIsTypingComplete(true);
        } else {
          closeDialogue();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeDialogue, isTypingComplete, closeDialogue]);

  if (!activeDialogue) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(94%, 960px)',
        zIndex: 50,
        pointerEvents: 'auto',
        animation: 'slideUp 0.2s ease',
      }}
    >
      {/* Dialogue Panel Box */}
      <div
        style={{
          display: 'flex',
          backgroundColor: '#f3ebd7', // Bone paper
          border: '3px solid #1c140d', // Tar ink border
          borderRadius: '6px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.85), inset 0 0 16px rgba(90, 60, 30, 0.1)',
          overflow: 'hidden',
        }}
      >
        {/* Left: Procedural Portrait Bust Placeholder */}
        <div
          style={{
            width: '140px',
            minWidth: '140px',
            backgroundColor: '#2b2118',
            borderRight: '3px solid #1c140d',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px',
            position: 'relative',
          }}
        >
          {/* Procedural Canvas / SVG Portrait of Bhima (FEEL.md §9) */}
          <div
            style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              backgroundColor: '#16100b',
              border: `2px solid ${PALETTE.Lantern}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Torso: Stained Apron over Angarakha */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                width: '74px',
                height: '42px',
                backgroundColor: '#2a3542',
                borderRadius: '16px 16px 0 0',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                width: '48px',
                height: '38px',
                backgroundColor: '#d6c8b4',
                border: '1px solid #1c140d',
                borderRadius: '8px 8px 0 0',
              }}
            />
            {/* Grease / spice stain on apron */}
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '38px',
                width: '10px',
                height: '6px',
                backgroundColor: '#7a421e',
                borderRadius: '50%',
                opacity: 0.7,
              }}
            />

            {/* Head: Round face */}
            <div
              style={{
                position: 'absolute',
                top: '14px',
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: '#a8896c',
                border: '1.5px solid #1c140d',
              }}
            />
            {/* Hair / cap */}
            <div
              style={{
                position: 'absolute',
                top: '12px',
                width: '44px',
                height: '18px',
                borderRadius: '16px 16px 0 0',
                backgroundColor: '#19120c',
              }}
            />
            {/* Eyes */}
            <div
              style={{
                position: 'absolute',
                top: '32px',
                left: '36px',
                width: '4px',
                height: '3px',
                backgroundColor: '#19120c',
                borderRadius: '50%',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '32px',
                left: '52px',
                width: '4px',
                height: '3px',
                backgroundColor: '#19120c',
                borderRadius: '50%',
              }}
            />
            {/* Chewing mouth / smirk */}
            <div
              style={{
                position: 'absolute',
                top: '44px',
                left: '42px',
                width: '12px',
                height: '3px',
                backgroundColor: '#19120c',
                borderRadius: '2px',
              }}
            />
            {/* Pierced Gold Hoop Earring on Left Ear */}
            <div
              style={{
                position: 'absolute',
                top: '34px',
                left: '22px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                border: `2px solid ${PALETTE.Lantern}`,
              }}
            />
          </div>

          <span
            style={{
              marginTop: '8px',
              fontSize: '11px',
              color: PALETTE.Ash,
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {activeDialogue.title ?? "Ship's Cook"}
          </span>
        </div>

        {/* Right: Speaker Name & Typewriter Text */}
        <div
          style={{
            flex: 1,
            padding: '18px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            fontFamily: "'Special Elite', cursive, monospace",
          }}
        >
          <div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#2b1b11',
                borderBottom: '1px solid rgba(60, 40, 20, 0.25)',
                paddingBottom: '4px',
                marginBottom: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <span>{activeDialogue.name}</span>
              <span
                style={{
                  fontSize: '12px',
                  color: '#7a5a40',
                  fontFamily: 'monospace',
                }}
              >
                [TALK]
              </span>
            </div>

            <p
              style={{
                margin: 0,
                fontSize: '20px',
                lineHeight: '1.45',
                color: '#1a130e',
                letterSpacing: '0.5px',
                minHeight: '56px',
              }}
            >
              "{displayedText}"
            </p>
          </div>

          {/* Continue / Close prompt button */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '12px',
            }}
          >
            <button
              onClick={() => {
                if (!isTypingComplete) {
                  setDisplayedText(activeDialogue.line.text);
                  setIsTypingComplete(true);
                } else {
                  closeDialogue();
                }
              }}
              style={{
                padding: '6px 16px',
                backgroundColor: '#2b1b11',
                color: PALETTE.Bone,
                border: `1px solid ${PALETTE.Lantern}`,
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              }}
            >
              <span
                style={{
                  backgroundColor: PALETTE.Lantern,
                  color: PALETTE.Tar,
                  padding: '1px 5px',
                  borderRadius: '2px',
                  fontSize: '11px',
                }}
              >
                E
              </span>
              <span>{isTypingComplete ? 'CONTINUE' : 'FAST-FORWARD'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
