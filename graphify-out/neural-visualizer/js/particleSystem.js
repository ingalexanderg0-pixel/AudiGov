/**
 * particleSystem.js
 * Ambient "space dust" particle field that floats in the background.
 * Uses a single BufferGeometry Points object with perlin-like
 * animated movement via shader.
 */

import * as THREE from 'three';
import { CONFIG }     from './config.js';
import { randFloat }  from './utils.js';

/* ── Vertex shader: animates y position with a simple sin wave */
const PART_VERT = /* glsl */`
  attribute float aOffset;
  attribute float aSize;
  attribute float aSpeed;
  uniform   float uTime;

  void main() {
    vec3 pos = position;

    // Organic float using offset-staggered sin/cos
    pos.x += sin(uTime * aSpeed + aOffset) * 4.0;
    pos.y += cos(uTime * aSpeed * 0.7 + aOffset * 1.3) * 4.0;
    pos.z += sin(uTime * aSpeed * 0.5 + aOffset * 0.9) * 4.0;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (400.0 / -mvPos.z);
    gl_Position  = projectionMatrix * mvPos;
  }
`;

const PART_FRAG = /* glsl */`
  uniform float uTime;
  void main() {
    // Circular disc
    vec2  uv   = gl_PointCoord - 0.5;
    float dist = length(uv);
    if (dist > 0.5) discard;

    // Soft edge fade
    float alpha = smoothstep(0.5, 0.1, dist) * 0.28;
    gl_FragColor = vec4(0.7, 0.9, 1.0, alpha);
  }
`;

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this._time = 0;
    this._build();
  }

  _build() {
    const count  = CONFIG.particles.count;
    const spread = CONFIG.particles.spread;

    const positions = new Float32Array(count * 3);
    const offsets   = new Float32Array(count);
    const sizes     = new Float32Array(count);
    const speeds    = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i*3]   = randFloat(-spread, spread);
      positions[i*3+1] = randFloat(-spread, spread);
      positions[i*3+2] = randFloat(-spread, spread);
      offsets[i]  = Math.random() * Math.PI * 2;
      sizes[i]    = randFloat(0.6, CONFIG.particles.size);
      speeds[i]   = randFloat(0.05, 0.25);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aOffset',  new THREE.BufferAttribute(offsets, 1));
    geo.setAttribute('aSize',    new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aSpeed',   new THREE.BufferAttribute(speeds, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader:   PART_VERT,
      fragmentShader: PART_FRAG,
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
    });

    this._mesh = new THREE.Points(geo, mat);
    this.scene.add(this._mesh);
  }

  update(deltaTime) {
    this._time += deltaTime;
    this._mesh.material.uniforms.uTime.value = this._time;
    // Slow drift rotation for the whole field
    this._mesh.rotation.y += deltaTime * 0.005;
    this._mesh.rotation.x += deltaTime * 0.003;
  }
}
