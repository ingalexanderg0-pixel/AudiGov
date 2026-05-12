/**
 * interactions.js
 * Handles all user input:
 *   - Raycasting (hover + click)
 *   - Node dragging (pins physics)
 *   - Keyboard shortcuts
 *   - Double-click to focus camera
 */

import * as THREE  from 'three';
import { throttle } from './utils.js';

export class Interactions {
  /**
   * @param {THREE.Camera}   camera
   * @param {HTMLElement}    domElement
   * @param {NodeSystem}     nodeSystem
   * @param {GraphEngine}    graphEngine
   * @param {CameraController} cameraCtrl
   * @param {Function}       onNodeHover   (nodeId | null)
   * @param {Function}       onNodeSelect  (nodeId | null)
   */
  constructor({ camera, domElement, nodeSystem, graphEngine, cameraCtrl, onNodeHover, onNodeSelect }) {
    this.camera      = camera;
    this.dom         = domElement;
    this.nodeSystem  = nodeSystem;
    this.graphEngine = graphEngine;
    this.cameraCtrl  = cameraCtrl;
    this.onHover     = onNodeHover  ?? (() => {});
    this.onSelect    = onNodeSelect ?? (() => {});

    this._raycaster  = new THREE.Raycaster();
    this._raycaster.params.Points.threshold = 2;
    this._mouse      = new THREE.Vector2();
    this._hoveredId  = null;
    this._selectedId = null;
    this._dragNode   = null;
    this._dragPlane  = new THREE.Plane();
    this._dragOffset = new THREE.Vector3();
    this._isDragging = false;
    this._lastClick  = 0;

    // Throttled raycast to keep FPS high
    this._raycastThrottled = throttle(this._performRaycast.bind(this), 60);

    this._bindEvents();
  }

  _bindEvents() {
    const dom = this.dom;
    dom.addEventListener('mousemove',  this._onMouseMove.bind(this),  { passive: true });
    dom.addEventListener('mousedown',  this._onMouseDown.bind(this));
    dom.addEventListener('mouseup',    this._onMouseUp.bind(this));
    dom.addEventListener('click',      this._onClick.bind(this));
    dom.addEventListener('dblclick',   this._onDblClick.bind(this));
    document.addEventListener('keydown', this._onKey.bind(this));
  }

  _toNDC(event) {
    const rect = this.dom.getBoundingClientRect();
    this._mouse.x =  ((event.clientX - rect.left) / rect.width)  * 2 - 1;
    this._mouse.y = -((event.clientY - rect.top)  / rect.height) * 2 + 1;
  }

  _performRaycast() {
    this._raycaster.setFromCamera(this._mouse, this.camera);
    const meshes = this.nodeSystem.getMeshes();
    const hits   = this._raycaster.intersectObjects(meshes, false);

    const id = hits.length > 0 ? hits[0].object.userData.nodeId : null;
    if (id !== this._hoveredId) {
      this._hoveredId = id;
      this.onHover(id);
    }
    return hits.length > 0 ? { hit: hits[0], nodeId: id } : null;
  }

  _onMouseMove(e) {
    this._toNDC(e);
    this._raycastThrottled();

    // ── Drag logic
    if (this._dragNode && this._isDragging) {
      this._raycaster.setFromCamera(this._mouse, this.camera);
      const pt = new THREE.Vector3();
      this._raycaster.ray.intersectPlane(this._dragPlane, pt);
      pt.sub(this._dragOffset);

      this._dragNode.x = pt.x;
      this._dragNode.y = pt.y;
      this._dragNode.z = pt.z;

      const mesh = this.nodeSystem.getMesh(this._dragNode.id);
      if (mesh) mesh.position.set(pt.x, pt.y, pt.z);
    }
  }

  _onMouseDown(e) {
    if (e.button !== 0) return;
    this._toNDC(e);
    const result = this._performRaycast();

    if (result) {
      // Find the node data object
      const mesh     = result.hit.object;
      const nodeId   = mesh.userData.nodeId;
      const graphNode = this.graphEngine.nodes.find(n => n.id === nodeId);
      if (!graphNode) return;

      this._dragNode   = graphNode;
      this._isDragging = false;

      // Set up a drag plane facing the camera at the node's depth
      const normal = new THREE.Vector3().subVectors(this.camera.position, mesh.position).normalize();
      this._dragPlane.setFromNormalAndCoplanarPoint(normal, mesh.position);
      const pt = new THREE.Vector3();
      this._raycaster.ray.intersectPlane(this._dragPlane, pt);
      this._dragOffset.subVectors(pt, mesh.position);

      this.graphEngine.pin(graphNode);
      this.cameraCtrl.controls.enabled = false; // disable orbit while dragging
    }
  }

  _onMouseUp(e) {
    if (this._dragNode) {
      this.graphEngine.unpin(this._dragNode);
      this._dragNode   = null;
      this._isDragging = false;
    }
    this.cameraCtrl.controls.enabled = true;
  }

  _onClick(e) {
    // Distinguish drag from click
    if (this._isDragging) return;
    this._toNDC(e);
    const result = this._performRaycast();
    const id = result?.nodeId ?? null;
    if (id !== this._selectedId) {
      this._selectedId = id;
      this.onSelect(id);
    } else if (!id) {
      this._selectedId = null;
      this.onSelect(null);
    }
  }

  _onDblClick(e) {
    this._toNDC(e);
    const result = this._performRaycast();
    if (result) {
      const mesh = result.hit.object;
      this.cameraCtrl.focusOn(mesh.position);
    }
  }

  _onKey(e) {
    if (e.key === 'Escape') {
      this._selectedId = null;
      this.onSelect(null);
      this.cameraCtrl.reset();
    }
    if (e.key === 'f' && this._selectedId) {
      const mesh = this.nodeSystem.getMesh(this._selectedId);
      if (mesh) this.cameraCtrl.focusOn(mesh.position);
    }
  }

  /** Mark that dragging has started (called from mousemove after threshold) */
  setDragging() { this._isDragging = true; }
}
