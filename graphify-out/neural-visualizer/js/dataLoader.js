/**
 * dataLoader.js
 * Fetches and normalises ../graph.json (Graphify format) into
 * a clean internal representation used by the rest of the engine.
 *
 * Graphify graph.json format:
 *   { nodes: [...], links: [...] }
 *   node: { id, label, file_type, source_file, source_location, community, norm_label }
 *   link: { source, target, relation, weight, confidence_score }
 */

export async function loadGraphData() {
  // Try relative path from neural-visualizer/ → graphify-out/graph.json
  const candidates = [
    '../graph.json',
    './graph.json',
    '../graphify-out/graph.json',
  ];

  let raw = null;
  for (const path of candidates) {
    try {
      const res = await fetch(path);
      if (res.ok) {
        raw = await res.json();
        console.log(`[DataLoader] Loaded graph.json from: ${path}`);
        break;
      }
    } catch {
      // try next
    }
  }

  if (!raw) throw new Error('Could not load graph.json. Please serve via HTTP (Live Server / npx serve).');

  return normalise(raw);
}

/**
 * Normalises Graphify's format into our internal format.
 * Returns: { nodes: Node[], edges: Edge[], meta }
 */
function normalise(raw) {
  const rawNodes = raw.nodes || raw.vertices || [];
  const rawLinks = raw.links || raw.edges || [];

  // ── Build edge map per node for connection counting
  const connectionCount = new Map();
  for (const n of rawNodes) connectionCount.set(n.id, 0);

  for (const l of rawLinks) {
    connectionCount.set(l.source, (connectionCount.get(l.source) ?? 0) + 1);
    connectionCount.set(l.target, (connectionCount.get(l.target) ?? 0) + 1);
  }

  // ── Nodes
  const nodes = rawNodes.map(n => ({
    id:           n.id,
    label:        n.label || n.norm_label || n.id,
    fileType:     n.file_type || 'code',
    sourceFile:   n.source_file || '',
    sourceLoc:    n.source_location || '',
    community:    n.community ?? 0,
    degree:       connectionCount.get(n.id) ?? 0,
    // Three.js simulation will attach x, y, z, vx, vy, vz
    x: (Math.random() - 0.5) * 600,
    y: (Math.random() - 0.5) * 600,
    z: (Math.random() - 0.5) * 600,
  }));

  // ── Edges (deduplicate same source+target pairs for rendering)
  const seen = new Set();
  const edges = [];
  for (const l of rawLinks) {
    const key = [l.source, l.target].sort().join('||');
    edges.push({
      source:    l.source,
      target:    l.target,
      relation:  l.relation || 'related',
      weight:    l.weight ?? 1,
      dedupKey:  key,
    });
    seen.add(key);
  }

  // ── Community count
  const communities = new Set(nodes.map(n => n.community));

  const meta = {
    nodeCount:      nodes.length,
    edgeCount:      edges.length,
    communityCount: communities.size,
    communities:    [...communities].sort(),
    builtAt:        raw.built_at_commit || null,
  };

  console.log(`[DataLoader] Normalised: ${nodes.length} nodes, ${edges.length} edges, ${communities.size} clusters`);
  return { nodes, edges, meta };
}
