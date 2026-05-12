/**
 * uiPanel.js
 * Manages the right-side glassmorphism info panel and
 * all HUD elements (stats, tooltip, search, filters).
 */

import { CONFIG }                         from './config.js';
import { clusterColor, formatPath, hexToCSS } from './utils.js';
import { i18n }                           from './i18n.js';

export class UIPanel {
  /**
   * @param {Object} graphData  — { nodes, edges, meta }
   * @param {Function} onFocusNode   (nodeId)
   * @param {Function} onSelectNode  (nodeId)
   * @param {Function} onFilterChange (filterType)
   */
  constructor(graphData, { onFocusNode, onSelectNode, onFilterChange }) {
    this.graphData     = graphData;
    this.onFocusNode   = onFocusNode   ?? (() => {});
    this.onSelectNode  = onSelectNode  ?? (() => {});
    this.onFilterChange = onFilterChange ?? (() => {});

    this._nodeMap = new Map(graphData.nodes.map(n => [n.id, n]));
    this._selectedId = null;

    // Build adjacency for panel display
    this._outgoing = new Map();  // nodeId → [{targetId, relation}]
    this._incoming = new Map();  // nodeId → [{sourceId, relation}]
    for (const n of graphData.nodes) {
      this._outgoing.set(n.id, []);
      this._incoming.set(n.id, []);
    }
    for (const e of graphData.edges) {
      this._outgoing.get(e.source)?.push({ id: e.target, relation: e.relation });
      this._incoming.get(e.target)?.push({ id: e.source, relation: e.relation });
    }

    this._bindUI();
  }

