/**
 * graphEngine.js
 * Force-directed 3D graph physics.
 * Implemented without d3-force to avoid CDN dependency —
 * uses a simple, organic Verlet-based force simulation that
 * runs entirely in JS and writes x/y/z back onto node objects.
 */

import { CONFIG }     from './config.js';
import { nodeRadius } from './utils.js';

export class GraphEngine {
  constructor(nodes, edges) {
    this.nodes  = nodes;
    this.edges  = edges;
    this.alpha  = 1.0;
    this.paused = false;

    // Build adjacency for O(1) lookup
    this._buildAdjacency();

    // Give each node velocity
    for (const n of nodes) {
      n.vx = n.vy = n.vz = 0;
    }
  }

  _buildAdjacency() {
    // Map: nodeId → Set of neighbour ids
    this.adjacency = new Map(this.nodes.map(n => [n.id, new Set()]));
    for (const e of this.edges) {
      this.adjacency.get(e.source)?.add(e.target);
      this.adjacency.get(e.target)?.add(e.source);
    }
  }

  /** Return neighbour ids for a node */
  neighbours(nodeId) {
    return this.adjacency.get(nodeId) ?? new Set();
  }

  /** Tick the simulation forward */
  tick() {
    if (this.paused || this.alpha < 0.001) return;

    const cfg = CONFIG.physics;
    const decay = cfg.velocityDecay;
    const alpha = this.alpha;

    // ── 1. Center force (pulls everything toward origin)
    const cx = cfg.centerStrength * alpha;
    for (const n of this.nodes) {
      n.vx -= n.x * cx;
      n.vy -= n.y * cx;
      n.vz -= n.z * cx;
    }

    // ── 2. Charge / repulsion (Barnes-Hut approximation skipped for simplicity)
    const charge = cfg.chargeStrength * alpha;
    for (let i = 0; i < this.nodes.length; i++) {
      const a = this.nodes[i];
      for (let j = i + 1; j < this.nodes.length; j++) {
        const b = this.nodes[j];
        const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
        let d2 = dx*dx + dy*dy + dz*dz;
        if (d2 === 0) d2 = 0.01;
        const d = Math.sqrt(d2);
        const strength = charge / d2;
        const fx = dx / d * strength, fy = dy / d * strength, fz = dz / d * strength;
        a.vx -= fx; a.vy -= fy; a.vz -= fz;
        b.vx += fx; b.vy += fy; b.vz += fz;
      }
    }

    // ── 3. Link / spring force
    const dist = cfg.linkDistance;
    for (const e of this.edges) {
      const a = this._nodeById(e.source);
      const b = this._nodeById(e.target);
      if (!a || !b) continue;
      const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
      const d = Math.sqrt(dx*dx + dy*dy + dz*dz) || 1;
      const diff = (d - dist) / d * alpha * 0.5;
      const fx = dx * diff, fy = dy * diff, fz = dz * diff;
      if (!a._fixed) { a.vx += fx; a.vy += fy; a.vz += fz; }
      if (!b._fixed) { b.vx -= fx; b.vy -= fy; b.vz -= fz; }
    }

    // ── 4. Collide force
    for (let i = 0; i < this.nodes.length; i++) {
      const a = this.nodes[i];
      const ra = nodeRadius(a) * CONFIG.physics.collideRadius;
      for (let j = i + 1; j < this.nodes.length; j++) {
        const b = this.nodes[j];
        const rb = nodeRadius(b) * CONFIG.physics.collideRadius;
        const min = ra + rb;
        const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
        const d2 = dx*dx + dy*dy + dz*dz;
        if (d2 < min * min) {
          const d  = Math.sqrt(d2) || 0.1;
          const ov = (min - d) / d * 0.5 * alpha;
          a.vx -= dx * ov; a.vy -= dy * ov; a.vz -= dz * ov;
          b.vx += dx * ov; b.vy += dy * ov; b.vz += dz * ov;
        }
      }
    }

    // ── 5. Integrate positions
    for (const n of this.nodes) {
      if (n._fixed) { n.vx = n.vy = n.vz = 0; continue; }
      n.vx *= decay; n.vy *= decay; n.vz *= decay;
      n.x += n.vx;   n.y += n.vy;   n.z += n.vz;
    }

    // Cool down
    this.alpha *= (1 - CONFIG.physics.alphaDecay);
  }

  /** Find node object by id (cache for performance) */
  _nodeById(id) {
    if (!this._nodeMap) {
      this._nodeMap = new Map(this.nodes.map(n => [n.id, n]));
    }
    return this._nodeMap.get(id);
  }

  /** Pin a node in place during drag */
  pin(node)   { node._fixed = true; }
  unpin(node) { node._fixed = false; this.alpha = Math.max(this.alpha, 0.3); }

  /** Reheat simulation */
  reheat(alpha = 0.5) { this.alpha = alpha; }

  /** Check if substantially settled */
  isSettled() { return this.alpha < 0.005; }
}
