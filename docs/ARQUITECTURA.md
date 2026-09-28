# Arquitectura del Proyecto

> Documento vivo. Este archivo define la arquitectura base del proyecto y se irá ampliando conforme avance el desarrollo.

---

## 1. Objetivo

El objetivo de esta arquitectura es construir una plantilla profesional y reutilizable para aplicaciones web modernas utilizando:

- **Backend:** Flask
- **Frontend:** React
- **Base de datos:** PostgreSQL
- **ORM:** SQLAlchemy
- **Migraciones:** Flask-Migrate / Alembic
- **API:** REST
- **Testing:** Pytest
- **Contenedores:** Docker

La aplicación se organizará inicialmente como un **monorepo**, con frontend y backend separados físicamente pero dentro del mismo repositorio.

```text
my-project/
├── backend/
├── frontend/
├── docs/
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

# 2. Conceptos de arquitectura

## 2.1 Arquitectura de software

La arquitectura define cómo se organiza el sistema a gran escala:

- qué módulos existen;
- cómo se comunican;
- cómo se divide frontend y backend;
- dónde vive la lógica;
- cómo se accede a datos;
- cómo se integran servicios externos.

La arquitectura no es simplemente una estructura de carpetas. Las carpetas representan decisiones arquitectónicas.

---

## 2.2 Arquitecturas revisadas

### Monolítica

Toda la aplicación se despliega como una sola unidad.

```text
Aplicación
├── Usuarios
├── Ventas
├── Compras
├── Inventario
└── Seguridad
```

---

### Monolito modular

Sigue existiendo una única aplicación, pero organizada por módulos funcionales.

```text
app/
├── users/
├── projects/
├── tasks/
└── clients/
```

Esta será una de las bases de nuestra arquitectura.

---

### Arquitectura en capas

Separa responsabilidades.

```text
Presentación
    ↓
Controladores / API
    ↓
Lógica de negocio
    ↓
Acceso a datos
    ↓
Base de datos
```

En nuestra aplicación:

```text
routes.py
    ↓
schemas.py
    ↓
service.py
    ↓
repository.py
    ↓
models / queries
    ↓
PostgreSQL
```

---

### MVC

MVC significa:

```text
Model
View
Controller
```

Es especialmente natural cuando Flask también renderiza HTML mediante `templates`.

En aplicaciones con React separado, MVC deja de describir tan claramente toda la aplicación.

---

### Clean Architecture

Busca que el negocio no dependa directamente de:

- Flask;
- SQLAlchemy;
- PostgreSQL;
- APIs externas;
- frameworks concretos.

---

### Arquitectura Hexagonal

También conocida como:

```text
Ports and Adapters
```

Busca que la lógica de negocio quede en el centro y las tecnologías externas se conecten mediante adaptadores.

```text
FastAPI/Flask
     ↓
Adapter
     ↓
Port
     ↓
Core
     ↓
Port
     ↓
Adapter
     ↓
Database / API externa
```

Concepto importante:

```text
El negocio no conoce la infraestructura.
La infraestructura sí puede conocer al negocio.
```

---

### Microservicios

Divide una aplicación en servicios independientes.

```text
Users Service
Projects Service
Payments Service
Notifications Service
```

Cada servicio puede desplegarse y escalar de manera independiente.

No utilizaremos microservicios inicialmente.

---

### Event-Driven

Los componentes se comunican mediante eventos.

```text
Proyecto actualizado
        ↓
event: project.updated
        ↓
Notificaciones
Auditoría
WebSocket
```

Podría incorporarse más adelante.

---

# 3. Arquitectura seleccionada

Para el proyecto utilizaremos inicialmente:

> **Monorepo + Frontend React separado + Backend Flask REST API + Monolito Modular + Arquitectura en Capas**

Además se aplicarán patrones como Repository, Service y Adapter cuando sean necesarios.

Arquitectura general:

```text
React
  ↓
HTTP / JSON
  ↓
Flask REST API
  ↓
Service Layer
  ↓
Repository Layer
  ↓
PostgreSQL
```

Cuando exista una integración externa:

```text
Service
  ↓
Infrastructure / Adapter
  ↓
API externa
```

---

# 4. Comparación con la arquitectura anterior de Elephant

En Elephant, cada módulo normalmente tenía aproximadamente:

```text
ModuloMenu.py
Modulo.py
Modulo.html
Modulo.js
Modulo.css
ModuloSQL.py
```

Flujo aproximado:

```text
HTML
 ↓
