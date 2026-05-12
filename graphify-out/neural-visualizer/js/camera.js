/**
 * camera.js
 * Wraps Three.js OrbitControls with smooth damping
 * and adds focus-on-node animation.
 */

import * as THREE          from 'three';
import { OrbitControls }   from 'three/addons/controls/OrbitControls.js';
import { CONFIG }          from './config.js';

export class CameraController {
  constructor(camera, domElement) {
    this.camera = camera;

    this.controls = new OrbitControls(camera, domElement);
    const c = this.controls;
    c.enableDamping   = CONFIG.camera_controls.enableDamping;
    c.dampingFactor   = CONFIG.camera_controls.dampingFactor;
    c.minDistance     = CONFIG.camera_controls.minDistance;
    c.maxDistance     = CONFIG.camera_controls.maxDistance;
    c.rotateSpeed     = CONFIG.camera_controls.rotateSpeed;
    c.zoomSpeed       = CONFIG.camera_controls.zoomSpeed;
    c.screenSpacePanning = true;

    // Auto-rotate state
    this._autoRotate  = false;
    c.autoRotate      = false;
    c.autoRotateSpeed = 0.4;

    // Animation target for smooth focus
    this._focusActive = false;
    this._focusTarget = new THREE.Vector3();
    this._focusPos    = new THREE.Vector3();
    this._focusT      = 0;
    this._focusDur    = 1.2; // seconds

    // Subtle ambient drift
    this._driftT = 0;
    this._originalPos = new THREE.Vector3().copy(camera.position);
  }

  /** Smoothly focus camera on a 3D position */
  focusOn(target, distance = 180) {
    this._focusActive = true;
    this._focusT      = 0;
    this._focusTarget.copy(target);

    // Compute new camera position: offset from target toward current camera
    const dir = new THREE.Vector3().subVectors(this.camera.position, target).normalize();
    this._focusPos.copy(target).addScaledVector(dir, distance);
  }

  /** Reset to default overview position */
  reset() {
    this.focusOn(new THREE.Vector3(0, 0, 0), CONFIG.camera.initialPos[2]);
  }

  /** Toggle auto-rotate */
  toggleAutoRotate() {
    this._autoRotate = !this._autoRotate;
    this.controls.autoRotate = this._autoRotate;
    return this._autoRotate;
  }

  /** Called every frame */
  update(deltaTime) {
    this._driftT += deltaTime;

    if (this._focusActive) {
      this._focusT += deltaTime / this._focusDur;
      const t = this._easeInOut(Math.min(this._focusT, 1));

      this.camera.position.lerp(this._focusPos, t * 0.1);
      this.controls.target.lerp(this._focusTarget, t * 0.1);

      if (this._focusT >= 1) this._focusActive = false;
    }

    this.controls.update();
  }

  _easeInOut(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }
}
