# Plan de Acción: Finalización del Sistema de Auditoría Inmutable

Basado en el análisis de la arquitectura actual y del módulo `auditoria.js`, el sistema ya cuenta con la base funcional (registros de creación, visualización y los modelos de datos básicos). Sin embargo, para cumplir con el estándar completo de transparencia gubernamental e inmutabilidad, proponemos las siguientes fases para concluir este módulo.

## Fase 1: Completar la Cobertura de Eventos de Trazabilidad
Actualmente se registran las acciones de `CREAR` (desde `subir.html`) y `VER` (desde `detalle.html`). Necesitamos cubrir el 100% de las interacciones con los documentos:

1. **Registrar Descargas (`DESCARGAR`):**
   - Interceptar el clic en el botón "Ver Documento PDF" (`btn-descargar`).
   - Antes de abrir el PDF, ejecutar `registrarAccion` en segundo plano para dejar la traza de que el usuario consultó el documento físico.

2. **Registrar Verificaciones de Integridad (`VERIFICAR_HASH`):**
   - Al pulsar "Verificar Integridad" (`btn-verificar`), capturar el resultado del análisis criptográfico.
   - Registrar la acción adjuntando en el campo `hash_resultado` el hash que se acaba de calcular. 
   - Si un documento fue manipulado externamente, esta traza dejará evidencia inmediata de que la verificación falló.

## Fase 2: Implementación del Panel Global de Auditoría (Rol Admin)
Actualmente, el historial de cambios solo se puede ver contrato por contrato en `detalle.html`. Los administradores necesitan visión global:

1. **Crear Vista `auditoria_global.html`:**
   - Una pantalla protegida por el sistema Anti-FOUC y validación estricta de rol (`admin-only`).
2. **Tabla Maestra de Trazabilidad:**
   - Mostrar un feed o tabla con todos los eventos ordenados por fecha descendente.
   - Mostrar columnas: *Fecha, Usuario (Nombre/Email), Acción (Icono + Texto), Contrato Afectado, Hash Referencia.*
3. **Filtros Avanzados:**
   - Implementar buscadores para filtrar los logs por: `Usuario`, `Acción` (ej. ver todas las descargas) o `Fecha`.

## Fase 3: Enriquecimiento de la UI/UX del Historial
Para que los ciudadanos comprendan mejor el "Timeline" (línea de tiempo) dentro de `detalle.html`:

1. **Indicadores de Integridad:**
   - Si la acción fue `VERIFICAR_HASH` y el hash coincidió, mostrar el registro con color verde. Si falló (el PDF fue manipulado), mostrar el registro en rojo crítico para alertar al ciudadano.
2. **Animaciones de Actualización:**
   - Si un admin edita un contrato mientras un ciudadano lo está viendo, utilizar transiciones suaves para que el nuevo log aparezca dinámicamente en el historial.

## Fase 4: Blindaje de Inmutabilidad en Base de Datos (Seguridad RLS)
El código frontend ya no permite borrar auditorías, pero hay que asegurar que la base de datos sea físicamente inmutable:

1. **Políticas de Supabase (RLS):**
   - `INSERT`: Permitir a cualquier usuario autenticado (ciudadanos y admins) agregar registros (para registrar sus propias visitas/descargas).
   - `SELECT`: Permitir a todos ver la auditoría de contratos activos.
   - `UPDATE` / `DELETE`: **Bloqueado para todos** (incluso administradores). Esto garantiza el cumplimiento del estándar de "Log Inmutable": ni siquiera el creador del sistema puede alterar la historia o borrar que alguien modificó un contrato.

---

### Resumen de Próximos Pasos Técnicos para Antigravity
1. Modificar `detalle.html` para agregar los EventListeners a `btn-descargar` y `btn-verificar`.
2. Crear `auditoria_global.html` y vincularlo en el menú de navegación del Dashboard para admins.
3. Desarrollar la lógica de consulta en `auditoria.js` para extraer logs globales (`obtenerHistorialGlobal()`).
