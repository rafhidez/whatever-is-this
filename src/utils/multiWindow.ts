import { WindowNode } from '../types';

const STORAGE_KEY = 'quantum_observer_nodes';
const CHANNEL_NAME = 'quantum_observer_mesh';

// Stable or generated ID for this tab session
export const LOCAL_NODE_ID = 'NODE_' + Math.random().toString(36).substring(2, 6).toUpperCase();

export class MultiWindowManager {
  private channel: BroadcastChannel | null = null;
  private nodes: Map<string, WindowNode> = new Map();
  private listeners: Set<(nodes: WindowNode[]) => void> = new Set();
  private simulatedNodes: Map<string, WindowNode> = new Map();
  private lastX: number = -9999;
  private lastY: number = -9999;
  private isDestroyed: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          if (event.data && event.data.type === 'HEARTBEAT') {
            this.handleIncomingNode(event.data.node);
          } else if (event.data && event.data.type === 'LEAVE') {
            this.removeNode(event.data.id);
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel not accessible in this context:', e);
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this.handleUnload);
      window.addEventListener('storage', this.handleStorageEvent);
    }
  }

  public subscribe(cb: (nodes: WindowNode[]) => void): () => void {
    this.listeners.add(cb);
    cb(this.getAllNodes());
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    const list = this.getAllNodes();
    this.listeners.forEach((cb) => cb(list));
  }

  private handleIncomingNode(node: WindowNode) {
    if (!node || node.id === LOCAL_NODE_ID) return;
    this.nodes.set(node.id, { ...node, timestamp: Date.now() });
    this.notify();
  }

  private removeNode(id: string) {
    if (this.nodes.delete(id)) {
      this.notify();
    }
  }

  private handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const stored = JSON.parse(e.newValue) as Record<string, WindowNode>;
        const now = Date.now();
        let changed = false;
        Object.entries(stored).forEach(([id, node]) => {
          if (id !== LOCAL_NODE_ID && now - node.timestamp < 2000) {
            this.nodes.set(id, node);
            changed = true;
          }
        });
        if (changed) this.notify();
      } catch {
        // ignore parse error
      }
    }
  };

  private handleUnload = () => {
    if (this.channel) {
      try {
        this.channel.postMessage({ type: 'LEAVE', id: LOCAL_NODE_ID });
      } catch {
        // ignore
      }
    }
    try {
      const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      delete current[LOCAL_NODE_ID];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch {
      // ignore
    }
  };

  // Called in requestAnimationFrame or tick
  public updateLocalNode(color: string = '#00f0ff'): WindowNode {
    const screenX = typeof window.screenX !== 'undefined' ? window.screenX : (window.screenLeft ?? 0);
    const screenY = typeof window.screenY !== 'undefined' ? window.screenY : (window.screenTop ?? 0);
    const width = window.innerWidth;
    const height = window.innerHeight;

    const coreGlobalX = screenX + width / 2;
    const coreGlobalY = screenY + height / 2;

    const localNode: WindowNode = {
      id: LOCAL_NODE_ID,
      label: 'ATTRACTOR_01',
      x: screenX,
      y: screenY,
      width,
      height,
      coreGlobalX,
      coreGlobalY,
      color,
      timestamp: Date.now(),
      isSimulated: false,
    };

    // Broadcast update
    if (this.channel) {
      try {
        this.channel.postMessage({ type: 'HEARTBEAT', node: localNode });
      } catch {
        // ignore
      }
    }

    // Save to localStorage
    try {
      const now = Date.now();
      const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      current[LOCAL_NODE_ID] = localNode;
      // prune dead nodes
      Object.keys(current).forEach((k) => {
        if (now - (current[k]?.timestamp || 0) > 2500) {
          delete current[k];
          this.nodes.delete(k);
        }
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch {
      // ignore
    }

    // Prune stale in-memory nodes
    const now = Date.now();
    let hasPruned = false;
    this.nodes.forEach((node, id) => {
      if (now - node.timestamp > 2500) {
        this.nodes.delete(id);
        hasPruned = true;
      }
    });

    if (hasPruned || Math.abs(screenX - this.lastX) > 0.5 || Math.abs(screenY - this.lastY) > 0.5) {
      this.lastX = screenX;
      this.lastY = screenY;
      this.notify();
    }

    return localNode;
  }

  // Simulated nodes for in-page testing and dragging
  public setSimulatedNode(node: WindowNode) {
    this.simulatedNodes.set(node.id, { ...node, isSimulated: true, timestamp: Date.now() });
    this.notify();
  }

  public removeSimulatedNode(id: string) {
    if (this.simulatedNodes.delete(id)) {
      this.notify();
    }
  }

  public getSimulatedNodes(): WindowNode[] {
    return Array.from(this.simulatedNodes.values());
  }

  public getAllRemoteNodes(): WindowNode[] {
    const remoteReal = Array.from(this.nodes.values());
    const simulated = Array.from(this.simulatedNodes.values());
    return [...remoteReal, ...simulated];
  }

  public getAllNodes(): WindowNode[] {
    return this.getAllRemoteNodes();
  }

  public destroy() {
    this.isDestroyed = true;
    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.handleUnload);
      window.removeEventListener('storage', this.handleStorageEvent);
    }
    this.handleUnload();
    if (this.channel) {
      this.channel.close();
    }
  }
}

export const multiWindowManager = new MultiWindowManager();