JS
 ↓
Menu.py
 ↓
Modulo.py
 ↓
ModuloSQL.py
 ↓
SQL Server
```

El archivo `Menu.py`:

- renderizaba HTML;
- registraba rutas;
- conectaba el módulo con Flask;
- controlaba permisos o navegación.

El archivo funcional `.py` mezclaba:

- endpoints;
- lógica de negocio.

El archivo `*SQL.py` contenía:

- consultas;
- acceso a datos.

En la nueva arquitectura:

```text
Elephant                  Nueva arquitectura
---------------------------------------------------------
ModuloMenu.py              desaparece en gran parte
Modulo.html                React Page / Component
Modulo.js                  React hooks / components / api
Modulo.css                 React styles
Modulo.py                  routes.py + service.py
ModuloSQL.py               repository.py / queries/
```

El gran cambio consiste en separar:

```text
routes.py
→ HTTP

service.py
→ lógica

repository.py
→ acceso a datos
```

---

# 5. Backend

## 5.1 Estructura general

```text
backend/
│
├── app/
│   ├── __init__.py
│   ├── config.py
│   ├── extensions.py
│   ├── logging_config.py
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       │
│   │       ├── auth/
│   │       │   ├── __init__.py
│   │       │   ├── routes.py
│   │       │   ├── schemas.py
│   │       │   ├── service.py
│   │       │   ├── repository.py
│   │       │   └── queries/
│   │       │
│   │       ├── users/
│   │       │   ├── __init__.py
│   │       │   ├── routes.py
│   │       │   ├── schemas.py
│   │       │   ├── service.py
│   │       │   ├── repository.py
│   │       │   └── permissions.py
│   │       │
│   │       ├── projects/
│   │       │   ├── __init__.py
│   │       │   ├── routes.py
│   │       │   ├── schemas.py
│   │       │   ├── service.py
│   │       │   ├── repository.py
│   │       │   └── queries/
│   │       │       ├── project_dashboard.sql
│   │       │       └── project_report.sql
│   │       │
│   │       ├── tasks/
│   │       │   ├── __init__.py
│   │       │   ├── routes.py
│   │       │   ├── schemas.py
│   │       │   ├── service.py
│   │       │   └── repository.py
│   │       │
│   │       └── clients/
│   │           ├── __init__.py
│   │           ├── routes.py
│   │           ├── schemas.py
│   │           ├── service.py
│   │           └── repository.py
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── project.py
│   │   ├── task.py
│   │   ├── client.py
│   │   └── project_member.py
│   │
│   ├── common/
│   │   ├── __init__.py
│   │   ├── exceptions.py
│   │   ├── responses.py
│   │   ├── pagination.py
│   │   ├── decorators.py
│   │   ├── permissions.py
│   │   └── constants.py
│   │
│   ├── errors/
│   │   ├── __init__.py
│   │   └── handlers.py
│   │
│   ├── infrastructure/
│   │   ├── __init__.py
│   │   ├── email_service.py
│   │   ├── storage_service.py
│   │   ├── notification_service.py
│   │   └── pdf_service.py
│   │
│   └── utils/
│       ├── __init__.py
│       ├── date_helpers.py
│       ├── file_helpers.py
│       └── string_helpers.py
│
├── migrations/
├── tests/
│   ├── conftest.py
│   ├── unit/
│   └── integration/
│
├── logs/
│   └── .gitkeep
│
├── scripts/
│   ├── seed.py
│   └── create_admin.py
│
├── .env
├── .env.example
├── .gitignore
├── pyproject.toml
├── requirements.txt
├── Dockerfile
├── pytest.ini
├── main.py
└── wsgi.py
```

---

# 6. Responsabilidad de cada parte del backend

## `app/__init__.py`

Construye la aplicación Flask.

Normalmente contiene:

```python
def create_app():
    ...
