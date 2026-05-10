/**
 * hash.js - Generación de hash SHA-256 usando Web Crypto API
 *
 * Utiliza la API nativa del navegador (sin dependencias externas).
 * El hash garantiza la integridad de los documentos de licitación.
 */

/**
 * Generar hash SHA-256 de un archivo (File/Blob).
 * Útil para verificar la integridad de documentos PDF.
 *
 * @param {File|Blob} archivo - Archivo a hashear
 * @returns {Promise<string>} - Hash en formato hexadecimal
 */
export async function generarHashArchivo(archivo) {
  // Leer el archivo como ArrayBuffer
  const buffer = await archivo.arrayBuffer();

  // Generar hash con Web Crypto API
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);

  // Convertir a string hexadecimal
  return bufferToHex(hashBuffer);
}

/**
 * Generar hash SHA-256 de un string de texto.
 * Útil para hashear contenido de formularios o metadata.
 *
 * @param {string} texto - Texto a hashear
 * @returns {Promise<string>} - Hash en formato hexadecimal
 */
export async function generarHashTexto(texto) {
  const encoder = new TextEncoder();
  const data = encoder.encode(texto);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return bufferToHex(hashBuffer);
}

/**
 * Verificar si el hash de un archivo coincide con el hash almacenado.
 *
 * @param {File} archivo - Archivo a verificar
 * @param {string} hashEsperado - Hash SHA-256 almacenado en la base de datos
 * @returns {Promise<boolean>} - true si el archivo no fue alterado
 */
export async function verificarIntegridad(archivo, hashEsperado) {
  const hashActual = await generarHashArchivo(archivo);
  return hashActual === hashEsperado;
}

/**
 * Convertir ArrayBuffer a string hexadecimal.
 * @param {ArrayBuffer} buffer
 * @returns {string}
 */
function bufferToHex(buffer) {
  const byteArray = new Uint8Array(buffer);
  return Array.from(byteArray)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Formatear un hash para mostrar (acortado con puntos suspensivos).
 *
 * @param {string} hash - Hash completo de 64 caracteres
 * @param {number} [longitud=16] - Caracteres a mostrar al inicio y al final
 * @returns {string} - Hash formateado: "abc123...xyz789"
 */
export function formatearHash(hash, longitud = 16) {
  if (!hash || hash.length <= longitud * 2) return hash;
  return `${hash.slice(0, longitud)}...${hash.slice(-longitud)}`;
}
