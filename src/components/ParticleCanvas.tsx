import React, { useEffect, useRef } from 'react';
import { CollisionEvent, PhysicsConfig, WindowNode } from '../types';
import { soundEngine } from '../utils/audio';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  originNodeId: string;
  size: number;
  alpha: number;
  hue: number;
  targetCoreX: number;
  targetCoreY: number;
  orbitAngle: number;
  orbitRadius: number;
  orbitSpeed: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

interface ParticleCanvasProps {
  localNode: WindowNode;
  remoteNodes: WindowNode[];
  physics: PhysicsConfig;
  onCollision: (event: CollisionEvent) => void;
  onCoreDisplace: (dx: number, dy: number, forceMag: number) => void;
  onNearestDistance: (dist: number, force: number) => void;
}

export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({
  localNode,
  remoteNodes,
  physics,
  onCollision,
  onCoreDisplace,
  onNearestDistance,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const sparksRef = useRef<Spark[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const collisionCooldownRef = useRef<Map<string, number>>(new Map());

  // Core physics state (for elastic recoil spring)
  const coreOffsetRef = useRef<{ x: number; y: number; vx: number; vy: number }>({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
  });

  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  // Initialize swarm particles
  useEffect(() => {
    const totalParticles = physics.particleCount * (1 + remoteNodes.length);
    const list: Particle[] = [];

    for (let i = 0; i < totalParticles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 30 + Math.random() * 140;
      list.push({
        x: window.innerWidth / 2 + Math.cos(angle) * radius,
        y: window.innerHeight / 2 + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        originNodeId: localNode.id,
        size: 1 + Math.random() * 2.2,
        alpha: 0.3 + Math.random() * 0.7,
        hue: 185 + Math.random() * 20,
        targetCoreX: window.innerWidth / 2,
        targetCoreY: window.innerHeight / 2,
        orbitAngle: angle,
        orbitRadius: radius,
        orbitSpeed: (0.01 + Math.random() * 0.02) * (Math.random() > 0.5 ? 1 : -1),
      });
    }
    particlesRef.current = list;
  }, [physics.particleCount, remoteNodes.length, localNode.id]);

  // Main animation and physics simulation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Dark fade trail
      ctx.fillStyle = `rgba(19, 19, 20, ${1 - physics.trailLength * 0.08})`;
      ctx.fillRect(0, 0, width, height);

      // Local core center with spring displacement
      const coreBaseX = width / 2;
      const coreBaseY = height / 2;

      // Update spring damping on local core offset
      const coreState = coreOffsetRef.current;
      const springK = 0.08;
      const dampingFactor = 0.84 * physics.damping;

      // Restoring force towards center (0,0)
      const ax = -springK * coreState.x;
      const ay = -springK * coreState.y;
      coreState.vx = (coreState.vx + ax) * dampingFactor;
      coreState.vy = (coreState.vy + ay) * dampingFactor;
      coreState.x += coreState.vx;
      coreState.y += coreState.vy;

      const localCoreX = coreBaseX + coreState.x;
      const localCoreY = coreBaseY + coreState.y;

      let nearestDist = 99999;
      let maxAttractionForce = 0;

      // Calculate interactions with all remote nodes (real tabs or simulated tabs)
      remoteNodes.forEach((remote) => {
        // Convert remote node's global core coordinates to this window's canvas coordinate space
        const remoteCanvasX = remote.coreGlobalX - localNode.x;
        const remoteCanvasY = remote.coreGlobalY - localNode.y;

        const dx = remoteCanvasX - localCoreX;
        const dy = remoteCanvasY - localCoreY;
        const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));

        if (dist < nearestDist) {
          nearestDist = dist;
        }

        // 1. Gravitational pull on the local core when within 900px
        const maxInfluenceDist = 900;
        if (dist < maxInfluenceDist) {
          const proximityRatio = 1 - dist / maxInfluenceDist;
          const pullMag = proximityRatio * proximityRatio * 3.5 * physics.gravityStrength;
          coreState.vx += (dx / dist) * pullMag * 0.15;
          coreState.vy += (dy / dist) * pullMag * 0.15;
          maxAttractionForce = Math.max(maxAttractionForce, pullMag);

          // Draw quantum gravitational web / energy bridge
          const gradient = ctx.createLinearGradient(localCoreX, localCoreY, remoteCanvasX, remoteCanvasY);
          gradient.addColorStop(0, 'rgba(0, 240, 255, 0.6)');
          gradient.addColorStop(0.5, `rgba(195, 192, 255, ${0.35 + proximityRatio * 0.45})`);
          gradient.addColorStop(1, 'rgba(0, 219, 233, 0.6)');

          ctx.beginPath();
          ctx.moveTo(localCoreX, localCoreY);

          // Subtle organic wavy curve
          const midX = (localCoreX + remoteCanvasX) / 2;
          const midY = (localCoreY + remoteCanvasY) / 2;
          const normalX = -dy / dist;
          const normalY = dx / dist;
          const waveAmp = Math.sin(Date.now() * 0.006) * 16 * proximityRatio;

          ctx.quadraticCurveTo(midX + normalX * waveAmp, midY + normalY * waveAmp, remoteCanvasX, remoteCanvasY);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1.5 + proximityRatio * 4;
          ctx.setLineDash([8, 6]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Glowing energy pulse beads along tether
          const timeOffset = (Date.now() * 0.003) % 1;
          const beadX = localCoreX + (remoteCanvasX - localCoreX) * timeOffset;
          const beadY = localCoreY + (remoteCanvasY - localCoreY) * timeOffset;
          ctx.beginPath();
          ctx.arc(beadX, beadY, 3 + proximityRatio * 4, 0, Math.PI * 2);
          ctx.fillStyle = '#dbfcff';
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 12;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // 2. COLLISION DETECTION: Cores collide when distance is less than collision threshold
        const collisionThreshold = physics.collisionRadius * 2; // e.g. 140px
        const now = Date.now();
        const lastCollisionTime = collisionCooldownRef.current.get(remote.id) || 0;

        if (dist < collisionThreshold && now - lastCollisionTime > 300) {
          collisionCooldownRef.current.set(remote.id, now);

          // Calculate impact recoil vector
          const overlap = collisionThreshold - dist;
          const nx = dx / dist;
          const ny = dy / dist;

          const relativeSpeed = Math.sqrt(coreState.vx * coreState.vx + coreState.vy * coreState.vy) + 5;
          const impulse = (overlap * 0.45 + relativeSpeed * 2.2) * physics.elasticity;

          // Push local core away violently
          coreState.vx -= nx * impulse;
          coreState.vy -= ny * impulse;

          // Sound impact
          soundEngine.playCollision(impulse / 8);

          // Trigger shockwave at midpoint
          const contactX = localCoreX + (nx * dist) / 2;
          const contactY = localCoreY + (ny * dist) / 2;

          shockwavesRef.current.push({
            x: contactX,
            y: contactY,
            radius: 10,
            maxRadius: 180 + impulse * 8,
            alpha: 1.0,
            color: '#00f0ff',
          });

          // Spawn quantum spark shower
          const sparkCount = 28;
          for (let s = 0; s < sparkCount; s++) {
            const angle = Math.atan2(ny, nx) + (Math.random() - 0.5) * Math.PI * 1.5;
            const speed = (2 + Math.random() * 8) * (1 + impulse * 0.1);
            sparksRef.current.push({
              x: contactX,
              y: contactY,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 1.0,
              maxLife: 20 + Math.random() * 25,
              color: s % 2 === 0 ? '#00f0ff' : '#c3c0ff',
              size: 1.5 + Math.random() * 2.5,
            });
          }

          // Emit collision event to lab archive
          onCollision({
            id: 'COLL_' + Math.random().toString(36).substring(2, 7).toUpperCase(),
            timestamp: new Date().toLocaleTimeString(),
            nodeA: localNode.label || 'ATTRACTOR_01',
            nodeB: remote.label || 'REMOTE_NODE',
            relativeVelocity: Math.round(relativeSpeed * 10) / 10,
            impactForce: Math.round(impulse * 10) / 10,
            screenDistance: Math.round(dist),
            location: { x: Math.round(contactX), y: Math.round(contactY) },
          });
        }

        // 3. Draw Remote Window Boundary / Ghost HUD if visible
        // Calculate where remote window bounds land on this canvas
        const remoteWinLeft = remote.x - localNode.x;
        const remoteWinTop = remote.y - localNode.y;

        // Draw remote core ghost representation
        ctx.save();
        ctx.beginPath();
        ctx.arc(remoteCanvasX, remoteCanvasY, 36, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(195, 192, 255, 0.08)';
        ctx.strokeStyle = 'rgba(195, 192, 255, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fill();

        // Ghost label
        ctx.fillStyle = '#c3c0ff';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(remote.label || 'NODE_REMOTE', remoteCanvasX, remoteCanvasY + 48);

        // Window boundary box indicator
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(remoteWinLeft, remoteWinTop, remote.width, remote.height);
        ctx.setLineDash([]);
        ctx.restore();
      });

      // Notify parent of distance and force metrics
      onNearestDistance(nearestDist, maxAttractionForce);
      onCoreDisplace(coreState.x, coreState.y, maxAttractionForce);

      // 4. Update and render particles
      const particles = particlesRef.current;
      const targetColors = {
        cyan: { h: 185, s: '100%', l: '60%' },
        violet: { h: 260, s: '90%', l: '70%' },
        amber: { h: 35, s: '100%', l: '60%' },
        emerald: { h: 160, s: '100%', l: '55%' },
      }[physics.colorTheme];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Orbit update
        p.orbitAngle += p.orbitSpeed;
        const orbitX = localCoreX + Math.cos(p.orbitAngle) * p.orbitRadius;
        const orbitY = localCoreY + Math.sin(p.orbitAngle) * p.orbitRadius;

        // Pull toward orbit position
        const toOrbitX = orbitX - p.x;
        const toOrbitY = orbitY - p.y;
        p.vx += toOrbitX * 0.03;
        p.vy += toOrbitY * 0.03;

        // Attract toward nearest remote core if within reach
        remoteNodes.forEach((rem) => {
          const remX = rem.coreGlobalX - localNode.x;
          const remY = rem.coreGlobalY - localNode.y;
          const dRx = remX - p.x;
          const dRy = remY - p.y;
          const dR = Math.sqrt(dRx * dRx + dRy * dRy);

          if (dR < 450) {
            const pull = ((450 - dR) / 450) * 0.6 * physics.gravityStrength;
            p.vx += (dRx / dR) * pull;
            p.vy += (dRy / dR) * pull;
          }
        });

        // Mouse gravity disturbance
        if (mouseRef.current.active) {
          const mdx = mouseRef.current.x - p.x;
          const mdy = mouseRef.current.y - p.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 180) {
            p.vx -= (mdx / mdist) * 0.8;
            p.vy -= (mdy / mdist) * 0.8;
          }
        }

        // Velocity damping
        p.vx *= 0.92;
        p.vy *= 0.92;
        p.x += p.vx;
        p.y += p.vy;

        // Render particle with soft glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${targetColors.h}, ${targetColors.s}, ${targetColors.l}, ${p.alpha})`;
        ctx.fill();
      }

      // 5. Update and render shockwaves
      for (let i = shockwavesRef.current.length - 1; i >= 0; i--) {
        const sw = shockwavesRef.current[i];
        sw.radius += (sw.maxRadius - sw.radius) * 0.12 + 1.5;
        sw.alpha *= 0.92;

        if (sw.alpha < 0.02 || sw.radius >= sw.maxRadius) {
          shockwavesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 240, 255, ${sw.alpha})`;
        ctx.lineWidth = 3 * sw.alpha;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.restore();
      }

      // 6. Update and render collision sparks
      for (let i = sparksRef.current.length - 1; i >= 0; i--) {
        const sp = sparksRef.current[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vx *= 0.96;
        sp.vy *= 0.96;
        sp.life -= 1 / sp.maxLife;

        if (sp.life <= 0) {
          sparksRef.current.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size * sp.life, 0, Math.PI * 2);
        ctx.fillStyle = sp.color;
        ctx.shadowColor = sp.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };
    const onMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [localNode, remoteNodes, physics, onCollision, onCoreDisplace, onNearestDistance]);

  return (
    <canvas
      id="quantum-particle-canvas"
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};
