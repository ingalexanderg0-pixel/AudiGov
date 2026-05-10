/**
 * auth.js - Funciones de autenticación con Supabase
 *
 * Módulo completo para manejar:
 * - Login con email/password
 * - Registro de nuevos usuarios
 * - Cierre de sesión
 * - Obtención del usuario actual
 * - Obtención del perfil completo (con rol)
 * - Protección de rutas (requiere autenticación)
 */

import supabaseClient from './supabaseClient.js';

// =========================================
// AUTENTICACIÓN PRINCIPAL
// =========================================

/**
 * Iniciar sesión con email y contraseña.
 *
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<{user, session}>} - Datos del usuario autenticado
 * @throws {Error} - Si las credenciales son incorrectas
 */
export async function login(email, password) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password
  });

  if (error) throw error;
  return data;
}

/**
 * Registrar un nuevo usuario.
 *
 * Nota: El perfil en la tabla `perfiles` se crea automáticamente
 * mediante un trigger de Supabase al crear el usuario en auth.users.
 *
 * @param {string} email - Email del nuevo usuario
 * @param {string} password - Contraseña (mínimo 6 caracteres)
 * @param {string} nombre - Nombre completo del usuario
 * @returns {Promise<{user, session}>} - Datos del usuario creado
 * @throws {Error} - Si el email ya existe o la contraseña es muy corta
 */
export async function register(email, password, nombre) {
  const { data, error } = await supabaseClient.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: {
        nombre: nombre.trim()  // Metadata disponible en el trigger
      }
    }
  });

  if (error) throw error;
  return data;
}

/**
 * Cerrar la sesión del usuario actual.
 *
 * @returns {Promise<void>}
 * @throws {Error} - Si ocurre un error al cerrar sesión
 */
export async function logout() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) throw error;
  // Limpiar caché de rol para evitar que persista
  localStorage.removeItem('licitapp_role');
}

// =========================================
// INFORMACIÓN DEL USUARIO
// =========================================

/**
 * Obtener el usuario actualmente autenticado.
 *
 * @returns {Promise<User|null>} - Objeto de usuario o null si no está autenticado
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  return user;
}

/**
 * Obtener el perfil completo del usuario (tabla `perfiles`).
 * Incluye el rol (admin/ciudadano), nombre y otros datos extendidos.
 *
 * @param {string} userId - UUID del usuario (obtenido de getCurrentUser)
 * @returns {Promise<Object>} - Perfil completo con rol
 * @throws {Error} - Si el perfil no existe o hay un error de base de datos
 */
export async function getUserProfile(userId) {
  const { data, error } = await supabaseClient
    .from('perfiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  // Cachear el rol en localStorage para renderizado instantáneo (solo efectos de UI)
  if (data?.rol) localStorage.setItem('licitapp_role', data.rol);
  return data;
}

/**
 * Verificar si el usuario tiene rol de administrador.
 *
 * @param {string} userId - UUID del usuario
 * @returns {Promise<boolean>} - true si es admin, false si no
 */
export async function isAdmin(userId) {
  try {
    const profile = await getUserProfile(userId);
    return profile?.rol === 'admin';
  } catch {
    return false;
  }
}

// =========================================
// PROTECCIÓN DE RUTAS
// =========================================

/**
 * Verificar si el usuario está autenticado.
 * Si no lo está, redirige al login.
 *
 * Uso típico: llamar al inicio de cada página protegida.
 *
 * @returns {Promise<User>} - El usuario autenticado
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    // Guardar la URL actual para redirigir de vuelta después del login
    sessionStorage.setItem('redirectAfterLogin', window.location.href);
    window.location.href = './login.html';
    throw new Error('No autenticado');
  }

  return user;
}

/**
 * Verificar si el usuario es admin.
 * Si no lo es, redirige al dashboard.
 *
 * @returns {Promise<{user, profile}>} - Usuario y perfil si es admin
 */
export async function requireAdmin() {
  const user = await requireAuth();
  const profile = await getUserProfile(user.id);

  if (profile?.rol !== 'admin') {
    alert('Acceso denegado: Se requiere rol de administrador.');
    window.location.href = './dashboard.html';
    throw new Error('Acceso denegado');
  }

  return { user, profile };
}

/**
 * Redirigir al dashboard si el usuario ya está autenticado.
 * Usar en páginas de login/registro.
 *
 * @returns {Promise<void>}
 */
export async function redirectIfAuthenticated() {
  const user = await getCurrentUser();
  if (user) {
    window.location.href = './dashboard.html';
  }
}

// =========================================
// EVENTOS DE AUTENTICACIÓN
// =========================================

/**
 * Suscribirse a cambios de estado de autenticación.
 * Útil para sincronizar el estado del usuario en toda la app.
 *
 * @param {Function} callback - Función a llamar cuando cambie el estado
 * @returns {Function} - Función para cancelar la suscripción
 */
export function onAuthStateChange(callback) {
  const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
    (event, session) => {
      callback(event, session?.user ?? null);
    }
  );

  // Retornar función de limpieza
  return () => subscription.unsubscribe();
}
