# Neural Graph Visualizer

> **Un visualizador de grafos arquitectónicos 3D con estética de red neuronal viva.**  
> Construido con Three.js + WebGL. Lee el `graph.json` de Graphify y lo transforma en una experiencia cinematográfica interactiva.

---

## ⚡ Inicio Rápido

### Requisito
Necesitas servir el proyecto via HTTP (no abrir `index.html` directamente como archivo) por restricciones CORS al cargar `graph.json`.

### Opción A — Live Server (VS Code)
1. Abre la carpeta `graphify-out/` en VS Code
2. Clic derecho en `neural-visualizer/index.html`
3. Selecciona **"Open with Live Server"**

### Opción B — npx serve
```bash
# Desde la raíz del proyecto (donde está graphify-out/)
cd graphify-out
npx serve .
# Luego abre: http://localhost:3000/neural-visualizer/
```

### Opción C — Python
```bash
cd graphify-out
python -m http.server 8080
# Luego abre: http://localhost:8080/neural-visualizer/
```

---

## 🎮 Controles de Navegación

| Acción | Control |
|--------|---------|
| **Rotar** | Click izquierdo + arrastrar |
| **Zoom** | Scroll del mouse |
| **Pan** | Click derecho + arrastrar |
| **Seleccionar nodo** | Click en un nodo |
| **Enfocar nodo** | Doble click en un nodo |
| **Arrastrar nodo** | Click izquierdo en nodo + arrastrar |
| **Reset cámara** | `ESC` o botón ⟳ |
| **Enfocar selección** | Tecla `F` |
| **Cerrar panel** | Botón ✕ o `ESC` |

---

## 🗂️ Estructura del Proyecto

```
neural-visualizer/
├── index.html          — Entry point con importmap para Three.js
├── style.css           — Estilos globales + UI cyberpunk/glassmorphism
├── js/
│   ├── main.js         — Orquestador principal + animation loop
│   ├── dataLoader.js   — Carga y normaliza ../graph.json
│   ├── config.js       — Todas las constantes configurables
│   ├── utils.js        — Helpers matemáticos y de color
│   ├── renderer.js     — Setup Three.js + bloom post-processing
│   ├── graphEngine.js  — Motor de física force-directed 3D
│   ├── nodeSystem.js   — Meshes de nodos con shaders GLSL
│   ├── edgeSystem.js   — Conexiones + partículas viajeras
│   ├── particleSystem.js — Partículas ambientales de fondo
│   ├── camera.js       — OrbitControls + focus animation
│   ├── interactions.js — Raycasting, hover, click, drag
│   └── uiPanel.js      — Panel lateral + HUD + search
└── README.md
```

---

## ⚙️ Personalización

Edita **`js/config.js`** para ajustar la estética y el comportamiento:

```js
// Física del grafo
physics: {
  linkDistance:  100,    // distancia entre nodos conectados
  chargeStrength: -80,   // fuerza de repulsión (más negativo = más separado)
  alphaDecay:    0.015,  // velocidad de enfriamiento
}

// Visual de nodos
nodes: {
  baseSize:       5,     // tamaño mínimo
  maxSize:        22,    // tamaño máximo (hubs)
  glowIntensity:  1.8,   // intensidad del glow
  pulseSpeed:     0.8,   // velocidad de pulsación
}

// Bloom post-processing
bloom: {
  strength:   1.4,   // intensidad del bloom (0-3)
  radius:     0.75,  // radio de dispersión
  threshold:  0.55,  // umbral de luminancia
}
```

---

## 🎨 Paleta de Colores

El visualizador asigna automáticamente colores por **cluster/comunidad** del grafo:

| Color | Uso |
|-------|-----|
| `#00d9ff` Cyan eléctrico | Cluster 0 |
| `#0066ff` Azul royal | Cluster 1 |
| `#7c3aed` Violeta | Cluster 2 |
| `#06b6d4` Sky | Cluster 3 |
| `#10b981` Emerald | Cluster 4 |
| ... | ... |

Los colores de las **conexiones** indican el tipo de relación:
- **Cyan** → `imports_from`
- **Violeta** → `contains`
- **Naranja** → `calls`
- **Verde** → `imports`

---

## 🔍 Funcionalidades

### Panel de Información
Al hacer click en cualquier nodo se abre el panel derecho con:
- Nombre y tipo del nodo
- Archivo fuente y línea
- Cluster asignado
- Lista de conexiones entrantes y salientes
- Botón **Focus Camera** — acerca la cámara al nodo
- Botón **Isolate Cluster** — oculta nodos de otros clusters

### Búsqueda
La barra de búsqueda (centro superior) filtra nodos en tiempo real por nombre o path de archivo.

### Filtros
La barra inferior permite mostrar solo nodos de tipo:
- **All** — todo el grafo
- **Code** — archivos de código
- **Config** — archivos de configuración
- **Docs** — documentación

---

## 🚀 Performance

| Tamaño del grafo | FPS esperado |
|-----------------|-------------|
| < 100 nodos | 60 FPS |
| 100 – 300 nodos | 45-60 FPS |
| 300 – 600 nodos | 30-45 FPS |
| > 600 nodos | Reducir `particles.count` en config.js |

Si experimentas lag, en `config.js`:
```js
particles: { count: 400 },  // bajar de 1200
bloom: { strength: 0.8 },   // reducir bloom
```

---

## 🛠 Troubleshooting

**"No se carga el grafo / pantalla negra"**
→ Estás abriendo `index.html` como archivo. Necesitas un servidor HTTP.

**"CORS error en consola"**
→ Misma causa — usa Live Server o `npx serve`.

**"Nodos se superponen"**
→ Aumenta `physics.chargeStrength` (ej: `-150`) en config.js y recarga.

**"Va lento"**
→ Reduce `particles.count` a 400-600 y `bloom.strength` a 0.8.

**"No veo las conexiones"**
→ El grafo puede estar muy disperso. Reduce `physics.linkDistance` a 60.

---

## 📦 Stack Técnico

- **Three.js r163** — WebGL 3D rendering
- **EffectComposer + UnrealBloomPass** — Post-processing bloom/glow
- **OrbitControls** — Navegación de cámara
- **Custom GLSL Shaders** — Efectos visuales de nodos y partículas
- **Pure JS Force Simulation** — Física sin dependencias externas
- Sin frameworks, sin bundlers, sin dependencias npm

---

*Neural Graph Visualizer — parte del proyecto AudiGov*
