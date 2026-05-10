/**
 * transitions.js
 *
 * Módulo de transiciones de página para LICITAPP.
 * Intercepta clics en links internos, aplica la animación
 * de salida (slide-left) y navega a la siguiente página.
 * La animación de entrada (slide-right) se aplica vía CSS al body.
 *
 * Uso: importar en cada página protegida como script module al final del body.
 *   <script type="module" src="../js/transitions.js"></script>
 */

(function () {
  const DURATION_EXIT = 250; // ms — debe coincidir con page-exit en CSS

  /**
   * Decide si un link es "interno" (mismo origen, no descarga, no _blank).
   */
  function esLinkInterno(anchor) {
    if (!anchor || !anchor.href) return false;
    if (anchor.target === '_blank') return false;
    if (anchor.hasAttribute('download')) return false;
    try {
      const url = new URL(anchor.href);
      return url.origin === window.location.origin;
    } catch {
      return false;
    }
  }

  /**
   * Navega con animación de salida.
   */
  function navegarCon(href) {
    // Si ya estamos en esa página, no hacer nada
    if (window.location.href === href) return;

    document.body.classList.add('page-exit');
    setTimeout(() => {
      window.location.href = href;
    }, DURATION_EXIT);
  }

  // Interceptar TODOS los clics del documento
  document.addEventListener('click', function (e) {
    const anchor = e.target.closest('a');
    if (!anchor) return;
    if (!esLinkInterno(anchor)) return;

    // No interceptar links con modificadores (Ctrl, Cmd, Shift)
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;

    e.preventDefault();
    navegarCon(anchor.href);
  }, { capture: true });

  // Exponer al scope global por si algún JS necesita navegar programáticamente
  window.navegarCon = navegarCon;

})();
