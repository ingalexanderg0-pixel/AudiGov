# Arquitectura del Sistema - LICITAPP

## 1. Visión General
LICITAPP es un MVP diseñado con arquitectura "Serverless Frontend", utilizando HTML/CSS/JS nativo para el cliente y Supabase como Backend as a Service (BaaS).

## 2. Tecnologías Core
- **Frontend**: HTML5, CSS3 (Variables nativas, CSS Grid/Flexbox), JavaScript (ES6+ Modules)
- **Backend/Auth/DB/Storage**: Supabase
- **Criptografía**: Web Crypto API (Nativa del navegador)

## 3. Seguridad y Confianza
La arquitectura de confianza se basa en tres pilares:
1. **Identidad**: Autenticación gestionada por Supabase Auth.
2. **Integridad**: Cada PDF subido se hashea en el cliente usando SHA-256 antes de enviarse. El hash se guarda en la base de datos y sirve como huella digital inmutable.
3. **Auditoría**: Tabla `auditoria` de tipo "append-only". Cada acción (ver, descargar, modificar) deja un registro temporal firmado con el ID del usuario y la acción realizada.

## 4. Estructura de Datos (Supabase Schema Propuesto)

### Tabla `perfiles`
- `id` (uuid, references auth.users)
- `nombre` (text)
- `email` (text)
- `rol` (text) -> 'admin' | 'ciudadano'
- `created_at` (timestamp)

### Tabla `contratos`
- `id` (uuid)
- `titulo` (text)
- `entidad` (text)
- `estado` (text) -> 'activo' | 'cerrado' | 'cancelado'
- `monto` (numeric)
- `numero_licitacion` (text)
- `fecha_inicio` (date)
- `fecha_fin` (date)
- `descripcion` (text)
- `url_archivo` (text)
- `hash_archivo` (text)
- `subido_por` (uuid, references perfiles.id)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Tabla `auditoria`
- `id` (uuid)
- `contrato_id` (uuid, references contratos.id)
- `usuario_id` (uuid, references perfiles.id)
- `accion` (text)
- `descripcion` (text)
- `hash_resultado` (text)
- `campos_modificados` (jsonb)
- `timestamp` (timestamp)
- `ip_address` (text)

## 5. Decisiones de Diseño (ADR)
1. **Sin Framework de JS**: Para mantener el MVP extremadamente ligero, auditable y fácil de desplegar en entornos gubernamentales, se optó por Vanilla JS.
2. **CSS Modular**: Se diseñó un mini-framework CSS propio basado en utilidades para garantizar que el diseño sea escalable y fácil de mantener sin depender de Bootstrap o Tailwind.
3. **Hashing en Cliente**: Generar el hash del documento en el navegador antes de subirlo previene alteraciones en tránsito y asegura que el servidor no pueda modificar el archivo sin que el hash cambie.
