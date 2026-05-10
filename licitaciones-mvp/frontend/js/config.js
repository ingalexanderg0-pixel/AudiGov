/**
 * config.js - Configuración de credenciales de Supabase
 *
 * IMPORTANTE: En producción, no exponer claves en el frontend.
 * Para este MVP de frontend puro, las credenciales van aquí.
 * El usuario debe reemplazar los valores con sus credenciales reales.
 *
 * Dónde obtener las credenciales:
 * 1. Ir a https://supabase.com
 * 2. Seleccionar tu proyecto
 * 3. Settings → API
 * 4. Copiar "Project URL" y "anon public" key
 */

const SUPABASE_CONFIG = {
  url: 'https://wxywyyrvrbntiycuworb.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4eXd5eXJ2cmJudGl5Y3V3b3JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwODk2MDEsImV4cCI6MjA5MzY2NTYwMX0.aI6T6_LHl8K5kRxLpleln8bt6BfYLzCpi5p3HCQkpdo'
};

export default SUPABASE_CONFIG;
