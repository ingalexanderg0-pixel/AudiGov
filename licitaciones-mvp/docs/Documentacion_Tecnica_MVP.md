# Documentación Técnica: MVP Sistema de Transparencia AudiGov

Este documento detalla la arquitectura, estructura y decisiones técnicas detrás del MVP de Transparencia Gubernamental (AudiGov). El sistema está diseñado para gestionar, auditar y hacer públicos los contratos de licitaciones, priorizando la inmutabilidad de la información, la seguridad de acceso y una experiencia de usuario (UX) moderna.

---

## 1. Arquitectura y Tecnologías Base

El proyecto se construyó bajo un enfoque **Serverless + Frontend Puro** (Arquitectura de 2 niveles), eliminando la necesidad de gestionar servidores backend tradicionales.

### Stack Tecnológico
- **Frontend:** HTML5, CSS3, JavaScript Vanilla (ES Modules).
- **Backend as a Service (BaaS):** Supabase.
  - **Supabase Auth:** Autenticación por correo y contraseña.
  - **Supabase Database (PostgreSQL):** Almacenamiento relacional con Row Level Security (RLS).
  - **Supabase Storage:** Alojamiento de documentos PDF originales.

### Justificación de Tecnologías
- **Vanilla JavaScript:** Se optó por JS puro sin frameworks (como React o Angular) para mantener el MVP ligero, maximizar el rendimiento de carga y reducir la sobrecarga estructural inicial. El uso de ES Modules permite organizar el código lógicamente como si se utilizara un framework.
- **Supabase:** Permite implementar un backend completo (Base de Datos, Autenticación y Storage) de forma rápida y segura, delegando la protección de datos directamente a la base de datos a través de políticas RLS.

---

## 2. Estructura del Proyecto

La estructura de carpetas está inspirada en los principios de separación de responsabilidades (Separation of Concerns).

```text
/licitaciones-mvp
│
├── /frontend
│   ├── /assets          # Imágenes, íconos y recursos estáticos.
│   ├── /css             # Arquitectura CSS Modular.
│   │   ├── /base        # Reset, tipografías y variables (tokens de diseño).
│   │   ├── /components  # Estilos reutilizables (botones, tarjetas, modales).
│   │   ├── /pages       # Estilos específicos para vistas (login, dashboard).
│   │   ├── /utils       # Clases utilitarias y sistema de animaciones.
│   │   └── main.css     # Archivo orquestador que importa todos los módulos.
│   │
│   ├── /js              # Lógica de negocio e interacción con Supabase (ES Modules).
│   │   ├── auth.js      # Control de sesiones, login, registro y verificación de roles.
│   │   ├── contratos.js # CRUD de contratos (crear, leer, listar).
│   │   ├── auditoria.js # Motor de logs inmutables y trazabilidad.
│   │   ├── hash.js      # Lógica de encriptación SHA-256 local.
│   │   ├── transitions.js# Interceptor global para animaciones entre páginas.
│   │   ├── config.js    # Variables de entorno expuestas (URL y Anon Key).
│   │   └── supabaseClient.js # Singleton de inicialización de Supabase.
│   │
│   ├── /pages           # Vistas HTML principales del sistema.
│   │   ├── admin.html   # Panel de control de administradores.
│   │   ├── contratos.html# Listado público paginado de licitaciones.
│   │   ├── dashboard.html# Vista general, métricas y contratos recientes.
│   │   ├── detalle.html # Visor detallado de contrato e historial de auditoría.
│   │   ├── login.html   # Pantalla de autenticación.
│   │   └── subir.html   # Formulario de creación de contrato y subida de PDF.
│   │
│   └── index.html       # Punto de entrada / Landing page.
```

### El archivo `config.js` y `.env`
En un entorno de producción tradicional, los secretos se guardan en un archivo `.env` que el servidor procesa. Sin embargo, al ser una aplicación Frontend que se conecta directamente a Supabase, la URL y la llave pública (Anon Key) deben residir en `config.js`. Esto **no es un riesgo de seguridad**, ya que la seguridad real no recae en ocultar esta llave, sino en las **Políticas de Seguridad a Nivel de Fila (RLS)** de PostgreSQL en Supabase, las cuales determinan qué puede hacer cada usuario.

---

## 3. Lógica de Interacción y Módulos Core

### 3.1. Conexión de Supabase (`supabaseClient.js`)
Actúa como un **Singleton**. En lugar de inicializar la librería en cada archivo, este script crea una única instancia de `supabase` usando la URL y Key de `config.js` y la exporta. Todos los demás módulos de JS importan este cliente, ahorrando memoria y asegurando que la sesión persista de forma homogénea en toda la aplicación.

