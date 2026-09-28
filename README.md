# Project Bridge

Plantilla full stack con Flask, React y PostgreSQL, organizada con arquitectura modular, APIs REST, pruebas automatizadas y Docker.

## Objetivo

Este repositorio funciona como una base reutilizable para construir aplicaciones web modernas con una arquitectura clara, mantenible y escalable.

La plantilla separa frontend y backend dentro de un mismo repositorio y aplica una organización por módulos y capas.

## Stack principal

### Backend
- Python
- Flask
- SQLAlchemy
- PostgreSQL
- Flask-Migrate
- Pytest

### Frontend
- React
- Vite
- JavaScript

### Infraestructura
- Docker
- Docker Compose
- GitHub Actions

## Arquitectura

El proyecto utiliza:

- Monorepo
- Backend REST API
- Monolito modular
- Arquitectura en capas
- Separación por responsabilidades
- Repository Pattern
- Service Layer

Flujo principal del backend:

```text
Route
  ↓
Schema
  ↓
Service
  ↓
Repository
  ↓
Model / SQL
  ↓
PostgreSQL


# Estructura del proyecto

```text
project-bridge/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── extensions.py
│   │   ├── logging_config.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── auth/
│   │   │       ├── users/
│   │   │       ├── projects/
│   │   │       ├── tasks/
│   │   │       └── clients/
│   │   ├── models/
│   │   ├── common/
│   │   ├── errors/
│   │   ├── infrastructure/
│   │   └── utils/
│   ├── migrations/
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   ├── logs/
│   ├── scripts/
│   ├── .env.example
│   ├── .gitignore
│   ├── pyproject.toml
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── pytest.ini
│   ├── main.py
│   └── wsgi.py
│
├── frontend/
│   ├── public/
│   │   ├── favicon.ico
│   │   └── images/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── contexts/
│   │   ├── routes/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── constants/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── vite.config.js
│   └── eslint.config.js
│
├── docs/
│   ├── ARQUITECTURA.md
│   ├── api.md
│   └── database.md
│
├── docker/
│   └── postgres/
│       └── init.sql
│
├── .github/
│   └── workflows/
│       ├── backend-tests.yml
│       └── frontend-tests.yml
│
├── .gitignore
├── docker-compose.yml
├── README.md
└── LICENSE
```