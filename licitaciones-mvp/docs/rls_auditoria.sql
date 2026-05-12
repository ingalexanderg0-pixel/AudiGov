-- ==============================================================================
-- FASE 4: BLINDAJE DE INMUTABILIDAD EN BASE DE DATOS (SEGURIDAD RLS)
-- Ejecutar este script en el SQL Editor de Supabase
-- ==============================================================================

-- 1. Habilitar RLS en la tabla auditoria (si no está habilitado ya)
ALTER TABLE auditoria ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas anteriores para evitar conflictos (opcional, por si acaso)
DROP POLICY IF EXISTS "Permitir SELECT a todos los usuarios autenticados" ON auditoria;
DROP POLICY IF EXISTS "Permitir INSERT a usuarios autenticados" ON auditoria;
DROP POLICY IF EXISTS "Bloquear UPDATE a todos" ON auditoria;
DROP POLICY IF EXISTS "Bloquear DELETE a todos" ON auditoria;

-- 3. Política SELECT: Cualquiera autenticado (ciudadano o admin) puede ver el historial
CREATE POLICY "Permitir SELECT a todos los usuarios autenticados"
ON auditoria
FOR SELECT
TO authenticated
USING (true);

-- 4. Política INSERT: Cualquiera autenticado puede agregar registros a la auditoría
-- Esto es vital para que un ciudadano pueda registrar que vio/descargó un documento.
CREATE POLICY "Permitir INSERT a usuarios autenticados"
ON auditoria
FOR INSERT
TO authenticated
WITH CHECK (
    -- Asegurarse de que el usuario que inserta el log es el mismo que está autenticado
    auth.uid() = usuario_id
);

-- 5. Bloqueo Absoluto de UPDATE: Inmutabilidad garantizada
-- Ni siquiera un admin puede alterar un registro existente.
CREATE POLICY "Bloquear UPDATE a todos"
ON auditoria
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

-- 6. Bloqueo Absoluto de DELETE: Inmutabilidad garantizada
-- Ni siquiera un admin puede eliminar un registro del historial.
CREATE POLICY "Bloquear DELETE a todos"
ON auditoria
FOR DELETE
TO authenticated
USING (false);

-- ==============================================================================
-- ¡Asegúrate de que la tabla 'auditoria' tenga la relación con la tabla 'perfiles'!
-- (Foreign Key: auditoria.usuario_id -> perfiles.id)
-- ==============================================================================
