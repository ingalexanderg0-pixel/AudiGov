/**
 * i18n.js
 * Internacionalización del Neural Graph Visualizer.
 * Soporta: Español (es), English (en), Português (pt),
 *           Français (fr), Italiano (it)
 *
 * Uso:
 *   import { i18n } from './i18n.js';
 *   i18n.setLang('es');
 *   i18n.t('hud.nodes')  // → "NODOS"
 */

const TRANSLATIONS = {

  // ─── ESPAÑOL ──────────────────────────────────────────
  es: {
    lang:  { name: 'Español', flag: '🇪🇸', code: 'es' },

    loading: {
      title:    'Iniciando red neuronal...',
      subtitle: 'Cargando arquitectura del proyecto...',
      error:    '⚠ Error al cargar graph.json. Asegúrate de usar un servidor HTTP.',
    },

    hud: {
      nodes:    'NODOS',
      edges:    'ARISTAS',
      clusters: 'CLUSTERS',
      fps:      'FPS',
      reset:    'Resetear cámara',
      autorotate: 'Rotación automática',
      fullscreen: 'Pantalla completa',
    },

    search: {
      placeholder: 'Buscar nodos...',
    },

    filters: {
      label:  'FILTRO',
      all:    'Todo',
      code:   'Código',
      config: 'Config',
      docs:   'Docs',
    },

    panel: {
      defaultTitle:    'Selecciona un nodo',
      sourceFile:      'Archivo fuente',
      location:        'Ubicación',
      community:       'Comunidad / Cluster',
      outgoing:        'Conexiones salientes',
      incoming:        'Conexiones entrantes',
      none:            'Ninguna',
      focusCamera:     '⊕ Enfocar cámara',
      isolateCluster:  '◎ Aislar cluster',
      close:           'Cerrar panel',
    },

    legend: {
      title: 'TIPOS DE RELACIÓN',
    },

    controls: {
      help: '🖱 Arrastrar · Scroll Zoom · Clic Seleccionar · Doble clic Enfocar · ESC Resetear',
    },

    tooltip: {
      // tipos de nodo
      code:   'CÓDIGO',
      config: 'CONFIG',
      docs:   'DOCS',
    },
  },

  // ─── ENGLISH ──────────────────────────────────────────
  en: {
    lang:  { name: 'English', flag: '🇺🇸', code: 'en' },

    loading: {
      title:    'Initializing synaptic network...',
      subtitle: 'Loading project architecture...',
      error:    '⚠ Could not load graph.json. Please use an HTTP server.',
    },

    hud: {
      nodes:    'NODES',
      edges:    'EDGES',
      clusters: 'CLUSTERS',
      fps:      'FPS',
      reset:    'Reset Camera',
      autorotate: 'Auto Rotate',
      fullscreen: 'Fullscreen',
    },

    search: {
      placeholder: 'Search nodes...',
    },

    filters: {
      label:  'FILTER',
      all:    'All',
      code:   'Code',
      config: 'Config',
      docs:   'Docs',
    },

    panel: {
      defaultTitle:    'Select a Node',
      sourceFile:      'Source File',
      location:        'Location',
      community:       'Community / Cluster',
      outgoing:        'Outgoing Connections',
      incoming:        'Incoming Connections',
      none:            'None',
      focusCamera:     '⊕ Focus Camera',
      isolateCluster:  '◎ Isolate Cluster',
      close:           'Close panel',
    },

    legend: {
      title: 'RELATION TYPES',
    },

    controls: {
      help: '🖱 Drag · Scroll Zoom · Click Select · Dbl-click Focus · ESC Reset',
    },

    tooltip: {
      code:   'CODE',
      config: 'CONFIG',
      docs:   'DOCS',
    },
  },

  // ─── PORTUGUÊS ────────────────────────────────────────
  pt: {
    lang:  { name: 'Português', flag: '🇧🇷', code: 'pt' },

    loading: {
      title:    'Inicializando rede neural...',
      subtitle: 'Carregando arquitetura do projeto...',
      error:    '⚠ Não foi possível carregar graph.json. Use um servidor HTTP.',
    },

    hud: {
      nodes:    'NÓS',
      edges:    'ARESTAS',
      clusters: 'CLUSTERS',
      fps:      'FPS',
      reset:    'Redefinir câmera',
      autorotate: 'Rotação automática',
      fullscreen: 'Tela cheia',
    },

    search: {
      placeholder: 'Pesquisar nós...',
    },

    filters: {
      label:  'FILTRO',
      all:    'Todos',
      code:   'Código',
      config: 'Config',
      docs:   'Docs',
    },

    panel: {
      defaultTitle:    'Selecione um nó',
      sourceFile:      'Arquivo fonte',
      location:        'Localização',
      community:       'Comunidade / Cluster',
      outgoing:        'Conexões de saída',
      incoming:        'Conexões de entrada',
      none:            'Nenhuma',
      focusCamera:     '⊕ Focar câmera',
      isolateCluster:  '◎ Isolar cluster',
      close:           'Fechar painel',
    },

    legend: {
      title: 'TIPOS DE RELAÇÃO',
    },

    controls: {
      help: '🖱 Arrastar · Scroll Zoom · Clicar Selecionar · Duplo clique Focar · ESC Redefinir',
    },

    tooltip: {
      code:   'CÓDIGO',
      config: 'CONFIG',
      docs:   'DOCS',
    },
  },

  // ─── FRANÇAIS ─────────────────────────────────────────
  fr: {
    lang:  { name: 'Français', flag: '🇫🇷', code: 'fr' },

    loading: {
      title:    'Initialisation du réseau neuronal...',
      subtitle: 'Chargement de l\'architecture du projet...',
      error:    '⚠ Impossible de charger graph.json. Utilisez un serveur HTTP.',
    },

    hud: {
      nodes:    'NŒUDS',
      edges:    'ARÊTES',
      clusters: 'CLUSTERS',
      fps:      'FPS',
      reset:    'Réinitialiser la caméra',
      autorotate: 'Rotation automatique',
      fullscreen: 'Plein écran',
    },

    search: {
      placeholder: 'Rechercher des nœuds...',
    },

    filters: {
      label:  'FILTRE',
      all:    'Tout',
      code:   'Code',
      config: 'Config',
      docs:   'Docs',
    },

    panel: {
      defaultTitle:    'Sélectionnez un nœud',
      sourceFile:      'Fichier source',
      location:        'Emplacement',
      community:       'Communauté / Cluster',
      outgoing:        'Connexions sortantes',
      incoming:        'Connexions entrantes',
      none:            'Aucune',
      focusCamera:     '⊕ Centrer la caméra',
      isolateCluster:  '◎ Isoler le cluster',
      close:           'Fermer le panneau',
    },

    legend: {
      title: 'TYPES DE RELATION',
    },

    controls: {
      help: '🖱 Glisser · Scroll Zoom · Clic Sélection · Double clic Focus · ESC Réinitialiser',
    },

    tooltip: {
      code:   'CODE',
      config: 'CONFIG',
      docs:   'DOCS',
    },
  },

  // ─── ITALIANO ─────────────────────────────────────────
  it: {
    lang:  { name: 'Italiano', flag: '🇮🇹', code: 'it' },

    loading: {
      title:    'Inizializzazione rete neurale...',
      subtitle: 'Caricamento architettura del progetto...',
      error:    '⚠ Impossibile caricare graph.json. Usa un server HTTP.',
    },

    hud: {
      nodes:    'NODI',
      edges:    'ARCHI',
      clusters: 'CLUSTER',
      fps:      'FPS',
      reset:    'Reimposta fotocamera',
      autorotate: 'Rotazione automatica',
      fullscreen: 'Schermo intero',
    },

    search: {
      placeholder: 'Cerca nodi...',
    },

    filters: {
      label:  'FILTRO',
      all:    'Tutti',
      code:   'Codice',
      config: 'Config',
      docs:   'Docs',
    },

    panel: {
      defaultTitle:    'Seleziona un nodo',
      sourceFile:      'File sorgente',
      location:        'Posizione',
      community:       'Comunità / Cluster',
      outgoing:        'Connessioni in uscita',
      incoming:        'Connessioni in entrata',
      none:            'Nessuna',
      focusCamera:     '⊕ Centra fotocamera',
      isolateCluster:  '◎ Isola cluster',
      close:           'Chiudi pannello',
    },

    legend: {
      title: 'TIPI DI RELAZIONE',
    },

    controls: {
      help: '🖱 Trascina · Scroll Zoom · Clic Seleziona · Doppio clic Focus · ESC Reimposta',
    },

    tooltip: {
      code:   'CODICE',
      config: 'CONFIG',
      docs:   'DOCS',
    },
  },
};

