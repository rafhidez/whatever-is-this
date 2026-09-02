export interface WindowNode {
  id: string;
  label: string;
  x: number; // screenX
  y: number; // screenY
  width: number;
  height: number;
  coreGlobalX: number;
  coreGlobalY: number;
  color: string;
  timestamp: number;
  isSimulated?: boolean;
}

export interface PhysicsConfig {
  gravityStrength: number; // attraction pull
  collisionRadius: number; // core collision radius (px)
  elasticity: number; // bounce restitution (0 - 1)
  particleCount: number; // particles per node
  damping: number; // core movement damping
  beamTension: number; // tether elasticity
  trailLength: number;
  soundEnabled: boolean;
  colorTheme: 'cyan' | 'violet' | 'amber' | 'emerald';
}

export interface CollisionEvent {
  id: string;
  timestamp: string;
  nodeA: string;
  nodeB: string;
  relativeVelocity: number;
  impactForce: number;
  screenDistance: number;
  location: { x: number; y: number };
}

export interface TelemetryLog {
  id: string;
  timestamp: string;
  message: string;
  level: 'info' | 'warn' | 'collision' | 'sync';
}

export type ScreenType = 'experiment' | 'lab';
export type TransitionDirection = 'push' | 'push_back' | 'slide_up' | 'none';
