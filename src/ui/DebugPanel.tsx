import React, { useEffect, useState } from 'react';
import { CONFIG, PALETTE, startTimeForDeaths } from '../config';
import { addKnowledge } from '../game/systems/knowledge';
import { NpcScheduler } from '../game/systems/npcScheduler';
import { useLoopStore } from '../store/loopStore';
import { useMemoryStore } from '../store/memoryStore';
import { useUIStore } from '../store/uiStore';

interface DebugPanelProps {
  onKillPlayer: (cause: string, strategic?: boolean, clueText?: string) => void;
  onRestartLoop: () => void;
  onFullReset: () => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  onKillPlayer,
  onRestartLoop,
  onFullReset,
}) => {
  const isOpen = useUIStore((s) => s.debugPanelOpen);
  const toggleOpen = useUIStore((s) => s.toggleDebugPanel);

  const shipTime = useLoopStore((s) => s.shipTime);
  const timeScale = useLoopStore((s) => s.timeScale);
  const setTimeScale = useLoopStore((s) => s.setTimeScale);
  const setShipTime = useLoopStore((s) => s.setShipTime);

  const deathCount = useMemoryStore((s) => s.deathCount);
  const shipTimeAtDeath = useMemoryStore((s) => s.shipTimeAtDeath);
  const playerRole = useMemoryStore((s) => s.playerRole);
  const knowledge = useMemoryStore((s) => s.knowledge);
  const setPlayerRole = useMemoryStore((s) => s.setPlayerRole);

  const [npcLogEnabled, setNpcLogEnabled] = useState(false);

  // 1-second interval NPC position & activity logger
  useEffect(() => {
    if (!npcLogEnabled) return;

    const interval = setInterval(() => {
      const curTime = useLoopStore.getState().shipTime;
      const npcs = NpcScheduler.getAllNpcStates(curTime);
      const logStr = npcs
        .map((n) => `${n.id}: (${n.x.toFixed(2)}, ${n.y.toFixed(2)}) ${n.scene} [${n.activity}]`)
        .join(' | ');
      console.log(`[NPC Log @ ${curTime.toFixed(1)}s] ${logStr}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [npcLogEnabled]);

  const testFlags = [
    'K_SAFE_CODE',
    'K_MUTINEER',
    'K_Makara_WEAKNESS',
    'K_LEVIATHAN_WEAKNESS',
    'K_CHANT',
    'K_STATUE_TRUTH',
    'K_BHIMA_GOSSIP',
  ];

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '16px',
        right: '16px',
        zIndex: 40,
        fontFamily: 'monospace',
      }}
    >
      {/* Toggle Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
        <button
          onClick={toggleOpen}
          style={{
            padding: '8px 14px',
            backgroundColor: 'rgba(7, 9, 15, 0.9)',
            border: `1px solid ${isOpen ? PALETTE.Lantern : PALETTE.Deepwater}`,
            color: isOpen ? PALETTE.Lantern : PALETTE.Bone,
            fontSize: '12px',
            borderRadius: '4px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }}
        >
          {isOpen ? '✕ HIDE DEV PANEL' : '🛠️ DEV PANEL'}
        </button>
      </div>

      {/* Panel Window */}
      {isOpen && (
        <div
          style={{
            width: '320px',
            maxHeight: '520px',
            overflowY: 'auto',
            backgroundColor: 'rgba(11, 19, 32, 0.96)',
            border: `1px solid ${PALETTE.Lantern}`,
            borderRadius: '6px',
            padding: '14px',
            color: PALETTE.Bone,
            boxShadow: '0 8px 24px rgba(0,0,0,0.8)',
          }}
        >
          <div
            style={{
              fontSize: '13px',
              fontWeight: 'bold',
              color: PALETTE.Lantern,
              borderBottom: `1px solid ${PALETTE.Deepwater}`,
              paddingBottom: '6px',
              marginBottom: '10px',
            }}
          >
            DEBUG PANEL (ARCHITECTURE §12)
          </div>

          {/* Stats Readout */}
          {(() => {
            const startSec = startTimeForDeaths(deathCount);
            const remaining = Math.max(0, CONFIG.TIMELINE - shipTime);
            const remMin = Math.floor(remaining / 60);
            const remSec = Math.floor(remaining % 60);
            const remainingFormatted = `${String(remMin).padStart(2, '0')}:${String(remSec).padStart(2, '0')}`;
            return (
              <div style={{ fontSize: '11px', lineHeight: '1.7', color: PALETTE.Ash, marginBottom: '12px' }}>
                <div>
                  DEATH COUNT: <strong style={{ color: PALETTE.BloodRust }}>{deathCount}</strong>
                </div>
                <div>
                  START TIME: <strong style={{ color: PALETTE.TideGlow }}>{startSec}s</strong> ({Math.floor(startSec / 60)}:{(startSec % 60).toString().padStart(2, '0')})
                </div>
                <div>
                  SHIP TIME AT DEATH:{' '}
                  <strong style={{ color: shipTimeAtDeath !== null ? PALETTE.Lantern : PALETTE.Ash }}>
                    {shipTimeAtDeath !== null ? `${shipTimeAtDeath.toFixed(1)}s` : 'None (Alive)'}
                  </strong>
                </div>
                <div>
                  REMAINING TIME: <strong style={{ color: PALETTE.Bone }}>{remainingFormatted}</strong> ({remaining.toFixed(1)}s)
                </div>
                <div>
                  SHIP TIME: <strong style={{ color: PALETTE.Bone }}>{shipTime.toFixed(1)}s</strong> / {CONFIG.TIMELINE}s
                </div>
                <div>
                  ROLE: <strong style={{ color: PALETTE.TideGlow }}>{playerRole?.toUpperCase()}</strong>
                </div>
                <div>
                  TIME SCALE: <strong style={{ color: PALETTE.Lantern }}>{timeScale}x</strong>
                </div>
                <div>
                  FLAGS ({knowledge.length}):{' '}
                  <span style={{ color: PALETTE.Bone }}>{knowledge.join(', ') || 'None'}</span>
                </div>
              </div>
            );
          })()}


          {/* Kill Actions */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', color: PALETTE.Ash, marginBottom: '6px' }}>DEATH TESTING:</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => onKillPlayer('Cut down by mutineers (Wasted death test)', false)}
                style={{
                  flex: 1,
                  padding: '7px 4px',
                  backgroundColor: PALETTE.BloodRust,
                  color: PALETTE.Bone,
                  border: 'none',
                  borderRadius: '3px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                KILL (WASTED)
              </button>
              <button
                onClick={() => {
                  const unlearned = testFlags.find((f) => !knowledge.includes(f));
                  if (unlearned) {
                    addKnowledge(unlearned);
                  }
                  onKillPlayer('Sacrificed to the Kaal Mani (Strategic Death)', true);
                }}
                style={{
                  flex: 1,
                  padding: '7px 4px',
                  backgroundColor: PALETTE.TideGlow,
                  color: PALETTE.Tar,
                  border: 'none',
                  borderRadius: '3px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                KILL (STRATEGIC)
              </button>
            </div>
          </div>

          {/* Timeline Jump */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', color: PALETTE.Ash, marginBottom: '6px' }}>JUMP SHIP TIME:</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginBottom: '6px' }}>
              {[
                { label: '0s', time: 0 },
                { label: '240s', time: 240 },
                { label: '250s', time: 250 },
                { label: '300s', time: 300 },
                { label: '320s', time: 320 },
                { label: '355s', time: 355 },
                { label: '365s', time: 365 },
                { label: '485s', time: 485 },
              ].map(({ label, time }) => (
                <button
                  key={time}
                  onClick={() => setShipTime(time)}
                  style={{
                    padding: '4px 2px',
                    backgroundColor: PALETTE.Deepwater,
                    color: PALETTE.Bone,
                    border: '1px solid #1a4253',
                    borderRadius: '2px',
                    fontSize: '10px',
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* NPC Logger Toggle */}
            <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
              <button
                onClick={() => setNpcLogEnabled(!npcLogEnabled)}
                style={{
                  flex: 1,
                  padding: '5px',
                  backgroundColor: npcLogEnabled ? PALETTE.Lantern : PALETTE.Deepwater,
                  color: npcLogEnabled ? PALETTE.Tar : PALETTE.Bone,
                  border: '1px solid #1a4253',
                  borderRadius: '3px',
                  fontSize: '11px',
                  fontWeight: npcLogEnabled ? 'bold' : 'normal',
                  cursor: 'pointer',
                }}
              >
                {npcLogEnabled ? '● NPC LOGGING (ON)' : '○ NPC LOG (OFF)'}
              </button>
            </div>

            {/* Jump DeathCount */}
            <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
              <button
                onClick={() => {
                  useMemoryStore.setState({ deathCount: 12 });
                  onRestartLoop();
                }}
                style={{
                  flex: 1,
                  padding: '4px 2px',
                  backgroundColor: PALETTE.Deepwater,
                  color: PALETTE.Bone,
                  border: '1px solid #1a4253',
                  borderRadius: '2px',
                  fontSize: '10px',
                  cursor: 'pointer',
                }}
              >
                Death 12 (360s)
              </button>
              <button
                onClick={() => {
                  useMemoryStore.setState({ deathCount: 16 });
                  onRestartLoop();
                }}
                style={{
                  flex: 1,
                  padding: '4px 2px',
                  backgroundColor: PALETTE.Deepwater,
                  color: PALETTE.Bone,
                  border: '1px solid #1a4253',
                  borderRadius: '2px',
                  fontSize: '10px',
                  cursor: 'pointer',
                }}
              >
                Death 16 (480s)
              </button>
            </div>
          </div>

          {/* Time Scale */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', color: PALETTE.Ash, marginBottom: '6px' }}>TIME SCALE SPEED:</div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1, 2, 5, 10].map((s) => (
                <button
                  key={s}
                  onClick={() => setTimeScale(s)}
                  style={{
                    flex: 1,
                    padding: '4px',
                    backgroundColor: timeScale === s ? PALETTE.Lantern : PALETTE.Deepwater,
                    color: timeScale === s ? PALETTE.Tar : PALETTE.Bone,
                    border: 'none',
                    borderRadius: '2px',
                    fontSize: '11px',
                    fontWeight: timeScale === s ? 'bold' : 'normal',
                    cursor: 'pointer',
                  }}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Swap Role */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', color: PALETTE.Ash, marginBottom: '6px' }}>ROLE SELECTION:</div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['navigator', 'quartermaster', 'deckhand'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setPlayerRole(r);
                    useLoopStore.getState().grantRoleStartingInventory();
                  }}
                  style={{
                    flex: 1,
                    padding: '4px',
                    backgroundColor: playerRole === r ? PALETTE.TideGlow : PALETTE.Deepwater,
                    color: playerRole === r ? PALETTE.Tar : PALETTE.Bone,
                    border: 'none',
                    borderRadius: '2px',
                    fontSize: '10px',
                    fontWeight: playerRole === r ? 'bold' : 'normal',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {r.slice(0, 5)}
                </button>
              ))}
            </div>
          </div>

          {/* Knowledge Flags */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', color: PALETTE.Ash, marginBottom: '6px' }}>ADD KNOWLEDGE FLAG:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {testFlags.map((flag) => {
                const has = knowledge.includes(flag);
                return (
                  <button
                    key={flag}
                    onClick={() => addKnowledge(flag)}
                    style={{
                      padding: '3px 6px',
                      backgroundColor: has ? 'rgba(95, 211, 196, 0.2)' : PALETTE.Deepwater,
                      color: has ? PALETTE.TideGlow : PALETTE.Bone,
                      border: `1px solid ${has ? PALETTE.TideGlow : '#1a4253'}`,
                      borderRadius: '2px',
                      fontSize: '10px',
                      cursor: 'pointer',
                    }}
                  >
                    {has ? `✓ ${flag}` : `+ ${flag}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* P6 Puzzle Shortcuts (Requirement 9) */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', color: PALETTE.Ash, marginBottom: '6px' }}>P6 PUZZLE SHORTCUTS:</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
              <button
                onClick={() => {
                  useLoopStore.getState().addItem('Silver Locket');
                }}
                style={{
                  padding: '5px 4px',
                  backgroundColor: PALETTE.Deepwater,
                  color: PALETTE.Bone,
                  border: '1px solid #1a4253',
                  borderRadius: '2px',
                  fontSize: '10px',
                  cursor: 'pointer',
                }}
              >
                + Give Locket
              </button>
              <button
                onClick={() => {
                  useLoopStore.getState().addItem('Helm Key');
                }}
                style={{
                  padding: '5px 4px',
                  backgroundColor: PALETTE.Deepwater,
                  color: PALETTE.Bone,
                  border: '1px solid #1a4253',
                  borderRadius: '2px',
                  fontSize: '10px',
                  cursor: 'pointer',
                }}
              >
                + Give Helm Key
              </button>
              <button
                onClick={() => {
                  const loopStore = useLoopStore.getState();
                  loopStore.openStrongbox();
                  loopStore.addItem('Helm Key');
                  loopStore.addItem('Armory Key');
                  addKnowledge('CLUE_LOCKET_STRONGBOX');
                }}
                style={{
                  padding: '5px 4px',
                  backgroundColor: PALETTE.Deepwater,
                  color: PALETTE.Lantern,
                  border: `1px solid ${PALETTE.Lantern}`,
                  borderRadius: '2px',
                  fontSize: '10px',
                  cursor: 'pointer',
                }}
              >
                🔓 Open Strongbox
              </button>
              <button
                onClick={() => {
                  setShipTime(355);
                }}
                style={{
                  padding: '5px 4px',
                  backgroundColor: PALETTE.Deepwater,
                  color: PALETTE.BloodRust,
                  border: `1px solid ${PALETTE.BloodRust}`,
                  borderRadius: '2px',
                  fontSize: '10px',
                  cursor: 'pointer',
                }}
              >
                ⏩ Jump to 355s
              </button>
            </div>
          </div>

          {/* P7 Ending & Winch Shortcuts */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', color: PALETTE.Ash, marginBottom: '6px' }}>P7 HERO'S SACRIFICE SHORTCUTS:</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
              <button
                id="btn-dev-give-chant"
                onClick={() => {
                  addKnowledge('K_CHANT');
                }}
                style={{
                  padding: '5px 4px',
                  backgroundColor: PALETTE.Deepwater,
                  color: PALETTE.Lantern,
                  border: `1px solid ${PALETTE.Lantern}`,
                  borderRadius: '2px',
                  fontSize: '10px',
                  cursor: 'pointer',
                }}
              >
                Give K_CHANT
              </button>
              <button
                id="btn-dev-launch-boats"
                onClick={() => {
                  useLoopStore.getState().launchLifeboats();
                }}
                style={{
                  padding: '5px 4px',
                  backgroundColor: PALETTE.Deepwater,
                  color: PALETTE.TideGlow,
                  border: `1px solid ${PALETTE.TideGlow}`,
                  borderRadius: '2px',
                  fontSize: '10px',
                  cursor: 'pointer',
                }}
              >
                Launch boats
              </button>
              <button
                id="btn-dev-jump-560"
                onClick={() => {
                  setShipTime(560);
                }}
                style={{
                  padding: '5px 4px',
                  backgroundColor: PALETTE.Deepwater,
                  color: PALETTE.Bone,
                  border: '1px solid #1a4253',
                  borderRadius: '2px',
                  fontSize: '10px',
                  cursor: 'pointer',
                }}
              >
                Jump 560
              </button>
              <button
                id="btn-dev-trigger-ending"
                onClick={() => {
                  useMemoryStore.getState().recordEnding('hero');
                  useUIStore.getState().playCutscene('ending_hero', () => {
                    useUIStore.getState().setGameScreen('title');
                  });
                }}
                style={{
                  padding: '5px 4px',
                  backgroundColor: 'rgba(242, 165, 65, 0.2)',
                  color: PALETTE.Lantern,
                  border: `1px solid ${PALETTE.Lantern}`,
                  borderRadius: '2px',
                  fontSize: '10px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Trigger ending_hero
              </button>
              <button
                id="btn-dev-trigger-coward"
                onClick={() => {
                  useMemoryStore.getState().recordEnding('coward');
                  useUIStore.getState().playCutscene('ending_coward', () => {
                    useUIStore.getState().setGameScreen('title');
                  });
                }}
                style={{
                  padding: '5px 4px',
                  backgroundColor: 'rgba(178, 58, 58, 0.2)',
                  color: PALETTE.BloodRust,
                  border: `1px solid ${PALETTE.BloodRust}`,
                  borderRadius: '2px',
                  fontSize: '10px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Trigger ending_coward
              </button>
              <button
                id="btn-dev-trigger-mutineer"
                onClick={() => {
                  useMemoryStore.getState().recordEnding('mutineer');
                  useUIStore.getState().playCutscene('ending_mutineer', () => {
                    useUIStore.getState().setGameScreen('title');
                  });
                }}
                style={{
                  padding: '5px 4px',
                  backgroundColor: 'rgba(242, 165, 65, 0.2)',
                  color: PALETTE.Lantern,
                  border: `1px solid ${PALETTE.Lantern}`,
                  borderRadius: '2px',
                  fontSize: '10px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Trigger ending_mutineer
              </button>
              <button
                id="btn-dev-trigger-drowned"
                onClick={() => {
                  useMemoryStore.getState().recordEnding('drowned');
                  useUIStore.getState().playCutscene('ending_drowned', () => {
                    useUIStore.getState().setGameScreen('title');
                  });
                }}
                style={{
                  padding: '5px 4px',
                  backgroundColor: 'rgba(95, 211, 196, 0.2)',
                  color: PALETTE.TideGlow,
                  border: `1px solid ${PALETTE.TideGlow}`,
                  borderRadius: '2px',
                  fontSize: '10px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Trigger ending_drowned
              </button>
              <button
                id="btn-dev-set-death-19"
                onClick={() => {
                  useMemoryStore.setState({ deathCount: 19 });
                }}
                style={{
                  padding: '5px 4px',
                  backgroundColor: PALETTE.Deepwater,
                  color: PALETTE.Bone,
                  border: '1px solid #1a4253',
                  borderRadius: '2px',
                  fontSize: '10px',
                  cursor: 'pointer',
                }}
              >
                Set DeathCount=19
              </button>
              <button
                id="btn-dev-neutralize-hari"
                onClick={() => {
                  const curr = useLoopStore.getState().hariNeutralized;
                  useLoopStore.getState().setHariNeutralized(!curr);
                }}
                style={{
                  padding: '5px 4px',
                  backgroundColor: PALETTE.Deepwater,
                  color: PALETTE.TideGlow,
                  border: `1px solid ${PALETTE.TideGlow}`,
                  borderRadius: '2px',
                  fontSize: '10px',
                  cursor: 'pointer',
                }}
              >
                Toggle Hari Neutralized
              </button>
            </div>
          </div>

          {/* Loop & Game Reset Controls (BUG 2) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              onClick={onRestartLoop}
              style={{
                width: '100%',
                padding: '6px',
                backgroundColor: PALETTE.Deepwater,
                color: PALETTE.Bone,
                border: `1px solid ${PALETTE.Lantern}`,
                borderRadius: '3px',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              🔄 RESTART LOOP
            </button>
            <button
              onClick={onFullReset}
              style={{
                width: '100%',
                padding: '6px',
                backgroundColor: 'rgba(178, 58, 58, 0.15)',
                color: PALETTE.BloodRust,
                border: `1px solid ${PALETTE.BloodRust}`,
                borderRadius: '3px',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              ⚠️ NEW GAME (FULL RESET) [R]
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