// ─────────────────────────────────────────────────────────
//  i18n Singleton
// ─────────────────────────────────────────────────────────
class I18n {
  constructor() {
    // Detect browser language, fallback to 'en'
    const browserLang = navigator.language?.slice(0, 2).toLowerCase();
    const supported   = Object.keys(TRANSLATIONS);
    this._lang = supported.includes(browserLang) ? browserLang : 'en';
    this._listeners = [];
  }

  /** Get current language code */
  get lang() { return this._lang; }

  /** Get all available languages */
  get languages() {
    return Object.values(TRANSLATIONS).map(l => l.lang);
  }

  /** Set active language and notify listeners */
  setLang(code) {
    if (!TRANSLATIONS[code]) {
      console.warn(`[i18n] Unsupported language: ${code}`);
      return;
    }
    this._lang = code;
    localStorage.setItem('neural-graph-lang', code);
    this._listeners.forEach(fn => fn(code));
  }

  /** Translate a dot-path key (e.g. 'panel.sourceFile') */
  t(key) {
    const parts = key.split('.');
    let obj = TRANSLATIONS[this._lang];
    for (const p of parts) {
      if (obj == null) break;
      obj = obj[p];
    }
    if (obj == null) {
      // Fallback to English
      obj = TRANSLATIONS.en;
      for (const p of parts) {
        if (obj == null) break;
        obj = obj[p];
      }
    }
    return typeof obj === 'string' ? obj : key;
  }

  /** Register a callback that fires on language change */
  onChange(fn) { this._listeners.push(fn); }

  /** Load persisted preference */
  loadPreference() {
    const saved = localStorage.getItem('neural-graph-lang');
    if (saved && TRANSLATIONS[saved]) this._lang = saved;
  }
}

export const i18n = new I18n();
