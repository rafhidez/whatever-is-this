import React from 'react';

interface AttractorCoreProps {
  label?: string;
  displacementX: number;
  displacementY: number;
  forceMagnitude: number;
  isColliding?: boolean;
}

export const AttractorCore: React.FC<AttractorCoreProps> = ({
  label = 'ATTRACTOR_01',
  displacementX,
  displacementY,
  forceMagnitude,
  isColliding = false,
}) => {
  // Scale dynamically during intense attraction or collision
  const scale = 1 + Math.min(forceMagnitude * 0.05, 0.25) + (isColliding ? 0.15 : 0);
  const borderColor = isColliding
    ? '#ff4b4b'
    : forceMagnitude > 1.0
    ? '#00f0ff'
    : 'rgba(0, 240, 255, 0.7)';
  const glow = isColliding
    ? '0 0 45px rgba(255, 75, 75, 0.6)'
    : forceMagnitude > 1.0
    ? '0 0 40px rgba(0, 240, 255, 0.5)'
    : '0 0 30px rgba(0, 240, 255, 0.25)';

  return (
    <div
      id="main-core"
      className="absolute left-1/2 top-1/2 pointer-events-auto flex items-center justify-center transition-transform duration-75 z-10"
      style={{
        transform: `translate(calc(-50% + ${displacementX}px), calc(-50% + ${displacementY}px)) scale(${scale})`,
      }}
    >
      {/* Outer Orbital Ring 2 */}
      <div
        className="absolute rounded-full pointer-events-none animate-spin-reverse"
        style={{
          width: '400px',
          height: '400px',
          border: '1px solid rgba(0, 240, 255, 0.18)',
        }}
      />

      {/* Inner Orbital Ring 1 */}
      <div
        className="absolute rounded-full pointer-events-none animate-spin-slow"
        style={{
          width: '300px',
          height: '300px',
          border: '1px dashed rgba(0, 240, 255, 0.35)',
        }}
      />

      {/* Pulsing Energy Aura */}
      <div
        className="absolute rounded-full animate-pulse-glow pointer-events-none"
        style={{
          width: '240px',
          height: '240px',
          background: 'radial-gradient(circle, rgba(0, 240, 255, 0.12) 0%, transparent 75%)',
        }}
      />

      {/* Core Body */}
      <div
        className="w-[200px] h-[200px] rounded-full flex items-center justify-center relative cursor-grab active:cursor-grabbing select-none"
        style={{
          background: 'radial-gradient(circle, rgba(219, 252, 255, 0.15) 0%, rgba(19, 19, 20, 0.4) 65%, transparent 72%)',
          border: `1px solid ${borderColor}`,
          boxShadow: glow,
        }}
      >
        {/* Core Center Emblem */}
        <div className="absolute w-8 h-8 rounded-full border border-cyan-400/40 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-300 animate-ping opacity-75" />
          <div className="w-2 h-2 rounded-full bg-cyan-300 absolute" />
        </div>

        {/* HUD Label */}
        <div className="font-label-mono text-[12px] tracking-widest text-[#dbfcff] bg-[#131314]/85 px-3 py-1 rounded border border-cyan-400/30 backdrop-blur-md shadow-lg pointer-events-none z-10 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          {label}
        </div>
      </div>
    </div>
  );
};
