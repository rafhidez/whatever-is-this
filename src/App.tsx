/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CollisionEvent,
  PhysicsConfig,
  ScreenType,
  TelemetryLog,
  TransitionDirection,
  WindowNode,
} from './types';
import { multiWindowManager, LOCAL_NODE_ID } from './utils/multiWindow';
import { BackgroundShader } from './components/BackgroundShader';
import { TopNav } from './components/TopNav';
import { ParticleCanvas } from './components/ParticleCanvas';
import { AttractorCore } from './components/AttractorCore';
import { SysMetricsPanel } from './components/SysMetricsPanel';
import { SimulatedWindow } from './components/SimulatedWindow';
import { PhysicsLab } from './components/PhysicsLab';

const DEFAULT_PHYSICS: PhysicsConfig = {
  gravityStrength: 1.0,
  collisionRadius: 80,
  elasticity: 0.9,
  particleCount: 160,
  damping: 0.9,
  beamTension: 1.0,
  trailLength: 0.85,
  soundEnabled: true,
  colorTheme: 'cyan',
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('experiment');
  const [transitionDir, setTransitionDir] = useState<TransitionDirection>('push');

  const [localNode, setLocalNode] = useState<WindowNode>(() => ({
    id: LOCAL_NODE_ID,
    label: 'ATTRACTOR_01',
    x: typeof window !== 'undefined' ? window.screenX : 0,
    y: typeof window !== 'undefined' ? window.screenY : 0,
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
    coreGlobalX: 0,
    coreGlobalY: 0,
    color: '#00f0ff',
    timestamp: Date.now(),
  }));

  const [remoteNodes, setRemoteNodes] = useState<WindowNode[]>([]);
  const [physics, setPhysics] = useState<PhysicsConfig>(DEFAULT_PHYSICS);
  const [isSimulatedActive, setIsSimulatedActive] = useState<boolean>(true); // start enabled so user sees multi-window collision immediately!

  // Visual displacement of local core
  const [coreDisplacement, setCoreDisplacement] = useState<{ x: number; y: number; force: number }>({
    x: 0,
    y: 0,
    force: 0,
  });

  const [nearestDist, setNearestDist] = useState<number>(99999);
  const [attractionForce, setAttractionForce] = useState<number>(0);
  const [isColliding, setIsColliding] = useState<boolean>(false);

  // History and logs
  const [collisionHistory, setCollisionHistory] = useState<CollisionEvent[]>([]);
  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryLog[]>(() => [
    {
      id: 'INIT_LOG_01',
      timestamp: new Date().toLocaleTimeString(),
      message: `Observer node ${LOCAL_NODE_ID} initialized with screen coordinates matrix.`,
      level: 'info',
    },
    {
      id: 'INIT_LOG_02',
      timestamp: new Date().toLocaleTimeString(),
      message: 'Quantum gravitational mesh active. Multi-window BroadcastChannel online.',
      level: 'sync',
    },
  ]);

  // Handle window position updates in animation loop
  useEffect(() => {
    let animId: number;
    const tick = () => {
      const updated = multiWindowManager.updateLocalNode(physics.colorTheme === 'cyan' ? '#00f0ff' : '#c3c0ff');
      setLocalNode(updated);
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);

    const unsubscribe = multiWindowManager.subscribe((allRemote) => {
      setRemoteNodes(allRemote);
    });

    return () => {
      cancelAnimationFrame(animId);
      unsubscribe();
    };
  }, [physics.colorTheme]);

  // Collision handler
  const handleCollision = useCallback((event: CollisionEvent) => {
    setIsColliding(true);
    setTimeout(() => setIsColliding(false), 280);

    setCollisionHistory((prev) => [event, ...prev.slice(0, 49)]);
    setTelemetryLogs((prev) => [
      {
        id: event.id,
        timestamp: event.timestamp,
        message: `COLLISION IMPACT between ${event.nodeA} and ${event.nodeB} | Velocity: ${event.relativeVelocity} px/s | Force: ${event.impactForce} N`,
        level: 'collision',
      },
      ...prev.slice(0, 99),
    ]);
  }, []);

  const handleCoreDisplace = useCallback((dx: number, dy: number, forceMag: number) => {
    setCoreDisplacement({ x: dx, y: dy, force: forceMag });
  }, []);

  const handleNearestDist = useCallback((dist: number, force: number) => {
    setNearestDist(dist);
    setAttractionForce(force);
  }, []);

  // Toggle simulated draggable tab
  const handleToggleSimulated = () => {
    if (isSimulatedActive) {
      multiWindowManager.removeSimulatedNode('SIMULATED_TAB_02');
      setIsSimulatedActive(false);
      setTelemetryLogs((prev) => [
        {
          id: 'LOG_' + Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          message: 'Virtual simulated window detached.',
          level: 'warn',
        },
        ...prev,
      ]);
    } else {
      setIsSimulatedActive(true);
      setTelemetryLogs((prev) => [
        {
          id: 'LOG_' + Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          message: 'Virtual simulated tab attached. Ready for in-page collision drag test.',
          level: 'info',
        },
        ...prev,
      ]);
    }
  };

  // Launch real external window for cross-window testing
  const handleLaunchNewWindow = () => {
    try {
      const w = 700;
      const h = 600;
      const left = window.screenX + 120;
      const top = window.screenY + 100;
      window.open(window.location.href, '_blank', `width=${w},height=${h},left=${left},top=${top}`);
      setTelemetryLogs((prev) => [
        {
          id: 'LOG_' + Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          message: 'Spawned external secondary browser window.',
          level: 'sync',
        },
        ...prev,
      ]);
    } catch {
      window.open(window.location.href, '_blank');
    }
  };

  const handleNavigate = (screen: ScreenType, transition: TransitionDirection) => {
    setTransitionDir(transition);
    setCurrentScreen(screen);
  };

  // Variants for navigation transitions
  const getVariants = () => {
    if (transitionDir === 'push') {
      return {
        initial: { x: '100%', opacity: 1 },
        animate: { x: 0, opacity: 1 },
        exit: { x: '-100%', opacity: 1 },
        transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
      };
    }
    if (transitionDir === 'push_back') {
      return {
        initial: { x: '-100%', opacity: 1 },
        animate: { x: 0, opacity: 1 },
        exit: { x: '100%', opacity: 1 },
        transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
      };
    }
    if (transitionDir === 'slide_up') {
      return {
        initial: { y: '100%', opacity: 1 },
        animate: { y: 0, opacity: 1 },
        exit: { y: '-100%', opacity: 1 },
        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
      };
    }
    // 'none'
    return {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 1 },
      transition: { duration: 0 },
    };
  };

  const currentVariant = getVariants();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#131314] text-[#e5e2e3]">
      {/* Background WebGL Shader */}
      <BackgroundShader />

      {/* Top Navigation Bar with exact spec elements */}
      <TopNav
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        activeNodesCount={remoteNodes.length + 1}
      />

      {/* Screen Transitions */}
      <AnimatePresence mode="wait">
        {currentScreen === 'experiment' ? (
          <motion.div
            key="screen-experiment"
            id="screen-experiment"
            aria-label="Quantum Observer | Particle Attraction Experiment"
            initial={currentVariant.initial}
            animate={currentVariant.animate}
            exit={currentVariant.exit}
            transition={currentVariant.transition}
            className="absolute inset-0 w-full h-full"
          >
            {/* Screen 1 Title for testing identifier */}
            <div className="sr-only">Quantum Observer | Particle Attraction Experiment</div>

            {/* Particle Canvas & Gravitational Web */}
            <ParticleCanvas
              localNode={localNode}
              remoteNodes={remoteNodes}
              physics={physics}
              onCollision={handleCollision}
              onCoreDisplace={handleCoreDisplace}
              onNearestDistance={handleNearestDist}
            />

            {/* Central Attractor Core */}
            <AttractorCore
              label={localNode.label}
              displacementX={coreDisplacement.x}
              displacementY={coreDisplacement.y}
              forceMagnitude={coreDisplacement.force}
              isColliding={isColliding}
            />

            {/* Status Panel (SYS_METRICS, COORD_X, COORD_Y, ACTIVE_NODES) */}
            <SysMetricsPanel
              localNode={localNode}
              activeCount={remoteNodes.length + 1}
              nearestDistance={nearestDist}
              attractionForce={attractionForce}
              isSimulatedActive={isSimulatedActive}
              onToggleSimulated={handleToggleSimulated}
              onLaunchNewWindow={handleLaunchNewWindow}
            />

            {/* In-viewport Draggable Virtual Window for instant drag collision */}
            {isSimulatedActive && (
              <SimulatedWindow
                localNode={localNode}
                onUpdatePosition={(node) => multiWindowManager.setSimulatedNode(node)}
                onClose={() => {
                  multiWindowManager.removeSimulatedNode('SIMULATED_TAB_02');
                  setIsSimulatedActive(false);
                }}
              />
            )}

            {/* Floating Quick Hint Bar at bottom */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none text-center px-4">
              <div className="inline-flex items-center gap-2 bg-[#131314]/85 backdrop-blur-md px-4 py-2 rounded-full border border-cyan-400/20 text-xs font-label-mono text-cyan-200/90 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>
                  {remoteNodes.length > 0
                    ? `ENTANGLED WITH ${remoteNodes.length} ACTIVE OBSERVER NODE${remoteNodes.length > 1 ? 'S' : ''} — MOVE TABS TOGETHER TO COLLIDE`
                    : 'DRAG THE VIRTUAL TAB (OR OPEN A 2ND BROWSER WINDOW) TO COLLIDE PARTICLES'}
                </span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="screen-lab"
            id="screen-lab"
            aria-label="Quantum Observer | Interactive Physics Lab"
            initial={currentVariant.initial}
            animate={currentVariant.animate}
            exit={currentVariant.exit}
            transition={currentVariant.transition}
            className="absolute inset-0 w-full h-full"
          >
            {/* Screen 2 Title for testing identifier */}
            <div className="sr-only">Quantum Observer | Interactive Physics Lab</div>

            {/* Interactive Physics Lab View */}
            <PhysicsLab
              physics={physics}
              onUpdatePhysics={(updated) => setPhysics((prev) => ({ ...prev, ...updated }))}
              collisionHistory={collisionHistory}
              telemetryLogs={telemetryLogs}
              onClearHistory={() => setCollisionHistory([])}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
