/**
 * config.js
 * Central configuration constants for the visualizer.
 * All magic numbers live here for easy tuning.
 */

export const CONFIG = {
  scene: {
    background:    0x050810,
    fogColor:      0x050810,
    fogNear:       800,
    fogFar:        3000,
  },

  camera: {
    fov:           70,
    near:          1,
    far:           8000,
    initialPos:    [0, 0, 1200],
  },

  nodes: {
    baseSize:      5,        // radius for degree-0 node
    maxSize:       22,       // radius cap
    glowIntensity: 1.8,
    pulseSpeed:    0.8,      // cycles per second
    pulseAmplitude:0.12,     // fraction of scale
    hubThreshold:  6,        // degree >= this → hub styling
  },

  edges: {
    baseOpacity:   0.35,
    hubOpacity:    0.6,
    tubeRadius:    0.18,
    tubeSeg:       6,
    particleCount: 3,        // particles per edge
    particleSpeed: 0.0008,   // t increment per frame
    particleSize:  2.5,
  },

  particles: {
    count:         1200,
    size:          1.5,
    minOpacity:    0.08,
    maxOpacity:    0.35,
    speedFactor:   0.03,
    spread:        1200,
  },

  physics: {
    linkDistance:  140,
    chargeStrength:-200,
    centerStrength: 0.02,
    collideRadius:  2.0,     // multiplier of node radius
    alphaDecay:    0.012,
    velocityDecay: 0.60,
    iterations:    1,        // physics ticks per animation frame
  },

  bloom: {
    strength:      1.4,
    radius:        0.75,
    threshold:     0.55,
  },

  camera_controls: {
    enableDamping:   true,
    dampingFactor:   0.06,
    minDistance:     40,
    maxDistance:     3000,
    rotateSpeed:     0.6,
    zoomSpeed:       0.8,
  },

  // Cluster color palette — cyan/blue/violet/teal family
  clusterColors: [
    0x00d9ff,  // 0 — electric cyan
    0x0066ff,  // 1 — royal blue
    0x7c3aed,  // 2 — violet
    0x06b6d4,  // 3 — sky
    0x10b981,  // 4 — emerald
    0xf97316,  // 5 — amber/orange (accent)
    0x8b5cf6,  // 6 — purple
    0x38bdf8,  // 7 — light blue
    0x34d399,  // 8 — teal
    0xe879f9,  // 9 — fuchsia
  ],

  // Edge color by relation type
  relationColors: {
    imports_from: 0x00d9ff,
    contains:     0x7c3aed,
    calls:        0xf97316,
    imports:      0x10b981,
    default:      0x4488bb,
  },
};
