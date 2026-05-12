/**
 * utils.js
 * Math helpers, color utilities, and shared small functions.
 */

import { CONFIG } from './config.js';

/** Map a value from [inMin,inMax] to [outMin,outMax] */
export function mapRange(val, inMin, inMax, outMin, outMax) {
  return outMin + ((val - inMin) / (inMax - inMin)) * (outMax - outMin);
}

/** Clamp value between min and max */
export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/** Linear interpolation */
export function lerp(a, b, t) { return a + (b - a) * t; }

/** Squared distance (faster than full distance) */
export function distSq(a, b) {
  const dx = a.x - b.x, dy = a.y - b.y, dz = (a.z || 0) - (b.z || 0);
  return dx * dx + dy * dy + dz * dz;
}

/** Compute node visual radius based on degree */
export function nodeRadius(node) {
  const { baseSize, maxSize } = CONFIG.nodes;
  return clamp(baseSize + Math.sqrt(node.degree) * 2.2, baseSize, maxSize);
}

/** Get cluster color (THREE.Color hex integer) */
export function clusterColor(communityId) {
  const palette = CONFIG.clusterColors;
  return palette[communityId % palette.length];
}

/** Get edge color by relation type */
export function relationColor(relation) {
  return CONFIG.relationColors[relation] ?? CONFIG.relationColors.default;
}

/** Hex integer to CSS hex string */
export function hexToCSS(hex) {
  return '#' + hex.toString(16).padStart(6, '0');
}

/** Format a source_file path for display */
export function formatPath(path) {
  if (!path) return '—';
  return path.replace(/\\/g, '/');
}

/** Simple throttle */
export function throttle(fn, ms) {
  let last = 0;
  return (...args) => {
    const now = performance.now();
    if (now - last >= ms) { last = now; fn(...args); }
  };
}

/** Debounce */
export function debounce(fn, ms) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

/** Smooth-step easing */
export function smoothstep(t) { return t * t * (3 - 2 * t); }

/** Random float in range */
export function randFloat(min, max) { return min + Math.random() * (max - min); }

/** Seeded pseudo-random (simple LCG) */
export function seededRand(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}
