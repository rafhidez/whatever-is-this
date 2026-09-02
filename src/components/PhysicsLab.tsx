import React, { useState } from 'react';
import { CollisionEvent, PhysicsConfig, TelemetryLog } from '../types';
import { soundEngine } from '../utils/audio';

interface PhysicsLabProps {
  physics: PhysicsConfig;
  onUpdatePhysics: (updated: Partial<PhysicsConfig>) => void;
  collisionHistory: CollisionEvent[];
  telemetryLogs: TelemetryLog[];
  onClearHistory: () => void;
}

export const PhysicsLab: React.FC<PhysicsLabProps> = ({
  physics,
  onUpdatePhysics,
  collisionHistory,
  telemetryLogs,
  onClearHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'controls' | 'archive' | 'terminal' | 'about'>('controls');

  return (
    <div className="w-full h-full min-h-screen pt-20 px-4 md:px-12 pb-16 overflow-y-auto bg-[#131314] text-[#e5e2e3]">
      <div className="max-w-[1440px] mx-auto">
        {/* Lab Header */}
        <div className="border-b border-cyan-400/20 pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 font-label-mono text-xs text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>SUBSYSTEM / LAB_042</span>
            </div>
            <h1 className="font-headline text-2xl md:text-4xl font-bold tracking-tight text-white">
              Interactive Physics Lab & Telemetry
            </h1>
            <p className="font-body text-sm text-[#b9cacb] mt-1 max-w-2xl">
              Calibrate gravitational constants, collision restitution matrices, and inspect cross-window telemetry streaming between active quantum observers.
            </p>
          </div>

          {/* Sub-navigation tabs */}
          <div className="flex items-center gap-2 bg-[#1c1b1c] p-1 rounded-lg border border-cyan-400/20 font-label-mono text-xs">
            <button
              onClick={() => setActiveTab('controls')}
              className={`px-3 py-1.5 rounded transition-all ${
                activeTab === 'controls'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                  : 'text-[#b9cacb] hover:text-white'
              }`}
            >
              PHYSICS_TUNING
            </button>
            <button
              onClick={() => setActiveTab('archive')}
              className={`px-3 py-1.5 rounded transition-all ${
                activeTab === 'archive'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                  : 'text-[#b9cacb] hover:text-white'
              }`}
            >
              COLLISION_ARCHIVE ({collisionHistory.length})
            </button>
            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-3 py-1.5 rounded transition-all ${
                activeTab === 'terminal'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                  : 'text-[#b9cacb] hover:text-white'
              }`}
            >
              SYS_TERMINAL
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-3 py-1.5 rounded transition-all ${
                activeTab === 'about'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                  : 'text-[#b9cacb] hover:text-white'
              }`}
            >
              ABOUT_EXPERIMENT
            </button>
          </div>
        </div>

        {/* Tab 1: Physics Tuning Controls */}
        {activeTab === 'controls' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Module: Gravitational Dynamics */}
            <div className="hud-panel p-6 rounded-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-cyan-400/20 pb-2">
                  <span className="font-label-mono text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">all_inclusive</span>
                    GRAVITATIONAL_FIELD
                  </span>
                  <span className="font-label-mono text-xs text-neutral-400">
                    {physics.gravityStrength.toFixed(2)} G
                  </span>
                </div>

                <p className="text-xs text-[#b9cacb] mb-4">
                  Controls the cross-window attraction acceleration pulling particles and attractor cores toward adjacent browser tabs.
                </p>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-label-mono text-neutral-300 mb-1">
                      <span>ATTRACTION COEFFICIENT:</span>
                      <span className="text-cyan-300">{physics.gravityStrength}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="3.0"
                      step="0.1"
                      value={physics.gravityStrength}
                      onChange={(e) => onUpdatePhysics({ gravityStrength: parseFloat(e.target.value) })}
                      className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-label-mono text-neutral-300 mb-1">
                      <span>SWARM DENSITY:</span>
                      <span className="text-cyan-300">{physics.particleCount} PARTICLES</span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="320"
                      step="20"
                      value={physics.particleCount}
                      onChange={(e) => onUpdatePhysics({ particleCount: parseInt(e.target.value) })}
                      className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-cyan-500/15 flex gap-2">
                <button
                  onClick={() => onUpdatePhysics({ gravityStrength: 0.5 })}
                  className="px-2.5 py-1 rounded text-[11px] font-label-mono bg-neutral-900 border border-neutral-700 hover:border-cyan-400 text-neutral-300 hover:text-cyan-300"
                >
                  LIGHT (0.5G)
                </button>
                <button
                  onClick={() => onUpdatePhysics({ gravityStrength: 1.0 })}
                  className="px-2.5 py-1 rounded text-[11px] font-label-mono bg-neutral-900 border border-neutral-700 hover:border-cyan-400 text-neutral-300 hover:text-cyan-300"
                >
                  DEFAULT (1.0G)
                </button>
                <button
                  onClick={() => onUpdatePhysics({ gravityStrength: 2.5 })}
                  className="px-2.5 py-1 rounded text-[11px] font-label-mono bg-neutral-900 border border-neutral-700 hover:border-cyan-400 text-neutral-300 hover:text-cyan-300"
                >
                  HYPER (2.5G)
                </button>
              </div>
            </div>

            {/* Module: Collision & Elasticity */}
            <div className="hud-panel p-6 rounded-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-cyan-400/20 pb-2">
                  <span className="font-label-mono text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">crisis_alert</span>
                    COLLISION_RESTITUTION
                  </span>
                  <span className="font-label-mono text-xs text-neutral-400">
                    e = {physics.elasticity.toFixed(2)}
                  </span>
                </div>

                <p className="text-xs text-[#b9cacb] mb-4">
                  Dictates the recoil impulse and spring recoil momentum when two window attractor cores collide with each other.
                </p>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-label-mono text-neutral-300 mb-1">
                      <span>ELASTIC REBOUND (e):</span>
                      <span className="text-cyan-300">{physics.elasticity}</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="1.8"
                      step="0.1"
                      value={physics.elasticity}
                      onChange={(e) => onUpdatePhysics({ elasticity: parseFloat(e.target.value) })}
                      className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-label-mono text-neutral-300 mb-1">
                      <span>COLLISION THRESHOLD:</span>
                      <span className="text-cyan-300">{physics.collisionRadius * 2} PX</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="120"
                      step="5"
                      value={physics.collisionRadius}
                      onChange={(e) => onUpdatePhysics({ collisionRadius: parseInt(e.target.value) })}
                      className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-cyan-500/15 flex gap-2">
                <button
                  onClick={() => onUpdatePhysics({ elasticity: 0.4 })}
                  className="px-2.5 py-1 rounded text-[11px] font-label-mono bg-neutral-900 border border-neutral-700 hover:border-cyan-400 text-neutral-300 hover:text-cyan-300"
                >
                  DAMPED (0.4)
                </button>
                <button
                  onClick={() => onUpdatePhysics({ elasticity: 0.9 })}
                  className="px-2.5 py-1 rounded text-[11px] font-label-mono bg-neutral-900 border border-neutral-700 hover:border-cyan-400 text-neutral-300 hover:text-cyan-300"
                >
                  ELASTIC (0.9)
                </button>
                <button
                  onClick={() => onUpdatePhysics({ elasticity: 1.5 })}
                  className="px-2.5 py-1 rounded text-[11px] font-label-mono bg-neutral-900 border border-neutral-700 hover:border-cyan-400 text-neutral-300 hover:text-cyan-300"
                >
                  EXPLOSIVE (1.5)
                </button>
              </div>
            </div>

            {/* Module: Visual Spectrum & Audio */}
            <div className="hud-panel p-6 rounded-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-cyan-400/20 pb-2">
                  <span className="font-label-mono text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">palette</span>
                    FIELD_SPECTRUM & AUDIO
                  </span>
                  <span className="font-label-mono text-xs text-neutral-400 uppercase">
                    {physics.colorTheme}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-label-mono text-neutral-300 mb-2">
                      COLOR PROFILE:
                    </label>
                    <div className="grid grid-cols-2 gap-2 font-label-mono text-xs">
                      {(['cyan', 'violet', 'amber', 'emerald'] as const).map((theme) => (
                        <button
                          key={theme}
                          onClick={() => onUpdatePhysics({ colorTheme: theme })}
                          className={`py-1.5 px-3 rounded border text-left flex items-center gap-2 transition-all ${
                            physics.colorTheme === theme
                              ? 'border-cyan-400 bg-cyan-950/50 text-cyan-200'
                              : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
                          }`}
                        >
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              theme === 'cyan'
                                ? 'bg-cyan-400'
                                : theme === 'violet'
                                ? 'bg-indigo-400'
                                : theme === 'amber'
                                ? 'bg-amber-400'
                                : 'bg-emerald-400'
                            }`}
                          />
                          <span className="uppercase">{theme}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-label-mono text-neutral-300">
                        QUANTUM AUDIO SYNTHESIS:
                      </span>
                      <button
                        onClick={() => {
                          const next = !physics.soundEnabled;
                          soundEngine.enabled = next;
                          onUpdatePhysics({ soundEnabled: next });
                        }}
                        className={`px-3 py-1 rounded text-xs font-label-mono border transition-all ${
                          physics.soundEnabled
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                            : 'bg-neutral-900 text-neutral-500 border-neutral-800'
                        }`}
                      >
                        {physics.soundEnabled ? 'ENABLED' : 'MUTED'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-cyan-500/15">
                <div className="text-[11px] font-mono text-neutral-400">
                  Interactive Web Audio synthesizes sub-bass impact thump, metallic plasma ring, and proximity tension.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Collision Archive */}
        {activeTab === 'archive' && (
          <div className="hud-panel p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4 border-b border-cyan-400/20 pb-3">
              <div>
                <h2 className="font-label-mono text-sm font-bold text-cyan-300 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">history</span>
                  RECORDED_COLLISION_EVENTS
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5 font-body">
                  High-velocity collision logs captured when browser tabs or virtual nodes collided.
                </p>
              </div>

              {collisionHistory.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="font-label-mono text-xs px-3 py-1 rounded bg-rose-950/40 border border-rose-800/60 text-rose-300 hover:bg-rose-900/60 transition-colors"
                >
                  CLEAR_ARCHIVE
                </button>
              )}
            </div>

            {collisionHistory.length === 0 ? (
              <div className="py-16 text-center">
                <span className="material-symbols-outlined text-4xl text-neutral-600 mb-2">
                  hourglass_empty
                </span>
                <p className="font-label-mono text-xs text-neutral-400">
                  NO COLLISION EVENTS RECORDED YET
                </p>
                <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
                  Drag two browser tabs towards each other or use the "+ Test with Virtual Tab" simulator on the Experiment screen to generate collision impact records!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-label-mono text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-800 text-neutral-400 text-[11px]">
                      <th className="py-2.5 px-3">EVENT_ID</th>
                      <th className="py-2.5 px-3">TIME</th>
                      <th className="py-2.5 px-3">NODE_A</th>
                      <th className="py-2.5 px-3">NODE_B</th>
                      <th className="py-2.5 px-3">RELATIVE_VELOCITY</th>
                      <th className="py-2.5 px-3">IMPACT_FORCE</th>
                      <th className="py-2.5 px-3">SCREEN_DISTANCE</th>
                      <th className="py-2.5 px-3">IMPACT_COORDS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900/80">
                    {collisionHistory.map((evt) => (
                      <tr key={evt.id} className="hover:bg-cyan-950/20 transition-colors">
                        <td className="py-2.5 px-3 text-cyan-300 font-semibold">{evt.id}</td>
                        <td className="py-2.5 px-3 text-neutral-400">{evt.timestamp}</td>
                        <td className="py-2.5 px-3 text-indigo-300">{evt.nodeA}</td>
                        <td className="py-2.5 px-3 text-indigo-300">{evt.nodeB}</td>
                        <td className="py-2.5 px-3 text-neutral-300">{evt.relativeVelocity} px/s</td>
                        <td className="py-2.5 px-3 text-rose-300 font-semibold">{evt.impactForce} N</td>
                        <td className="py-2.5 px-3 text-neutral-300">{evt.screenDistance} px</td>
                        <td className="py-2.5 px-3 text-neutral-400">
                          X:{evt.location.x}, Y:{evt.location.y}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Terminal Stream */}
        {activeTab === 'terminal' && (
          <div className="hud-panel p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4 border-b border-cyan-400/20 pb-3">
              <div className="flex items-center gap-2 font-label-mono text-sm font-bold text-cyan-300">
                <span className="material-symbols-outlined text-[18px]">terminal</span>
                <span>REALTIME_TELEMETRY_STREAM</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-2" />
              </div>
              <span className="font-label-mono text-[11px] text-neutral-400">
                BROADCAST_CHANNEL: quantum_observer_mesh
              </span>
            </div>

            <div className="bg-[#0b0b0c] p-4 rounded border border-neutral-800 font-label-mono text-xs h-96 overflow-y-auto space-y-1.5 shadow-inner">
              {telemetryLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-neutral-500 select-none">[{log.timestamp}]</span>
                  <span
                    className={`font-semibold uppercase ${
                      log.level === 'collision'
                        ? 'text-rose-400'
                        : log.level === 'warn'
                        ? 'text-amber-400'
                        : log.level === 'sync'
                        ? 'text-indigo-300'
                        : 'text-cyan-300'
                    }`}
                  >
                    [{log.level}]
                  </span>
                  <span className="text-neutral-300">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: About Experiment */}
        {activeTab === 'about' && (
          <div className="hud-panel p-8 rounded-lg max-w-4xl">
            <h2 className="font-headline text-2xl font-bold text-white mb-4">
              Cross-Window Particle Collisions & Quantum Entanglement
            </h2>
            <div className="space-y-4 font-body text-sm text-[#b9cacb] leading-relaxed">
              <p>
                <strong>Quantum Observer</strong> explores cross-window spatial computing in standard modern web browsers. By querying screen coordinates (<code className="text-cyan-300 bg-neutral-900 px-1 py-0.5 rounded">window.screenX</code> and <code className="text-cyan-300 bg-neutral-900 px-1 py-0.5 rounded">window.screenY</code>), each tab computes its precise physical position on the user's monitor matrix.
              </p>
              <p>
                Using inter-tab synchronization (<code className="text-cyan-300 bg-neutral-900 px-1 py-0.5 rounded">BroadcastChannel</code> and <code className="text-cyan-300 bg-neutral-900 px-1 py-0.5 rounded">localStorage</code>), multiple open tabs transmit their attractor locations to one another in real time.
              </p>
              <div className="p-4 bg-cyan-950/30 border border-cyan-400/20 rounded-lg font-label-mono text-xs text-cyan-200">
                <strong>HOW TO TEST MULTI-WINDOW COLLISION:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1 text-neutral-300">
                  <li>Open this web application in two separate browser tabs or windows.</li>
                  <li>Position both windows next to each other on your screen.</li>
                  <li>Drag one window towards the other: as they approach, watch particles pull into an inter-window gravitational bridge!</li>
                  <li>When you overlap or bump the windows together, an elastic collision shockwave explodes with recoil physics!</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
