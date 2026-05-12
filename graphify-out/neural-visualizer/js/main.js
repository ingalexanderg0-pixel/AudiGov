/**
 * main.js
 * Application entry point — orchestrates all modules.
 *
 * Boot sequence:
 *   1. Show loading screen
 *   2. Fetch + normalise graph.json  (dataLoader)
 *   3. Create Three.js renderer      (renderer)
 *   4. Init physics engine           (graphEngine)
 *   5. Build node / edge meshes      (nodeSystem, edgeSystem)
 *   6. Spawn ambient particles       (particleSystem)
 *   7. Setup camera + interactions   (camera, interactions)
 *   8. Wire up UI                    (uiPanel)
 *   9. Start animation loop
 */

import { loadGraphData }    from './dataLoader.js';
import { createRenderer }   from './renderer.js';
import { GraphEngine }      from './graphEngine.js';
import { NodeSystem }       from './nodeSystem.js';
import { EdgeSystem }       from './edgeSystem.js';
import { ParticleSystem }   from './particleSystem.js';
import { CameraController } from './camera.js';
import { Interactions }     from './interactions.js';
import { UIPanel }          from './uiPanel.js';
import { CONFIG }           from './config.js';
import { nodeRadius, clusterColor } from './utils.js';
import { i18n }             from './i18n.js';
import { initLangController, t } from './langController.js';

// ─── State ────────────────────────────────────────────────
let renderer, scene, camera, composer;
let nodeSystem, edgeSystem, particleSystem;
let graphEngine;
let cameraCtrl;
let interactions;
let uiPanel;
let graphData;

let clock, lastTime = 0;
let frameCount = 0, fpsAccum = 0, fpsTick = 0;
let activeFilter   = 'all';
let selectedNodeId = null;
let filterTimeout  = null;

// ─── Boot ─────────────────────────────────────────────────
async function boot() {
  // ── 0. Language controller (runs before everything, no deps)
  initLangController();

  // Simulate loading steps for UX
  await setProgress(10);

  try {
    graphData = await loadGraphData();
  } catch (err) {
    document.querySelector('.loader-sub').textContent = '⚠ ' + err.message;
    document.querySelector('.loader-sub').style.color = '#ff5050';
    return;
  }

  await setProgress(30);

  // Three.js renderer
  const canvas = document.getElementById('neural-canvas');
  ({ renderer, scene, camera, composer } = createRenderer(canvas));

  await setProgress(45);

  // Physics engine
  graphEngine = new GraphEngine(graphData.nodes, graphData.edges);

  // Mesh systems
  nodeSystem = new NodeSystem(scene, graphData.nodes);
  edgeSystem = new EdgeSystem(scene, graphData.nodes, graphData.edges);

  await setProgress(65);

  particleSystem = new ParticleSystem(scene);

  // Camera controller
  cameraCtrl = new CameraController(camera, renderer.domElement);

  await setProgress(80);

  // UI
  uiPanel = new UIPanel(graphData, {
    onFocusNode:    handleFocusNode,
    onSelectNode:   handleSelectNode,
    onFilterChange: handleFilterChange,
  });

  // Interactions
  interactions = new Interactions({
    camera,
    domElement:  renderer.domElement,
    nodeSystem,
    graphEngine,
    cameraCtrl,
    onNodeHover:   handleNodeHover,
    onNodeSelect:  handleSelectNode,
  });

  // HUD buttons
  document.getElementById('btn-reset').addEventListener('click', () => cameraCtrl.reset());
  document.getElementById('btn-autorotate').addEventListener('click', (e) => {
    const on = cameraCtrl.toggleAutoRotate();
    e.currentTarget.classList.toggle('active', on);
  });
  document.getElementById('btn-fullscreen').addEventListener('click', toggleFullscreen);

  await setProgress(95);

  // Pre-warm physics for a cleaner initial layout
  for (let i = 0; i < 80; i++) graphEngine.tick();

  await setProgress(100);
  await delay(400);

  uiPanel.hideLoading();

  // Start loop
  clock    = performance.now();
  lastTime = clock;
  requestAnimationFrame(loop);
}

