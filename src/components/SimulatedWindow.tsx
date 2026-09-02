import React, { useState, useEffect, useRef } from 'react';
import { WindowNode } from '../types';

interface SimulatedWindowProps {
  localNode: WindowNode;
  onUpdatePosition: (node: WindowNode) => void;
  onClose: () => void;
}

export const SimulatedWindow: React.FC<SimulatedWindowProps> = ({
  localNode,
  onUpdatePosition,
  onClose,
}) => {
  // Start positioned slightly offset to the left
  const [pos, setPos] = useState<{ x: number; y: number }>({
    x: Math.max(40, window.innerWidth / 2 - 380),
    y: Math.max(120, window.innerHeight / 2 - 140),
  });

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
  });

  const winWidth = 320;
  const winHeight = 260;

  // Broadcast position to multi-window manager
  useEffect(() => {
    // Center of this simulated window in screen coordinates
    const globalX = localNode.x + pos.x + winWidth / 2;
    const globalY = localNode.y + pos.y + winHeight / 2;

    const simNode: WindowNode = {
      id: 'SIMULATED_TAB_02',
      label: 'ATTRACTOR_02',
      x: localNode.x + pos.x,
      y: localNode.y + pos.y,
      width: winWidth,
      height: winHeight,
      coreGlobalX: globalX,
      coreGlobalY: globalY,
      color: '#c3c0ff',
      timestamp: Date.now(),
      isSimulated: true,
    };

    onUpdatePosition(simNode);
  }, [pos, localNode.x, localNode.y, onUpdatePosition]);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: pos.x,
      startY: pos.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.mouseX;
    const dy = e.clientY - dragStartRef.current.mouseY;

    setPos({
      x: dragStartRef.current.startX + dx,
      y: dragStartRef.current.startY + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  return (
    <div
      id="simulated-browser-tab"
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        width: `${winWidth}px`,
        height: `${winHeight}px`,
      }}
      className="absolute top-0 left-0 z-40 rounded-lg overflow-hidden border border-indigo-400/40 bg-[#131314]/90 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.7),0_0_25px_rgba(195,192,255,0.15)] flex flex-col select-none touch-none animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Browser Tab Chrome / Draggable Bar */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="h-9 bg-[#1c1b1c] border-b border-indigo-400/25 px-3 flex items-center justify-between cursor-move text-xs"
      >
        <div className="flex items-center gap-2">
          {/* Traffic dots */}
          <button
            onClick={onClose}
            className="w-2.5 h-2.5 rounded-full bg-rose-500/80 hover:bg-rose-400 transition-colors"
            title="Close Virtual Window"
          />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />

          {/* Tab chip */}
          <div className="ml-2 font-label-mono text-[10px] text-indigo-200 tracking-wider flex items-center gap-1 bg-[#131314] px-2 py-0.5 rounded border border-indigo-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            TAB_02 : QUANTUM_OBSERVER
          </div>
        </div>

        <div className="text-[10px] font-label-mono text-neutral-400 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">drag_pan</span>
          <span className="hidden sm:inline">DRAG ME</span>
        </div>
      </div>

      {/* Simulated Tab Viewport */}
      <div className="flex-1 relative flex items-center justify-center bg-gradient-to-b from-[#131314]/80 to-[#0e0e0f]">
        {/* Helper Hint */}
        <div className="absolute top-2 left-3 font-label-mono text-[9px] text-indigo-300/60 tracking-wider">
          DRAG OVER ATTRACTOR_01 TO COLLIDE
        </div>

        {/* Mini Orbital Core */}
        <div className="relative flex items-center justify-center pointer-events-none">
          {/* Orbital ring */}
          <div className="w-28 h-28 rounded-full border border-indigo-400/30 border-dashed animate-spin-slow absolute" />
          <div className="w-36 h-36 rounded-full border border-indigo-400/15 animate-spin-reverse absolute" />

          {/* Core circle */}
          <div className="w-20 h-20 rounded-full border border-indigo-400/60 bg-gradient-to-br from-indigo-500/20 to-transparent flex items-center justify-center shadow-[0_0_20px_rgba(195,192,255,0.3)]">
            <div className="font-label-mono text-[10px] text-indigo-200 tracking-widest bg-[#131314]/80 px-1.5 py-0.5 rounded border border-indigo-400/30">
              ATTRACTOR_02
            </div>
          </div>
        </div>

        {/* Coordinate indicator at bottom */}
        <div className="absolute bottom-2 right-3 font-label-mono text-[9px] text-neutral-400">
          X:{Math.round(pos.x)} Y:{Math.round(pos.y)}
        </div>
      </div>
    </div>
  );
};