  _bindUI() {
    // HUD stats
    document.getElementById('node-count').textContent    = this.graphData.meta.nodeCount;
    document.getElementById('edge-count').textContent    = this.graphData.meta.edgeCount;
    document.getElementById('cluster-count').textContent = this.graphData.meta.communityCount;

    // Panel close
    document.getElementById('panel-close').addEventListener('click', () => this.closePanel());

    // Focus button
    document.getElementById('btn-focus').addEventListener('click', () => {
      if (this._selectedId) this.onFocusNode(this._selectedId);
    });

    // Isolate button
    document.getElementById('btn-isolate').addEventListener('click', () => {
      if (this._selectedId) this._isolateCluster(this._selectedId);
    });

    // Search
    const searchInput   = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      if (!q) { searchResults.innerHTML = ''; return; }

      const matches = this.graphData.nodes
        .filter(n => n.label.toLowerCase().includes(q) || n.sourceFile.toLowerCase().includes(q))
        .slice(0, 12);

      searchResults.innerHTML = matches.map(n => `
        <li data-id="${n.id}">
          <span>${this._highlight(n.label, q)}</span>
          <span class="result-type">${n.fileType?.toUpperCase() ?? 'CODE'}</span>
        </li>
      `).join('');

      searchResults.querySelectorAll('li').forEach(li => {
        li.addEventListener('click', () => {
          this.onSelectNode(li.dataset.id);
          searchInput.value = '';
          searchResults.innerHTML = '';
        });
      });
    });

    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Escape') { searchInput.value = ''; searchResults.innerHTML = ''; }
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.onFilterChange(btn.dataset.filter);
      });
    });
  }

  _highlight(text, query) {
    const idx = text.toLowerCase().indexOf(query);
    if (idx < 0) return text;
    return text.slice(0, idx)
      + `<mark style="background:rgba(0,217,255,0.25);color:#00d9ff;border-radius:2px">`
      + text.slice(idx, idx + query.length)
      + '</mark>'
      + text.slice(idx + query.length);
  }

  /** Open and populate the info panel with a node */
  showNode(nodeId) {
    const node = this._nodeMap.get(nodeId);
    if (!node) return;
    this._selectedId = nodeId;

    const panel  = document.getElementById('info-panel');
    const color  = hexToCSS(clusterColor(node.community));

    // Header
    document.getElementById('panel-node-name').textContent = node.label;
    document.getElementById('panel-node-type').textContent = node.fileType?.toUpperCase() ?? 'CODE';
    document.getElementById('panel-icon').style.color      = color;
    document.getElementById('panel-icon').style.textShadow = `0 0 20px ${color}`;

    // Source
    document.getElementById('panel-source').textContent   = formatPath(node.sourceFile) || '—';
    document.getElementById('panel-location').textContent = node.sourceLoc || '—';

    // Community chip
    const commEl = document.getElementById('panel-community');
    commEl.innerHTML = `
      <span class="community-chip" style="color:${color};border-color:${color}40;background:${color}10">
        <span style="width:8px;height:8px;border-radius:50%;background:${color};box-shadow:0 0 6px ${color};display:inline-block"></span>
        Cluster ${node.community}
      </span>
    `;

    // Outgoing connections
    const out     = this._outgoing.get(nodeId) ?? [];
    const outList = document.getElementById('panel-outgoing');
    document.getElementById('out-count').textContent = out.length;
    outList.innerHTML = out.slice(0, 20).map(({ id, relation }) => {
      const t = this._nodeMap.get(id);
      return `<li data-id="${id}">
        <span class="conn-icon">→</span>
        <span>${t?.label ?? id}</span>
        <span class="conn-relation">${relation}</span>
      </li>`;
    }).join('') || `<li style="opacity:0.4;cursor:default">${i18n.t('panel.none')}</li>`;

    // Incoming connections
    const inc     = this._incoming.get(nodeId) ?? [];
    const incList = document.getElementById('panel-incoming');
    document.getElementById('in-count').textContent = inc.length;
    incList.innerHTML = inc.slice(0, 20).map(({ id, relation }) => {
      const s = this._nodeMap.get(id);
      return `<li data-id="${id}">
        <span class="conn-icon">←</span>
        <span>${s?.label ?? id}</span>
        <span class="conn-relation">${relation}</span>
      </li>`;
    }).join('') || `<li style="opacity:0.4;cursor:default">${i18n.t('panel.none')}</li>`;

    // Click on connection item to navigate
    panel.querySelectorAll('.conn-list li[data-id]').forEach(li => {
      li.addEventListener('click', () => this.onSelectNode(li.dataset.id));
    });

    // Open
    panel.classList.add('open');
  }

  /** Close the panel */
  closePanel() {
    this._selectedId = null;
    const panel = document.getElementById('info-panel');
    panel.classList.remove('open');
    // Restore the placeholder title in the current language
    const nameEl = document.getElementById('panel-node-name');
    if (nameEl) nameEl.textContent = i18n.t('panel.defaultTitle');
    this.onSelectNode(null);
  }

  /** Update FPS display */
  updateFPS(fps) {
    document.getElementById('fps-count').textContent = fps;
  }

  /** Show tooltip near cursor */
  showTooltip(nodeId, x, y) {
    const node = this._nodeMap.get(nodeId);
    if (!node) return;
    const tip  = document.getElementById('node-tooltip');
    document.getElementById('tooltip-label').textContent = node.label;
    document.getElementById('tooltip-type').textContent  = node.fileType?.toUpperCase() ?? '';
    tip.style.left = x + 'px';
    tip.style.top  = y + 'px';
    tip.classList.add('visible');
  }

  /** Hide tooltip */
  hideTooltip() {
    document.getElementById('node-tooltip').classList.remove('visible');
  }

  /** Isolate cluster — show only nodes in same community */
  _isolateCluster(nodeId) {
    const node = this._nodeMap.get(nodeId);
    if (!node) return;
    // Trigger via external callback (handled in main.js)
    this.onFilterChange('cluster:' + node.community);
  }

  /** Hide loading screen */
  hideLoading() {
    document.getElementById('loading-screen').classList.add('hidden');
  }

  /** Update loading progress 0-100 */
  setProgress(pct) {
    document.getElementById('loader-bar-fill').style.width = pct + '%';
    document.getElementById('loader-pct').textContent      = Math.round(pct) + '%';
  }
}