```

Responsabilidades:

- crear `Flask`;
- cargar configuración;
- inicializar extensiones;
- registrar Blueprints;
- registrar manejadores de errores;
- configurar logging.

---

## `config.py`

Configuración de la aplicación.

Ejemplos:

- URI de PostgreSQL;
- claves JWT;
- configuración de correo;
- configuración por entorno;
- límites de archivos;
- flags generales.

---

## `extensions.py`

Centraliza extensiones Flask.

Ejemplo:

```python
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
cors = CORS()
```

Posteriormente `create_app()` hace:

```python
db.init_app(app)
migrate.init_app(app, db)
jwt.init_app(app)
cors.init_app(app)
```

Esto ayuda a evitar importaciones circulares.

---

## `logging_config.py`

Define:

- niveles de log;
- formato;
- handlers;
- salida por consola;
- salida opcional a archivos.

---

# 7. `api/`

Contiene los módulos funcionales de la API.

Ejemplo:

```text
api/v1/projects/
```

Cada módulo puede tener:

```text
routes.py
schemas.py
service.py
repository.py
queries/
permissions.py
```

---

## `routes.py`

Contiene los endpoints HTTP.

Ejemplos:

```text
GET
POST
PUT
PATCH
DELETE
```

Responsabilidad:

```text
¿Qué pidió el cliente?
```

Debe:

- recibir requests;
- obtener path/query parameters;
- obtener body;
- llamar al schema;
- llamar al service;
- devolver la respuesta HTTP.

No debe contener consultas SQL ni lógica de negocio importante.

---

## `schemas.py`

Define el contrato de datos que cruza la frontera de la API.

Responsabilidad:

```text
¿Qué datos aceptamos?
¿Qué datos devolvemos?
```

Permite definir:

- campos obligatorios;
- campos opcionales;
- tipos;
- formatos;
- validaciones básicas.

Ejemplo:

```python
class ProjectCreateSchema(BaseModel):
    name: str
    client_id: int
    description: str | None = None
```

Un módulo puede tener varios schemas:

```text
ProjectCreateSchema
ProjectUpdateSchema
ProjectResponseSchema
```

Diferencia:

```text
Schema
→ cómo viajan los datos

Model
→ cómo viven los datos en la BD
```

---

## `service.py`

Contiene la lógica de negocio.

Responsabilidad:

```text
¿Qué debe hacer el sistema?
```

Ejemplos:

- validar reglas de negocio;
- calcular avance;
- verificar permisos;
- coordinar repositorios;
- llamar APIs externas;
- ejecutar flujos.

No debería contener SQL directo.

---

## `repository.py`

Responsable del acceso a datos.

Ejemplos:

- crear;
- consultar;
- actualizar;
- eliminar;
- ejecutar consultas;
- usar SQLAlchemy;
- ejecutar SQL directo.

Responsabilidad:

```text
¿Cómo guardo u obtengo los datos?
```

---

## `queries/`

Contiene SQL directo, normalmente para consultas complejas.

Ejemplos:

- dashboards;
- reportes;
- CTEs;
- agregaciones;
- funciones ventana;
- consultas especialmente optimizadas.

Ejemplo:

```text
project_dashboard.sql
project_report.sql
```

---

# 8. ORM y SQL directo

Se utilizarán ambos.

## ORM

SQLAlchemy será la opción principal para:

- CRUD;
- relaciones;
- operaciones normales;
- transacciones habituales.

## SQL directo

Se utilizará para:

- reportes;
- dashboards;
- consultas complejas;
- consultas que sean más legibles u optimizables directamente en SQL.

Ambos deben pasar por `repository.py`.

```text
Service
   ↓
Repository
   ├── ORM
   └── SQL directo
```

---

# 9. `models/`

Contiene los modelos ORM.

Representan tablas y relaciones de PostgreSQL.

Ejemplo:

```python
class Project(db.Model):
    __tablename__ = "projects"
```

Conceptualmente:

```text
Clase Python
     ↕
SQLAlchemy
     ↕
Tabla PostgreSQL
```

Ejemplo:

```text
models/project.py
→ tabla projects

models/user.py
→ tabla users
```

---

# 10. `common/`

Contiene componentes compartidos por diferentes módulos con significado arquitectónico.

Ejemplos:

```text
exceptions.py
responses.py
pagination.py
decorators.py
permissions.py
constants.py
```

Regla:

```text
Si solo pertenece a projects
→ projects/

Si varios módulos lo utilizan
→ common/
```

---

# 11. `errors/`

Centraliza el manejo global de errores HTTP.

Ejemplo:

```python
@app.errorhandler(404)
def not_found(error):
    ...
```

Relación:

```text
common/exceptions.py
→ define la excepción

errors/handlers.py
→ decide cómo convertirla en respuesta HTTP
```

---

# 12. `infrastructure/`

Contiene las implementaciones que conectan nuestra aplicación con tecnologías o sistemas externos.

Ejemplos:

```text
email
storage
PDF
notificaciones
APIs externas
Redis
servicios cloud
```

Regla:

```text
Service
→ decide QUÉ hacer

