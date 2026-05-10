/**
 * contratos.js - CRUD completo de contratos
 *
 * Funciones para:
 * - Listar contratos (con filtros y paginación)
 * - Obtener un contrato por ID
 * - Crear nuevo contrato
 * - Actualizar contrato existente
 * - Eliminar contrato
 * - Subir archivo PDF a Supabase Storage
 */

import supabaseClient from './supabaseClient.js';
import { registrarAccion } from './auditoria.js';
import { generarHashArchivo } from './hash.js';

// =========================================
// LECTURA DE CONTRATOS
// =========================================

/**
 * Obtener lista de contratos con filtros opcionales.
 *
 * @param {Object} opciones - Opciones de filtrado y paginación
 * @param {string} [opciones.busqueda] - Texto a buscar en titulo/entidad
 * @param {string} [opciones.estado] - Estado del contrato (activo/cerrado/etc.)
 * @param {number} [opciones.pagina=1] - Número de página
 * @param {number} [opciones.porPagina=10] - Resultados por página
 * @returns {Promise<{data: Array, count: number}>}
 */
export async function listarContratos({ busqueda = '', estado = '', pagina = 1, porPagina = 10 } = {}) {
  let query = supabaseClient
    .from('contratos')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  // Filtrar por búsqueda de texto
  if (busqueda.trim()) {
    query = query.or(
      `titulo.ilike.%${busqueda}%,entidad.ilike.%${busqueda}%,descripcion.ilike.%${busqueda}%`
    );
  }

  // Filtrar por estado
  if (estado) {
    query = query.eq('estado', estado);
  }

  // Paginación
  const desde = (pagina - 1) * porPagina;
  query = query.range(desde, desde + porPagina - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return { data, count };
}

/**
 * Obtener un contrato por su ID.
 *
 * @param {string} id - UUID del contrato
 * @returns {Promise<Object>} - Datos del contrato
 * @throws {Error} - Si no existe el contrato
 */
export async function obtenerContrato(id) {
  const { data: contrato, error } = await supabaseClient
    .from('contratos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  if (contrato && contrato.creado_por) {
    const { data: perfil } = await supabaseClient
      .from('perfiles')
      .select('nombre')
      .eq('id', contrato.creado_por)
      .single();
    if (perfil) contrato.perfiles = perfil;
  }

  return contrato;
}

// =========================================
// CREACIÓN DE CONTRATOS
// =========================================

/**
 * Crear un nuevo contrato (solo admin).
 *
 * @param {Object} datosContrato - Datos del contrato
 * @param {string} datosContrato.titulo - Título del contrato
 * @param {string} datosContrato.entidad - Entidad contratante
 * @param {string} datosContrato.descripcion - Descripción
 * @param {number} datosContrato.monto - Monto en la moneda local
 * @param {string} datosContrato.estado - Estado (activo/cerrado/cancelado)
 * @param {string} datosContrato.fecha_inicio - Fecha de inicio (ISO string)
 * @param {string} datosContrato.fecha_fin - Fecha de fin (ISO string)
 * @param {File} [archivo] - Archivo PDF opcional
 * @param {string} userId - ID del usuario que sube el contrato
 * @returns {Promise<Object>} - Contrato creado
 */
export async function crearContrato(datosContrato, archivo, userId) {
  let urlArchivo = null;
  let hashArchivo = null;

  // Subir archivo PDF si existe
  if (archivo) {
    const resultado = await subirArchivoPDF(archivo, userId);
    urlArchivo = resultado.url;
    hashArchivo = resultado.hash;
  }

  // Insertar en la base de datos
  const { data, error } = await supabaseClient
    .from('contratos')
    .insert({
      ...datosContrato,
      archivo_url: urlArchivo,
      hash: hashArchivo,
      creado_por: userId
    })
    .select()
    .single();

  if (error) throw error;

  // Registrar en auditoría
  await registrarAccion({
    contrato_id: data.id,
    usuario_id: userId,
    accion: 'CREAR',
    descripcion: `Contrato "${data.titulo}" creado`,
    hash_resultado: hashArchivo
  });

  return data;
}

// =========================================
// ACTUALIZACIÓN DE CONTRATOS
// =========================================

/**
 * Actualizar un contrato existente (solo admin).
 *
 * @param {string} id - UUID del contrato
 * @param {Object} cambios - Campos a actualizar
 * @param {string} userId - ID del usuario que modifica
 * @returns {Promise<Object>} - Contrato actualizado
 */
export async function actualizarContrato(id, cambios, userId) {
  const { data, error } = await supabaseClient
    .from('contratos')
    .update({ ...cambios, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Registrar en auditoría
  await registrarAccion({
    contrato_id: id,
    usuario_id: userId,
    accion: 'MODIFICAR',
    descripcion: `Contrato "${data.titulo}" modificado`,
    campos_modificados: Object.keys(cambios)
  });

  return data;
}

// =========================================
// ELIMINACIÓN DE CONTRATOS
// =========================================

/**
 * Eliminar un contrato (solo admin).
 * Esta operación queda registrada en auditoría antes de eliminarse.
 *
 * @param {string} id - UUID del contrato
 * @param {string} userId - ID del usuario que elimina
 * @returns {Promise<void>}
 */
export async function eliminarContrato(id, userId) {
  // Primero obtener el contrato para el registro de auditoría
  const contrato = await obtenerContrato(id);

  // Registrar antes de eliminar
  await registrarAccion({
    contrato_id: id,
    usuario_id: userId,
    accion: 'ELIMINAR',
    descripcion: `Contrato "${contrato.titulo}" eliminado`
  });

  const { error } = await supabaseClient
    .from('contratos')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// =========================================
// MANEJO DE ARCHIVOS
// =========================================

/**
 * Subir un archivo PDF a Supabase Storage y generar su hash SHA-256.
 *
 * @param {File} archivo - Archivo PDF a subir
 * @param {string} userId - ID del usuario que sube
 * @returns {Promise<{url: string, hash: string}>}
 */
async function subirArchivoPDF(archivo, userId) {
  // Generar nombre único para evitar colisiones
  const timestamp = Date.now();
  const nombreSeguro = archivo.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const rutaArchivo = `contratos/${userId}/${timestamp}_${nombreSeguro}`;

  // Generar hash SHA-256 del archivo ANTES de subir
  const hash = await generarHashArchivo(archivo);

  // Subir a Supabase Storage
  const { data, error } = await supabaseClient.storage
    .from('documentos')  // Nombre del bucket en Supabase
    .upload(rutaArchivo, archivo, {
      cacheControl: '3600',
      upsert: false,
      contentType: 'application/pdf'
    });

  if (error) throw error;

  // Obtener URL pública del archivo
  const { data: urlData } = supabaseClient.storage
    .from('documentos')
    .getPublicUrl(data.path);

  return {
    url: urlData.publicUrl,
    hash
  };
}