// ─── Animation Loop ────────────────────────────────────────
function loop(now) {
  requestAnimationFrame(loop);

  const dt = Math.min((now - lastTime) / 1000, 0.05); // cap delta to 50ms
  lastTime = now;

  // Physics
  graphEngine.tick();

  // Sync 3D objects to physics positions
  nodeSystem.update(dt);
  edgeSystem.update(dt);
  particleSystem.update(dt);
  cameraCtrl.update(dt);

  // Render via post-processing
  composer.render();

  // FPS counter
  fpsAccum  += dt;
  fpsTick   += 1;
  frameCount += 1;
  if (fpsAccum >= 1.0) {
    uiPanel.updateFPS(fpsTick);
    fpsTick  = 0;
    fpsAccum = 0;
  }
}

// ─── Event Handlers ────────────────────────────────────────

function handleNodeHover(nodeId) {
  if (nodeId) {
    nodeSystem.setHover(nodeId);
    const evt = window._lastMouseEvent;
    if (evt) uiPanel.showTooltip(nodeId, evt.clientX + 14, evt.clientY);
    renderer.domElement.style.cursor = 'pointer';
  } else {
    // Reset all nodes to default glow
    nodeSystem.setHover(null);
    uiPanel.hideTooltip();
    renderer.domElement.style.cursor = selectedNodeId ? 'default' : 'grab';
  }
}

function handleSelectNode(nodeId) {
  selectedNodeId = nodeId;
  nodeSystem.setSelected(nodeId);

  if (nodeId) {
    uiPanel.showNode(nodeId);
    // Auto-focus camera on selection
    const mesh = nodeSystem.getMesh(nodeId);
    if (mesh) cameraCtrl.focusOn(mesh.position, 150);
  } else {
    uiPanel.closePanel?.() ?? document.getElementById('info-panel').classList.remove('open');
    applyFilter(activeFilter);
  }
}

function handleFocusNode(nodeId) {
  const mesh = nodeSystem.getMesh(nodeId);
  if (mesh) cameraCtrl.focusOn(mesh.position, 120);
}

function handleFilterChange(filter) {
  if (filter.startsWith('cluster:')) {
    const communityId = parseInt(filter.split(':')[1]);
    const allowedIds  = new Set(
      graphData.nodes.filter(n => n.community === communityId).map(n => n.id)
    );
    nodeSystem.setVisible(allowedIds);
    return;
  }
  activeFilter = filter;
  applyFilter(filter);
}

function applyFilter(filter) {
  if (filter === 'all') {
    nodeSystem.setVisible(null); // show all
    return;
  }
  const allowedIds = new Set(
    graphData.nodes.filter(n => {
      if (filter === 'code')   return n.fileType === 'code';
      if (filter === 'config') return n.fileType === 'config';
      if (filter === 'docs')   return n.fileType === 'docs' || n.fileType === 'markdown';
      return true;
    }).map(n => n.id)
  );
  nodeSystem.setVisible(allowedIds);
}

// ─── Utilities ─────────────────────────────────────────────

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
}

// Track mouse globally for tooltip positioning
window.addEventListener('mousemove', e => { window._lastMouseEvent = e; }, { passive: true });

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function setProgress(pct) {
  // uiPanel may not exist yet during early boot — write directly to DOM
  const fill = document.getElementById('loader-bar-fill');
  const pctEl = document.getElementById('loader-pct');
  if (fill)  fill.style.width    = pct + '%';
  if (pctEl) pctEl.textContent   = Math.round(pct) + '%';
  if (uiPanel) uiPanel.setProgress(pct);
  await delay(20);
}

// ─── Kick off ──────────────────────────────────────────────
boot().catch(err => {
  console.error('[NeuralGraph] Boot failed:', err);
  const sub = document.querySelector('.loader-sub');
  if (sub) { sub.textContent = '⚠ Error: ' + err.message; sub.style.color = '#ff5050'; }
});
