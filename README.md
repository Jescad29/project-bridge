# Project Bridge

Plantilla full-stack desacoplada construida con **Flask, React y PostgreSQL**, organizada bajo una arquitectura modular por capas, APIs RESTful, estado reactivo en cliente, pruebas automatizadas y orquestación multi-entorno con Docker.

---

## Objetivo

Este repositorio funciona como una base reutilizable y lista para producción para desarrollar aplicaciones web modernas (SaaS, CRMs, ERPs ligeros y sistemas internos) con una arquitectura limpia, mantenible y escalable.

Separa completamente el cliente y el servidor dentro de un mismo monorepo, aplicando separación de responsabilidades por dominios funcionales (*feature-first*) en frontend y arquitectura en capas en backend.

---

## Stack tecnológico

### Backend
- **Python 3.12+ / Flask 3:** Patrón *Application Factory* (`create_app`) y *Blueprints* modulares por versión (`/api/v1`).
- **SQLAlchemy 2 & PostgreSQL 16:** Modelado relacional, *Repository Pattern* y pool de conexiones configurado.
- **Flask-Migrate (Alembic):** Control de versiones y migraciones incrementales de esquema.
- **Flask-CORS:** Gestión segura de orígenes cruzados configurable por entorno.
- **Pytest:** Suite de pruebas automatizadas de integración aisladas en memoria (`TestingConfig`).
- **Gunicorn:** Servidor WSGI multi-worker para despliegue en producción.

### Frontend
- **React 19 & Vite:** Entorno de desarrollo rápido con soporte HMR (y *polling* configurado para volúmenes Docker en Windows).
- **Tailwind CSS v4 & shadcn/ui:** Sistema de diseño basado en variables semánticas OKLCH, primitivos accesibles (Base UI) e iconos Lucide.
- **React Router DOM:** Enrutamiento SPA con marco persistente (`MainLayout` + `<Outlet/>`) y navegación modular.
- **Zustand:** Gestión de estado global ligero y reactivo por dominio.
- **Axios:** Cliente HTTP centralizado con instancias desacopladas por módulo (`src/api/`).

### Infraestructura y Calidad
- **Docker & Docker Compose:** Entornos separados de desarrollo (`docker-compose.yml`) y producción (`docker-compose.prod.yml` con **Nginx** sirviendo el bundle estático y **Gunicorn** en backend).
- **Conventional Commits & GitHub Actions:** Estandarización de historial de cambios y flujos de integración continua.

---

## Arquitectura

### Flujo por capas en el Backend

Cada dominio de negocio (`projects`, `tasks`, `clients`, `users`, `auth`) está aislado en su propio paquete bajo `app/api/v1/<dominio>/` siguiendo un flujo unidireccional de responsabilidades:

```text
Cliente HTTP (Axios)
       ↓
  routes.py       (Blueprint HTTP, códigos de estado, JSON)
       ↓
  schemas.py      (Validación de entrada y serialización de salida)
       ↓
  service.py      (Reglas de negocio y orquestación)
       ↓
 repository.py    (Consultas y persistencia SQLAlchemy)
       ↓
   Model / SQL    (Entidades en app/models/)
       ↓
   PostgreSQL
```

### Arquitectura modular en el Frontend

El cliente sigue una estructura orientada a funcionalidades (*feature-first*) donde cada módulo encapsula sus componentes, hooks/stores de Zustand y páginas, renderizándose dentro de un layout compartido:

```text
App.jsx (<Toaster/> + <AppRouter/>)
       ↓
  MainLayout.jsx  (Sidebar fijo / Menú móvil + indicador API)
       ↓
   <Outlet/>     (Inyección dinámica según ruta activa)
       ├── /projects  → ProjectsPage (CRUD completo conectado a PostgreSQL)
       ├── /tasks     → TasksPage    (Módulo base listo para escalar)
       ├── /clients   → ClientsPage  (Módulo base listo para escalar)
       └── /users     → UsersPage    (Módulo base listo para escalar)
```

---

## Estructura del proyecto

