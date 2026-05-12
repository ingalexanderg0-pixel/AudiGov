/**
 * edgeSystem.js
 * Renders graph edges as animated tubes with travelling
 * particle pulses that simulate synaptic impulses.
 *
 * Architecture:
 *  - Each edge gets a Line2 (or fallback LineSegments) for the base connection
 *  - Particles are instanced PointsMaterial sprites travelling t=0→1 along edges
 */

import * as THREE from 'three';
import { CONFIG }                      from './config.js';
import { relationColor, clusterColor } from './utils.js';

export class EdgeSystem {
  constructor(scene, nodes, edges) {
    this.scene   = scene;
    this.nodes   = nodes;
    this.edges   = edges;
    this._nodeMap = new Map(nodes.map(n => [n.id, n]));

    // Line positions buffer (2 vertices * 3 floats per edge)
    this._lineGeo  = null;
    this._lineMesh = null;
    this._particles = [];

    this._build();
  }

  _build() {
    const edgeCount = this.edges.length;

    // ── Edge lines (single LineSegments for performance)
    const positions = new Float32Array(edgeCount * 6); // 2 pts * xyz
    const colors    = new Float32Array(edgeCount * 6); // per-vertex color

    this._lineGeo = new THREE.BufferGeometry();
    this._lineGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this._lineGeo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent:  true,
      opacity:      CONFIG.edges.baseOpacity,
      blending:     THREE.AdditiveBlending,
      depthWrite:   false,
      linewidth:    1,
    });

    this._lineMesh = new THREE.LineSegments(this._lineGeo, lineMat);
    this.scene.add(this._lineMesh);

    // ── Travelling particles (one Points object per edge group)
    this._buildParticles();
  }

  _buildParticles() {
    const edgeCount    = this.edges.length;
    const perEdge      = CONFIG.edges.particleCount;
    const totalPts     = edgeCount * perEdge;

    const positions   = new Float32Array(totalPts * 3);
    const colors      = new Float32Array(totalPts * 3);
    const alphas      = new Float32Array(totalPts);

    // Stagger t offsets so particles are spread evenly along each edge
    this._particleState = [];
    for (let e = 0; e < edgeCount; e++) {
      const edgeColor = new THREE.Color(relationColor(this.edges[e].relation));
      for (let p = 0; p < perEdge; p++) {
        const idx = e * perEdge + p;
        this._particleState.push({
          edgeIndex: e,
          t: p / perEdge,          // stagger
          speed: CONFIG.edges.particleSpeed * (0.7 + Math.random() * 0.6),
          color: edgeColor,
        });
        edgeColor.toArray(colors, idx * 3);
        alphas[idx] = 0;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

    // Circular sprite texture (drawn on canvas)
    const tex = this._makeParticleTexture();

    const mat = new THREE.PointsMaterial({
      size:         CONFIG.edges.particleSize,
      map:          tex,
      vertexColors: true,
      transparent:  true,
      blending:     THREE.AdditiveBlending,
      depthWrite:   false,
      sizeAttenuation: true,
    });

    this._particleGeo   = geo;
    this._particleMesh  = new THREE.Points(geo, mat);
    this.scene.add(this._particleMesh);
  }

  _makeParticleTexture() {
    const size   = 64;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const cx  = size / 2;
    const grad = ctx.createRadialGradient(cx, cx, 0, cx, cx, cx);
    grad.addColorStop(0,   'rgba(255,255,255,1)');
    grad.addColorStop(0.4, 'rgba(180,240,255,0.8)');
    grad.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
  }

  /** Called every frame */
  update(deltaTime) {
    const nodeMap   = this._nodeMap;
    const edges     = this.edges;
    const linePos   = this._lineGeo.attributes.position.array;
    const lineCol   = this._lineGeo.attributes.color.array;
    const partPos   = this._particleGeo.attributes.position.array;

    // ── Update line endpoints from physics positions
    for (let i = 0; i < edges.length; i++) {
      const a = nodeMap.get(edges[i].source);
      const b = nodeMap.get(edges[i].target);
      if (!a || !b) continue;

      const base = i * 6;
      linePos[base]   = a.x; linePos[base+1] = a.y; linePos[base+2] = a.z;
      linePos[base+3] = b.x; linePos[base+4] = b.y; linePos[base+5] = b.z;

      const c = new THREE.Color(relationColor(edges[i].relation));
      lineCol[base]   = c.r; lineCol[base+1] = c.g; lineCol[base+2] = c.b;
      lineCol[base+3] = c.r; lineCol[base+4] = c.g; lineCol[base+5] = c.b;
    }

    this._lineGeo.attributes.position.needsUpdate = true;
    this._lineGeo.attributes.color.needsUpdate    = true;

    // ── Advance particle t values and compute positions
    const perEdge = CONFIG.edges.particleCount;
    for (let p = 0; p < this._particleState.length; p++) {
      const ps = this._particleState[p];
      ps.t = (ps.t + ps.speed) % 1;

      const edge = edges[ps.edgeIndex];
      const a    = nodeMap.get(edge.source);
      const b    = nodeMap.get(edge.target);
      if (!a || !b) continue;

      const t  = ps.t;
      const i3 = p * 3;
      partPos[i3]   = a.x + (b.x - a.x) * t;
      partPos[i3+1] = a.y + (b.y - a.y) * t;
      partPos[i3+2] = a.z + (b.z - a.z) * t;
    }
    this._particleGeo.attributes.position.needsUpdate = true;
  }

  /** Highlight edges connected to a node */
  highlightEdgesFor(nodeId) {
    const lineMat = this._lineMesh.material;
    lineMat.opacity = CONFIG.edges.baseOpacity;
    // Full highlight logic handled by dim/restore cycle
  }

  /** Show/hide */
  setVisible(v) {
    this._lineMesh.visible     = v;
    this._particleMesh.visible = v;
  }
}
