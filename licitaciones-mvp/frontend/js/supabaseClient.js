/**
 * supabaseClient.js - Inicialización del cliente de Supabase
 *
 * Crea una instancia única (singleton) del cliente de Supabase
 * que se reutiliza en todo el proyecto.
 *
 * NOTA: Supabase se carga desde CDN en el HTML antes de este script.
 *       Por eso accedemos a `window.supabase` (variable global).
 */

import SUPABASE_CONFIG from './config.js';

// Desestructurar createClient desde la librería global de Supabase
// (cargada via <script> CDN en cada HTML)
const { createClient } = window.supabase;

// Validar que las credenciales han sido configuradas
if (
  SUPABASE_CONFIG.url === 'TU_SUPABASE_URL' ||
  SUPABASE_CONFIG.anonKey === 'TU_SUPABASE_ANON_KEY'
) {
  console.warn(
    '⚠️ LICITAPP: Credenciales de Supabase no configuradas.\n' +
    'Por favor, edita frontend/js/config.js con tus credenciales reales.'
  );
}

/**
 * Cliente de Supabase inicializado y listo para usar.
 * Exportar para uso en otros módulos JS.
 */
const supabaseClient = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey
);

export default supabaseClient;
