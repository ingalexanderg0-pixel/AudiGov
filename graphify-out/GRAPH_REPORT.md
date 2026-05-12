# Graph Report - AudiGov  (2026-05-11)

## Corpus Check
- 15 files · ~12,153 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 86 nodes · 100 edges · 10 communities (9 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `29a95b8a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]

## God Nodes (most connected - your core abstractions)
1. `🏛️ Sistema de Transparencia en Licitaciones` - 7 edges
2. `Arquitectura del Sistema - LICITAPP` - 6 edges
3. `Documentación Técnica: MVP Sistema de Transparencia AudiGov` - 6 edges
4. `3. Lógica de Interacción y Módulos Core` - 6 edges
5. `registrarAccion()` - 5 edges
6. `generarHashArchivo()` - 5 edges
7. `supabaseClient` - 5 edges
8. `Plan de Acción: Finalización del Sistema de Auditoría Inmutable` - 5 edges
9. `4. Estructura de Datos (Supabase Schema Propuesto)` - 4 edges
10. `5. Experiencia de Usuario (UX) y Animaciones` - 4 edges

## Surprising Connections (you probably didn't know these)
- `actualizarContrato()` --calls--> `registrarAccion()`  [EXTRACTED]
  licitaciones-mvp/frontend/js/contratos.js → licitaciones-mvp/frontend/js/auditoria.js
- `crearContrato()` --calls--> `registrarAccion()`  [EXTRACTED]
  licitaciones-mvp/frontend/js/contratos.js → licitaciones-mvp/frontend/js/auditoria.js
- `eliminarContrato()` --calls--> `registrarAccion()`  [EXTRACTED]
  licitaciones-mvp/frontend/js/contratos.js → licitaciones-mvp/frontend/js/auditoria.js
- `subirArchivoPDF()` --calls--> `generarHashArchivo()`  [EXTRACTED]
  licitaciones-mvp/frontend/js/contratos.js → licitaciones-mvp/frontend/js/hash.js

## Communities (10 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.13
Nodes (14): 1. Arquitectura y Tecnologías Base, 2. Estructura del Proyecto, 4. Flujos de Trabajo (Data Flow), 5. Experiencia de Usuario (UX) y Animaciones, code:text (/licitaciones-mvp), Documentación Técnica: MVP Sistema de Transparencia AudiGov, El archivo `config.js` y `.env`, Esqueletos de Carga (Skeleton Loading) (+6 more)

### Community 1 - "Community 1"
Cohesion: 0.25
Nodes (10): registrarAccion(), actualizarContrato(), crearContrato(), eliminarContrato(), obtenerContrato(), subirArchivoPDF(), bufferToHex(), generarHashArchivo() (+2 more)

### Community 2 - "Community 2"
Cohesion: 0.27
Nodes (6): getCurrentUser(), getUserProfile(), isAdmin(), redirectIfAuthenticated(), requireAdmin(), requireAuth()

### Community 3 - "Community 3"
Cohesion: 0.2
Nodes (9): 1. Visión General, 2. Tecnologías Core, 3. Seguridad y Confianza, 4. Estructura de Datos (Supabase Schema Propuesto), 5. Decisiones de Diseño (ADR), Arquitectura del Sistema - LICITAPP, Tabla `auditoria`, Tabla `contratos` (+1 more)

### Community 4 - "Community 4"
Cohesion: 0.28
Nodes (3): ACCIONES, SUPABASE_CONFIG, supabaseClient

### Community 5 - "Community 5"
Cohesion: 0.25
Nodes (7): 🗂️ Estructura de la Base de Datos, 🎯 Funcionalidades Principales, 📦 Instalación, 🔐 Seguridad, 🏛️ Sistema de Transparencia en Licitaciones, 🚀 Tecnologías, 👥 Tipos de Usuario

### Community 6 - "Community 6"
Cohesion: 0.29
Nodes (6): Fase 1: Completar la Cobertura de Eventos de Trazabilidad, Fase 2: Implementación del Panel Global de Auditoría (Rol Admin), Fase 3: Enriquecimiento de la UI/UX del Historial, Fase 4: Blindaje de Inmutabilidad en Base de Datos (Seguridad RLS), Plan de Acción: Finalización del Sistema de Auditoría Inmutable, Resumen de Próximos Pasos Técnicos para Antigravity

### Community 7 - "Community 7"
Cohesion: 0.33
Nodes (6): 3.1. Conexión de Supabase (`supabaseClient.js`), 3.2. Módulo de Autenticación y Roles (`auth.js`), 3.3. Lógica de Protección de Interfaz (Anti-FOUC), 3.4. Motor de Integridad y Hashes (`hash.js`), 3.5. Trazabilidad y Auditoría (`auditoria.js`), 3. Lógica de Interacción y Módulos Core

## Knowledge Gaps
- **34 isolated node(s):** `ACCIONES`, `SUPABASE_CONFIG`, `anchor`, `🚀 Tecnologías`, `📦 Instalación` (+29 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Documentación Técnica: MVP Sistema de Transparencia AudiGov` connect `Community 0` to `Community 7`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `supabaseClient` connect `Community 4` to `Community 1`, `Community 2`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `3. Lógica de Interacción y Módulos Core` connect `Community 7` to `Community 0`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `ACCIONES`, `SUPABASE_CONFIG`, `anchor` to the rest of the system?**
  _34 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._