Infrastructure
→ sabe CÓMO hacerlo técnicamente
```

Ejemplo:

```text
projects/service.py
→ decide enviar una notificación

infrastructure/email_service.py
→ sabe cómo enviar el correo
```

A futuro puede reorganizarse:

```text
infrastructure/
├── database/
├── email/
├── storage/
├── notifications/
├── pdf/
└── external_apis/
```

---

# 13. `utils/`

Contiene helpers pequeños, genéricos y reutilizables.

Ejemplos:

```text
date_helpers.py
file_helpers.py
string_helpers.py
```

No debe contener lógica de negocio.

Ejemplo correcto:

```python
def normalize_text(text):
    ...
```

Ejemplo incorrecto:

```python
def approve_project(project):
    ...
```

---

# 14. `migrations/`

Sirve para versionar cambios en la estructura de la base de datos.

Tecnologías:

```text
Flask-Migrate
Alembic
```

Ejemplo:

```text
models/
→ estado deseado

migrations/
→ historial de cambios necesarios para llegar a ese estado
```

Comandos habituales:

```bash
flask db migrate -m "add status to projects"
flask db upgrade
flask db downgrade
```

---

# 15. `tests/`

Contiene pruebas automáticas.

```text
tests/
├── conftest.py
├── unit/
└── integration/
```

## Unit tests

Prueban una pieza aislada.

Ejemplos:

- service;
- schema;
- función;
- validación.

## Integration tests

Prueban varias piezas funcionando juntas.

Ejemplo:

```text
route
 ↓
service
 ↓
repository
 ↓
database
```

## `conftest.py`

Contiene fixtures reutilizables de Pytest.

Ejemplos:

- app de pruebas;
- cliente Flask;
- usuario de prueba;
- token;
- base temporal.

---

# 16. `logs/`

Contiene opcionalmente logs locales.

Los logs registran:

- eventos;
- errores;
- warnings;
- auditoría técnica;
- comportamiento del backend.

Niveles:

```text
DEBUG
INFO
WARNING
ERROR
CRITICAL
```

En producción con Docker se preferirá normalmente enviar logs a:

```text
stdout / stderr
```

y que la plataforma los recoja.

---

# 17. `scripts/`

Contiene tareas manuales o administrativas.

Ejemplos:

```text
seed.py
create_admin.py
import_clients.py
migrate_legacy_data.py
generate_demo_data.py
```

No forma parte del flujo HTTP normal.

Idealmente reutiliza los services existentes.

---

# 18. `.env`

Contiene variables reales del entorno.

Ejemplos:

```env
DATABASE_URL=
SECRET_KEY=
JWT_SECRET_KEY=
SMTP_PASSWORD=
```

No debe subirse a Git.

---

# 19. `.env.example`

Es una plantilla pública que documenta qué variables requiere la aplicación.

Ejemplo:

```env
DATABASE_URL=
SECRET_KEY=
JWT_SECRET_KEY=
SMTP_USER=
SMTP_PASSWORD=
```

Sí se sube al repositorio.

---

# 20. `pyproject.toml`

Archivo estándar moderno para configurar el proyecto Python.

Puede contener:

- nombre;
- versión;
- versión mínima de Python;
- dependencias;
- dependencias de desarrollo;
- configuración de Pytest;
- Ruff;
- Black;
- herramientas de build.

---

# 21. `requirements.txt`

Lista de dependencias instalables.

Puede mantenerse por compatibilidad con despliegues o tooling aunque `pyproject.toml` sea la fuente principal.

---

# 22. `main.py`

Punto de entrada opcional para desarrollo.

Ejemplo:

```python
from app import create_app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
```

---

# 23. `wsgi.py`

Punto de entrada para producción.

Ejemplo:

```python
from app import create_app

app = create_app()
```

Puede ser ejecutado por Gunicorn:

```bash
gunicorn wsgi:app
```

---

# 24. Flujo completo del backend

## Crear un proyecto

```text
React
   ↓
POST /api/v1/projects
   ↓
routes.py
   ↓
schemas.py
   ↓
service.py
   ↓
repository.py
   ↓
models / queries
   ↓
PostgreSQL
```

Respuesta:

```text
PostgreSQL
   ↓
repository.py
   ↓
service.py
   ↓
schema de respuesta
   ↓
route
   ↓
JSON
   ↓
React
```

---

# 25. Integraciones externas

Cuando el service necesita consumir algo externo:

```text
service.py
   ↓
infrastructure/
   ↓
API externa / correo / storage / PDF
```

Por ejemplo:

```text
ProjectService
   ↓
