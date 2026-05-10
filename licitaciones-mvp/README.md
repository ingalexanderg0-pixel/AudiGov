# 🏛️ Sistema de Transparencia en Licitaciones

MVP para auditar contratos públicos con hash inmutable.

## 🚀 Tecnologías
- HTML5 / CSS3 / JavaScript (Vanilla)
- Supabase (Auth + Database + Storage)
- Web Crypto API (SHA-256 para hash)

## 📦 Instalación
1. Clona el repositorio
2. Crea archivo `.env` con tus credenciales de Supabase
3. Abre `frontend/pages/login.html` en el navegador

## 👥 Tipos de Usuario
- **Admin**: Sube contratos, genera hash, crea registros de auditoría
- **Ciudadano**: Consulta contratos, audita transparencia

## 🗂️ Estructura de la Base de Datos
- `perfiles` (usuarios extendidos con rol)
- `contratos` (contratos públicos con hash)
- `auditoria` (historial inmutable de cambios)

## 🎯 Funcionalidades Principales
- ✅ Login y registro con Supabase Auth
- ✅ Generación automática de hash SHA-256
- ✅ Auditoría inmutable de contratos
- ✅ Diferenciación de roles (admin/ciudadano)
- ✅ Subida de archivos PDF

## 🔐 Seguridad
- Row Level Security (RLS) habilitado
- Hash criptográfico para integridad de datos
- Auditoría completa de modificaciones
