/**
 * renderer.js
 * Sets up the Three.js WebGLRenderer, scene, lights, and fog.
 * Returns a thin API used by other modules.
 */

import * as THREE from 'three';
import { EffectComposer }    from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }        from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass }   from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass }        from 'three/addons/postprocessing/OutputPass.js';
import { CONFIG }            from './config.js';

export function createRenderer(canvas) {
  // ── WebGL Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
    alpha: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // ── Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(CONFIG.scene.background);
  scene.fog = new THREE.Fog(CONFIG.scene.fogColor, CONFIG.scene.fogNear, CONFIG.scene.fogFar);

  // ── Camera
  const camera = new THREE.PerspectiveCamera(
    CONFIG.camera.fov,
    window.innerWidth / window.innerHeight,
    CONFIG.camera.near,
    CONFIG.camera.far,
  );
  camera.position.set(...CONFIG.camera.initialPos);

  // ── Lights
  const ambient = new THREE.AmbientLight(0x0a1a2e, 3.0);
  scene.add(ambient);

  const pointA = new THREE.PointLight(0x00d9ff, 2.0, 1200);
  pointA.position.set(300, 300, 300);
  scene.add(pointA);

  const pointB = new THREE.PointLight(0x0044ff, 1.5, 1200);
  pointB.position.set(-300, -200, -300);
  scene.add(pointB);

  const pointC = new THREE.PointLight(0x7c3aed, 1.0, 800);
  pointC.position.set(0, -400, 0);
  scene.add(pointC);

  // ── Post-processing
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    CONFIG.bloom.strength,
    CONFIG.bloom.radius,
    CONFIG.bloom.threshold,
  );
  composer.addPass(bloomPass);
  composer.addPass(new OutputPass());

  // ── Resize handler
  function onResize() {
    const w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);

  return { renderer, scene, camera, composer, bloomPass };
}
