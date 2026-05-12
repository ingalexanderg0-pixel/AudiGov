/**
 * nodeSystem.js
 * Creates and manages all node meshes in the 3D scene.
 * Each node is an IcosahedronGeometry sphere with a custom
 * ShaderMaterial that produces a fresnel glow and pulsing effect.
 */

import * as THREE from 'three';
import { CONFIG }              from './config.js';
import { nodeRadius, clusterColor } from './utils.js';

/* ──────────────────────────────────────────────────────────
   Vertex Shader — animates the pulsing scale via a uniform
   ────────────────────────────────────────────────────────── */
const NODE_VERT = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vViewDir;
  uniform float uTime;
  uniform float uPulse;

  void main() {
    vNormal  = normalize(normalMatrix * normal);
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvPos.xyz);

    // Subtle vertex noise for organic feel
    float noise = sin(position.x * 3.0 + uTime) * cos(position.y * 2.7 + uTime * 0.8) * 0.04;
    vec3 displaced = position * (1.0 + uPulse + noise);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

/* ──────────────────────────────────────────────────────────
   Fragment Shader — fresnel rim glow + inner luminance
   ────────────────────────────────────────────────────────── */
const NODE_FRAG = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vViewDir;
  uniform vec3  uColor;
  uniform float uGlow;
  uniform float uSelected;

  void main() {
    // Fresnel factor — bright at edges, dim at centre
    float fresnel = pow(1.0 - clamp(dot(vNormal, vViewDir), 0.0, 1.0), 2.5);

    // Core luminance
    float core = pow(clamp(dot(vNormal, vViewDir), 0.0, 1.0), 1.5) * 0.4;

    vec3 col = uColor * (core + fresnel * uGlow);

    // Selection ring — adds extra white bloom
    col += uColor * uSelected * fresnel * 1.5;
    col += vec3(1.0) * uSelected * core * 0.6;

    // Slightly desaturate towards white at the very edge
    col = mix(col, vec3(length(col)), fresnel * 0.3);

    gl_FragColor = vec4(col, 0.85 + fresnel * 0.15);
  }
`;

export class NodeSystem {
  constructor(scene, nodes) {
    this.scene   = scene;
    this.nodes   = nodes;
    this.meshMap = new Map();   // nodeId → mesh
    this._time   = 0;

    this._build();
  }

  _build() {
    const geo = new THREE.IcosahedronGeometry(1, 3); // unit sphere, will be scaled

    for (const node of this.nodes) {
      const r     = nodeRadius(node);
      const color = new THREE.Color(clusterColor(node.community));

      const mat = new THREE.ShaderMaterial({
        vertexShader:   NODE_VERT,
        fragmentShader: NODE_FRAG,
        uniforms: {
          uTime:     { value: 0 },
          uPulse:    { value: 0 },
          uColor:    { value: color },
          uGlow:     { value: CONFIG.nodes.glowIntensity },
          uSelected: { value: 0 },
        },
        transparent: true,
        depthWrite:  false,
        blending:    THREE.AdditiveBlending,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.scale.setScalar(r);
      mesh.position.set(node.x, node.y, node.z);
      mesh.userData.nodeId = node.id;

      this.scene.add(mesh);
      this.meshMap.set(node.id, mesh);
    }
  }

  /** Called every frame — syncs positions from physics + animates */
  update(deltaTime) {
    this._time += deltaTime;
    const { pulseSpeed, pulseAmplitude } = CONFIG.nodes;

    for (const node of this.nodes) {
      const mesh = this.meshMap.get(node.id);
      if (!mesh) continue;

      // Sync position from physics engine
      mesh.position.set(node.x, node.y, node.z);

      // Pulsing scale
      const pulse = Math.sin(this._time * pulseSpeed * Math.PI * 2 + node.community * 0.8)
                    * pulseAmplitude;
      mesh.material.uniforms.uTime.value  = this._time;
      mesh.material.uniforms.uPulse.value = pulse;
    }
  }

  /** Highlight a node on hover. Pass null to reset all. */
  setHover(nodeId) {
    for (const [id, mesh] of this.meshMap) {
      if (nodeId === null) {
        // Reset to default glow (but keep selected node bright)
        mesh.material.uniforms.uGlow.value = CONFIG.nodes.glowIntensity;
      } else {
        const target = id === nodeId
          ? CONFIG.nodes.glowIntensity * 1.6   // hovered: brighter
          : CONFIG.nodes.glowIntensity * 0.55; // others: dim slightly
        mesh.material.uniforms.uGlow.value = target;
      }
    }
  }

  /** Select node — intensify glow and selection uniform */
  setSelected(nodeId) {
    for (const [id, mesh] of this.meshMap) {
      mesh.material.uniforms.uSelected.value = id === nodeId ? 1.0 : 0.0;
      // Also boost neighbours
      mesh.material.uniforms.uGlow.value = CONFIG.nodes.glowIntensity;
    }
  }

  /** Dim all except given set of ids (for cluster isolation) */
  setVisible(allowedIds) {
    const all = !allowedIds;
    for (const [id, mesh] of this.meshMap) {
      mesh.visible = all || allowedIds.has(id);
    }
  }

  /** Get the THREE.Mesh for a given nodeId */
  getMesh(nodeId) { return this.meshMap.get(nodeId); }

  /** Return all meshes as array (for raycasting) */
  getMeshes() { return [...this.meshMap.values()]; }
}
