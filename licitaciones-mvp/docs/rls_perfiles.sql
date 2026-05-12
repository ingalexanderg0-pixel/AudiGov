-- ==============================================================================
-- CORRECCIÓN DE RLS PARA PERFILES (Evitar "Usuario Desconocido")
-- Ejecutar este script en el SQL Editor de Supabase
-- ==============================================================================

-- 1. Habilitar RLS en la tabla perfiles (por si acaso no está)
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar la política restrictiva de SELECT si existe
-- (A veces Supabase crea por defecto una política que solo deja ver tu propio perfil)
DROP POLICY IF EXISTS "Permitir a los usuarios ver su propio perfil" ON perfiles;
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON perfiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON perfiles;
DROP POLICY IF EXISTS "Permitir lectura publica de perfiles" ON perfiles;
DROP POLICY IF EXISTS "Permitir SELECT a todos los usuarios autenticados en perfiles" ON perfiles;

-- 3. Crear una nueva política que permita a todos los usuarios autenticados
-- ver la información básica (nombre, email) de TODOS los perfiles.
-- Esto es fundamental para que el Admin pueda ver quién descargó un archivo
-- y para que los Ciudadanos puedan ver quién subió un contrato.
CREATE POLICY "Permitir SELECT a todos los usuarios autenticados en perfiles"
ON perfiles
FOR SELECT
TO authenticated
USING (true);