EmailService
   ↓
SMTP / SendGrid / Graph
```

---

# 26. Manejo de errores

Flujo:

```text
service.py / repository.py
   ↓
Exception
   ↓
errors/handlers.py
   ↓
HTTP Response
```

---

# 27. Diseño de software

Además de arquitectura, se revisaron conceptos de diseño:

## SOLID

```text
S → Single Responsibility
O → Open/Closed
L → Liskov Substitution
I → Interface Segregation
D → Dependency Inversion
```

---

## Cohesión

Una pieza debe contener responsabilidades relacionadas.

Objetivo:

```text
alta cohesión
```

---

## Acoplamiento

Mide qué tanto depende un componente de otros.

Objetivo:

```text
bajo acoplamiento
```

---

## Responsabilidad única

Una clase o módulo debe tener una sola razón principal para cambiar.

---

## Interfaces

Definen contratos.

Ejemplo conceptual:

```python
class ExchangeRateProvider(Protocol):
    def get_rate(self, currency):
        ...
```

---

## Composición

Construir objetos utilizando otros objetos.

Preferible muchas veces a herencia.

---

## Inyección de dependencias

Las dependencias se proporcionan desde afuera.

```python
service = ProjectService(repository)
```

en lugar de:

```python
class ProjectService:
    def __init__(self):
        self.repository = ProjectRepository()
```

---

## DTOs

Data Transfer Objects.

Sirven para transportar datos entre capas o sistemas.

En APIs pueden ser representados mediante schemas.

---

## Entidades

Representan conceptos importantes del negocio:

```text
User
Project
Task
Client
```

---

## Servicios

Contienen reglas y coordinación del negocio.

---

# 28. Frontend y backend

Frontend y backend serán aplicaciones distintas pero vivirán inicialmente en un solo repositorio.

```text
React
→ frontend

Flask
→ backend
```

Se comunican mediante:

```text
HTTP + JSON
```

---

# 29. CORS

CORS significa:

```text
Cross-Origin Resource Sharing
```

Controla qué orígenes web pueden consumir la API desde un navegador.

Ejemplo desarrollo:

```text
React
http://localhost:5173

Flask
http://localhost:5000
```

Son orígenes distintos.

Flask puede permitir explícitamente React mediante Flask-CORS.

CORS no reemplaza autenticación ni autorización.

---

# 30. Git y monorepo

Frontend y backend pueden vivir en el mismo repositorio.

Se pueden utilizar múltiples `.gitignore`.

Ejemplo:

```text
my-project/
├── .gitignore
├── backend/
│   └── .gitignore
└── frontend/
    └── .gitignore
```

Cada `.gitignore` aplica desde su directorio hacia abajo.

---

# 31. Principio de trabajo

Esta arquitectura funcionará como una plantilla general.

Primero se construirá y configurará de forma genérica.

Después se adaptará a la aplicación concreta.

Orden previsto:

```text
1. Estructura inicial
2. .env y .env.example
3. config.py
4. extensions.py
5. create_app()
6. main.py
7. wsgi.py
8. logging
9. PostgreSQL
10. SQLAlchemy
11. Flask-Migrate
12. Primer model
13. Primer módulo API
14. manejo de errores
15. CORS
16. tests
17. Docker
18. React
```

En cada paso se estudiará:

```text
qué problema resuelve
por qué existe
qué contiene
quién lo importa
qué depende de él
cómo probarlo
```

---

# 32. Regla general de responsabilidades

```text
ROUTE
→ ¿Qué pidió el cliente?

SCHEMA
→ ¿Los datos tienen la forma correcta?

SERVICE
→ ¿Qué debe hacer el negocio?

REPOSITORY
→ ¿Cómo obtengo o guardo los datos?

MODEL
→ ¿Cómo represento la información persistida?

INFRASTRUCTURE
→ ¿Cómo hablo con sistemas externos?

ERROR HANDLER
→ ¿Cómo convierto errores en respuestas HTTP?

UTIL
→ ¿Qué helper pequeño y reutilizable necesito?
```

---

# 33. Estado del documento

Este documento representa la **versión inicial de la arquitectura**.

Se irá ampliando con:

- configuración real;
- decisiones técnicas;
- autenticación;
- autorización;
- estructura de PostgreSQL;
- convenciones de API;
- patrones de diseño;
- testing;
- Docker;
- CI/CD;
- seguridad;
- observabilidad;
- documentación del frontend;
- flujo completo del proyecto.

