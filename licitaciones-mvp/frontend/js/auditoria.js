/**
 * auditoria.js - Sistema de auditoría inmutable
 * Registra todas las acciones: CREAR, MODIFICAR, ELIMINAR, VER, DESCARGAR
 */

import supabaseClient from './supabaseClient.js';

export const ACCIONES = {
  CREAR: 'CREAR',
  MODIFICAR: 'MODIFICAR',
  ELIMINAR: 'ELIMINAR',
  VER: 'VER',
  DESCARGAR: 'DESCARGAR',
  VERIFICAR_HASH: 'VERIFICAR_HASH'
};

/**
 * Registrar una acción en el log de auditoría.
 * @param {Object} entrada - { contrato_id, usuario_id, accion, descripcion, hash_resultado, campos_modificados }
 */
export async function registrarAccion({ contrato_id, usuario_id, accion, descripcion, hash_resultado = null, campos_modificados = null }) {
  const { data, error } = await supabaseClient
    .from('auditoria')
    .insert({
      contrato_id,
      usuario_id,
      accion,
      descripcion,
      hash_resultante: hash_resultado
    })
    .select()
    .single();

  if (error) {
    console.error('Error al registrar auditoría:', error);
    return null;
  }
  return data;
}

/**
 * Obtener el historial de auditoría de un contrato.
 */
export async function obtenerHistorialContrato(contratoId) {
  const { data: historial, error } = await supabaseClient
    .from('auditoria')
    .select('*')
    .eq('contrato_id', contratoId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  for (const entrada of historial) {
    if (entrada.usuario_id) {
      const { data: perfil } = await supabaseClient
        .from('perfiles')
        .select('nombre')
        .eq('id', entrada.usuario_id)
        .single();
      if (perfil) entrada.perfiles = perfil;
    }
  }



  return historial;
}

/**
 * Obtener el historial global de auditoría (para administradores).
 */
export async function obtenerHistorialGlobal(filtros = {}) {
  let query = supabaseClient
    .from('auditoria')
    .select('*, contratos(titulo)', { count: 'exact' });

  if (filtros.accion) {
    query = query.eq('accion', filtros.accion);
  }

  query = query.order('created_at', { ascending: false });

  const pagina = filtros.pagina || 1;
  const porPagina = filtros.porPagina || 20;
  const desde = (pagina - 1) * porPagina;
  query = query.range(desde, desde + porPagina - 1);

  const { data: historial, error, count } = await query;
  if (error) throw error;

  for (const entrada of historial) {
    if (entrada.usuario_id) {
      const { data: perfil } = await supabaseClient
        .from('perfiles')
        .select('nombre')
        .eq('id', entrada.usuario_id)
        .single();
      if (perfil) entrada.perfiles = perfil;
    }
  }

  return { data: historial, count };
}

/**
 * Formatear una entrada de auditoría para mostrar al usuario.
 */
export function formatearEntradaAuditoria(entrada) {
  const ts = entrada.timestamp || entrada.created_at;
  const fecha = new Date(ts.endsWith('Z') ? ts : ts + 'Z').toLocaleString('es-MX', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  const iconos = { CREAR: '✅', MODIFICAR: '✏️', ELIMINAR: '🗑️', VER: '👁️', DESCARGAR: '📥', VERIFICAR_HASH: '🔐' };
  return `${iconos[entrada.accion] || '📋'} ${entrada.descripcion} — ${fecha}`;
}