### 3.2. Módulo de Autenticación y Roles (`auth.js`)
Maneja el ciclo de vida del usuario.
- **Login:** Autentica usando `supabaseClient.auth.signInWithPassword`. Supabase devuelve un JWT que se guarda automáticamente en `localStorage`.
- **Verificación de Roles:** Al autenticarse, se hace una consulta a la tabla `perfiles` para obtener el rol (`admin` o `ciudadano`).
- **Protección de Rutas (`requireAuth`):** Funciona como un middleware de frontend. Verifica que exista un JWT válido antes de cargar páginas como `dashboard.html`. Si la sesión caducó, redirige inmediatamente a `login.html`.

### 3.3. Lógica de Protección de Interfaz (Anti-FOUC)
Para evitar que un ciudadano vea momentáneamente el panel o botón de "Subir Contrato" antes de que la API confirme su rol (parpadeo visual o FOUC), el sistema implementa una **estrategia de CSS asíncrono controlada**:
1. El CSS por defecto oculta todos los elementos con clase `.admin-only`.
2. Al iniciar sesión, se guarda temporalmente el rol en `localStorage`.
3. Un script síncrono en el `<head>` de los HTML lee este rol; si es `admin`, inyecta una clase `.is-admin` en el `<html>`.
4. Mediante CSS (`html.is-admin .admin-only { display: block; }`), los elementos se muestran.
5. De forma paralela y asíncrona, `auth.js` verifica la base de datos real para confirmar que no se haya modificado el localStorage, protegiendo así contra manipulaciones del lado del cliente.

### 3.4. Motor de Integridad y Hashes (`hash.js`)
Para garantizar la transparencia, los archivos PDF no solo se suben. Se procesan localmente usando la **Web Crypto API**:
- Antes de subir el archivo, el sistema lee los bytes del documento.
- Genera un hash **SHA-256** irrepetible y lo adjunta al registro del contrato.
- Esto permite auditar que el documento almacenado no ha sido alterado, ya que cualquier bit modificado cambiaría totalmente el hash resultante.

### 3.5. Trazabilidad y Auditoría (`auditoria.js`)
Cada vez que un administrador crea un contrato, este módulo se invoca. Interviene registrando un evento en la tabla `auditoria`, vinculando el UUID del contrato, la fecha, y el hash del estado en ese momento. Esto genera un **log inmutable**, similar a los principios de blockchain, asegurando un historial fidedigno.

---

## 4. Flujos de Trabajo (Data Flow)

### Flujo de Subida de Contratos
1. El administrador adjunta un archivo PDF y llena la metadata en `subir.html`.
2. `hash.js` calcula el SHA-256 del archivo en el navegador.
3. Se invoca a Supabase Storage para subir el archivo. Se retorna la URL pública.
4. `contratos.js` realiza un `INSERT` en la tabla `contratos` (PostgreSQL) con la metadata, la URL y el Hash.
5. Inmediatamente, se dispara `registrarAccion()` en `auditoria.js` para crear el primer registro del historial ("Contrato creado").
6. El sistema redirige a `detalle.html` utilizando navegación con anclas (`#id=...`) para prevenir fallos en la redirección de servidores web modernos.

### Flujo de Consulta Pública (Ciudadanos)
1. El ciudadano entra al `dashboard.html` o `contratos.html`.
2. Las peticiones de `listarContratos()` consultan la base de datos.
3. Por políticas de RLS, la base de datos filtra automáticamente los contratos en estado "borrador" y solo devuelve los "activos" o "cerrados".

---

## 5. Experiencia de Usuario (UX) y Animaciones

El sistema incorpora estándares modernos de SaaS para que, aunque sea un MVP, ofrezca una experiencia premium.

### Sistema de Navegación (`transitions.js`)
Se rechaza la navegación web tradicional ("clic y parpadeo en blanco"). En su lugar:
1. El motor intercepta los clics en los enlaces o tarjetas.
2. Añade la clase `.page-exit` al body, disparando una animación CSS horizontal hacia la izquierda (Workspace Switching).
3. Tras un temporizador de milisegundos que coincide con la animación CSS, ejecuta el `window.location.href`.
4. La nueva página, al cargar, tiene una animación `animate-in` predeterminada.
**Resultado:** Sensación fluida de SPA (Single Page Application) sin la pesadez de frameworks externos.

### Esqueletos de Carga (Skeleton Loading)
Para mitigar la fricción cognitiva de los tiempos de respuesta de la API de Supabase, se implementaron animaciones de **Shimmer** en CSS puro (`animations.css`). En lugar de mostrar un icono girando, se dibuja un "fantasma" parpadeante de las tarjetas o tablas que el usuario está esperando. Esto reduce el tiempo de espera percibido dramáticamente.

### Microinteracciones
Se añadieron sutiles efectos de escala (`transform: translateY(-2px)`) y sombras proyectadas (`box-shadow`) en botones y tarjetas al hacer hover o clic. Esto brinda un feedback táctil digital, asegurando al usuario que la interfaz está viva y respondiendo a sus acciones.