```text
project-bridge/
├── backend/
│   ├── app/
│   │   ├── __init__.py             # Application Factory (create_app) y registro de Blueprints
│   │   ├── config.py               # Configuraciones por entorno (Dev, Testing, Prod)
│   │   ├── extensions.py           # Extensiones desacopladas (db, migrate, cors)
│   │   ├── logging_config.py
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── auth/
│   │   │       ├── users/
│   │   │       ├── projects/       # Módulo implementado (routes, schemas, service, repository)
│   │   │       ├── tasks/
│   │   │       └── clients/
│   │   ├── models/                 # Modelos SQLAlchemy (Project, etc.)
│   │   ├── common/
│   │   ├── errors/
│   │   ├── infrastructure/
│   │   └── utils/
│   ├── migrations/                 # Migraciones de Alembic / Flask-Migrate
│   ├── tests/
│   │   ├── conftest.py             # Fixtures globales de Pytest (app, client)
│   │   ├── unit/
│   │   └── integration/
│   │       └── api/
│   │           └── test_projects.py
│   ├── .env.example
│   ├── Dockerfile                  # Multi-stage (development / production con Gunicorn)
│   ├── requirements.txt
│   ├── main.py                     # Punto de entrada en desarrollo
│   └── wsgi.py                     # Punto de entrada WSGI en producción
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/                    # Cliente Axios base (client.js) y servicios por dominio
│   │   ├── components/
│   │   │   ├── common/             # Componentes compartidos (ModulePlaceholder.jsx)
│   │   │   ├── forms/
│   │   │   ├── layout/
│   │   │   └── ui/                 # Componentes base de shadcn/ui
│   │   ├── features/
│   │   │   ├── projects/           # Módulo activo (components, hooks/useProjectsStore, pages)
│   │   │   ├── tasks/
│   │   │   ├── clients/
│   │   │   └── users/
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx      # Navegación central responsiva y <Outlet/>
│   │   ├── routes/
│   │   │   └── AppRouter.jsx       # Definición centralizada de rutas SPA
│   │   ├── lib/
│   │   │   └── utils.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css               # Configuración de Tailwind CSS v4 y tokens OKLCH
│   ├── .env.example
│   ├── components.json             # Configuración de shadcn/ui
│   ├── jsconfig.json               # Alias de rutas (@/*)
│   ├── vite.config.js
│   ├── Dockerfile                  # Multi-stage (development / builder / production con Nginx)
│   └── package.json
│
├── docker/
│   └── postgres/
│       └── init.sql                # Extensiones iniciales de PostgreSQL (uuid-ossp)
├── docs/
│   ├── ARQUITECTURA.md
│   ├── api.md
│   └── database.md
├── .github/
│   └── workflows/
├── docker-compose.yml              # Orquestación de desarrollo (db + backend + frontend)
├── docker-compose.prod.yml         # Orquestación de producción (db + gunicorn + nginx)
├── README.md
└── LICENSE
```

---

## Inicio rápido con Docker (Recomendado)

### 1. Clonar el repositorio y preparar variables de entorno

```bash
git clone [https://github.com/Jescad29/project-bridge.git](https://github.com/Jescad29/project-bridge.git)
cd project-bridge
```

Crea los archivos `.env` a partir de sus plantillas:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Asegúrate de que `backend/.env` apunte al contenedor `db` cuando uses Docker Compose:

```env
FLASK_ENV=development
SECRET_KEY=cambia-esta-clave-en-produccion
DATABASE_URL=postgresql://bridge_user:bridge_pass@db:5432/project_bridge_dev
CORS_ORIGINS=http://localhost:5173,[http://127.0.0.1:5173](http://127.0.0.1:5173)
```

Y `frontend/.env`:

```env
VITE_API_URL=[http://127.0.0.1:5000/api/v1](http://127.0.0.1:5000/api/v1)
```

### 2. Levantar el stack completo

```bash
docker compose up -d --build
```

Si es la primera vez que creas el volumen de base de datos, aplica las migraciones dentro del contenedor del backend:

```bash
docker compose exec backend flask db upgrade
```

### 3. Accesos en desarrollo

- **Frontend (React + Vite):** http://localhost:5173
- **Backend API (Flask):** http://127.0.0.1:5000/api/v1/health
- **PostgreSQL:** `localhost:5432`

---

## Ejecución local sin contenedores (opcional)

### Backend
```bash
cd backend
python -m venv venv
# Windows PowerShell: .\venv\Scripts\activate | Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
flask db upgrade
python main.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Pruebas automatizadas

Para ejecutar la suite de pruebas de integración del backend con **Pytest** (sobre SQLite en memoria):

```bash
cd backend
pytest -v
```

---

## Estado actual y hoja de ruta

- [x] Estructura monorepo y orquestación multi-entorno con Docker (`dev` y `prod`).
- [x] Fábrica de aplicaciones Flask, configuración por entornos, CORS y migraciones con Alembic.
- [x] CRUD end-to-end del módulo **Proyectos** (`GET`, `POST`, `DELETE`) conectado a PostgreSQL.
- [x] Interfaz moderna con **React, Tailwind CSS v4, shadcn/ui, Zustand** y notificaciones con Sonner.
- [x] Navegación modular SPA con **React Router DOM** (`MainLayout` + `AppRouter`).
- [ ] Edición (`PUT` / `PATCH`) y detalle individual en módulo **Proyectos**.
- [ ] Implementación CRUD del módulo **Tareas** vinculado a `project_id`.
- [ ] Implementación de módulos **Clientes**, **Usuarios** y autenticación **JWT** (`auth`).
- [ ] Pipelines de integración continua en `.github/workflows/`.

---

## Licencia

Este proyecto se distribuye bajo los términos establecidos en el archivo [LICENSE](LICENSE).