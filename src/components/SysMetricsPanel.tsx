import React from 'react';
import { WindowNode } from '../types';

interface SysMetricsPanelProps {
  localNode: WindowNode;
  activeCount: number;
  nearestDistance: number;
  attractionForce: number;
  isSimulatedActive: boolean;
  onToggleSimulated: () => void;
  onLaunchNewWindow: () => void;
}

export const SysMetricsPanel: React.FC<SysMetricsPanelProps> = ({
  localNode,
  activeCount,
  nearestDistance,
  attractionForce,
  isSimulatedActive,
  onToggleSimulated,
  onLaunchNewWindow,
}) => {
  const coordX = (localNode.x || 0).toFixed(1).padStart(5, '0');
  const coordY = (localNode.y || 0).toFixed(1).padStart(5, '0');
  const hasNeighbors = activeCount > 1;

  let statusText = 'ISOLATED';
  let statusColor = 'text-cyan-400/70';

  if (hasNeighbors) {
    if (nearestDistance < 160) {
      statusText = 'COLLIDING';
      statusColor = 'text-rose-400 animate-pulse';
    } else if (nearestDistance < 400) {
      statusText = 'HIGH ENTANGLEMENT';
      statusColor = 'text-cyan-300 animate-pulse';
    } else if (nearestDistance < 900) {
      statusText = 'ATTRACTING';
      statusColor = 'text-indigo-300';
    } else {
      statusText = 'NETWORKED';
      statusColor = 'text-cyan-400/80';
    }
  }

  return (
    <div
      id="sys-metrics-panel"
      className="absolute right-6 sm:right-8 top-20 sm:top-24 hud-panel p-4 rounded-lg w-68 sm:w-72 z-30 transition-all duration-300 text-xs select-none"
    >
      {/* Header */}
      <div className="font-label-mono text-label-mono text-primary mb-3 flex items-center justify-between border-b border-cyan-400/20 pb-2">
        <div className="flex items-center">
          <span className="w-2 h-2 rounded-full bg-cyan-400 mr-2 animate-pulse shadow-[0_0_8px_#00f0ff]" />
          <span className="font-bold tracking-wider text-cyan-300">SYS_METRICS</span>
        </div>
        <span className={`font-mono text-[10px] tracking-tight font-semibold uppercase ${statusColor}`}>
          {statusText}
        </span>
      </div>

      {/* Metrics Readout */}
      <div className="space-y-2 mt-2 font-label-mono">
        <div className="flex justify-between text-neutral-300">
          <span className="text-neutral-400">COORD_X:</span>
          <span id="coord-x" className="text-cyan-300 font-semibold">{coordX}</span>
        </div>

        <div className="flex justify-between text-neutral-300">
          <span className="text-neutral-400">COORD_Y:</span>
          <span id="coord-y" className="text-cyan-300 font-semibold">{coordY}</span>
        </div>

        <div className="flex justify-between text-neutral-300">
          <span className="text-neutral-400">ACTIVE_NODES:</span>
          <span id="node-count" className="text-cyan-300 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
            {activeCount}
          </span>
        </div>

        {hasNeighbors && (
          <>
            <div className="flex justify-between text-neutral-300 pt-1 border-t border-cyan-500/10">
              <span className="text-neutral-400">NEAREST_DIST:</span>
              <span className="text-indigo-300 font-mono">
                {nearestDistance < 9999 ? `${Math.round(nearestDistance)}px` : '---'}
              </span>
            </div>
            <div className="flex justify-between text-neutral-300">
              <span className="text-neutral-400">GRAV_TENSION:</span>
              <span className="text-indigo-300 font-mono">
                {(attractionForce * 10).toFixed(1)} N/m
              </span>
            </div>
          </>
        )}
      </div>

      {/* Instant Testing Helper / Drag Simulator */}
      <div className="mt-4 pt-3 border-t border-cyan-400/15 flex flex-col gap-2">
        <button
          id="btn-toggle-simulated"
          onClick={onToggleSimulated}
          className={`w-full py-1.5 px-2.5 rounded font-label-mono text-[11px] tracking-wider transition-all flex items-center justify-between border ${
            isSimulatedActive
              ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.25)]'
              : 'bg-neutral-900/60 text-neutral-300 hover:text-cyan-300 border-neutral-700 hover:border-cyan-500/40'
          }`}
          title="Drag a simulated window tab right inside this screen to test collision instantly"
        >
          <span>{isSimulatedActive ? '● SIMULATOR DRAG ACTIVE' : '+ TEST WITH VIRTUAL TAB'}</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-400/30 text-cyan-300">
            {isSimulatedActive ? 'DRAGGABLE' : 'PREVIEW'}
          </span>
        </button>

        <button
          id="btn-launch-window"
          onClick={onLaunchNewWindow}
          className="w-full py-1 px-2.5 rounded font-label-mono text-[10px] tracking-wider transition-all bg-neutral-900/40 hover:bg-neutral-800 text-neutral-400 hover:text-cyan-300 border border-neutral-800 hover:border-cyan-500/30 text-center flex items-center justify-center gap-1.5"
          title="Open a real second browser window side-by-side to drag windows across screens"
        >
          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          <span>LAUNCH SEPARATE WINDOW</span>
        </button>
      </div>
    </div>
  );
};
