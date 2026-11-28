# Archivo: __init__.py
# Ruta: backend\app\__init__.py

import os
from flask import Flask, jsonify
from app.config import config_by_name
from app.extensions import db, migrate, cors, jwt

def create_app(config_name: str | None = None) -> Flask:
    """_summary_
    Fábrica de aplicaciones Flask (Application Factory).

    Args:
        config_name (str | None, optional): _description_. Defaults to None.

    Returns:
        Flask: _description_
    """
    app = Flask(__name__)

    # 1. Determinar el entorno y cargar su clase de configuración
    env_name = config_name or os.getenv("FLASK_ENV", "development")
    config_class = config_by_name.get(env_name, config_by_name["development"])
    app.config.from_object(config_class)

    # 2. Inicializar extensiones desacopladas
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(
        app,
        resources={
            r"/api/*": {
                "origins": app.config["CORS_ORIGINS"],
                "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
            }
        },
    )
    jwt.init_app(app)

    # Manejadores estandarizados para errores JWT (401)
    @jwt.unauthorized_loader
    def handle_missing_token(reason):
        return jsonify({"error": f"Token de autorización requerido: {reason}"}), 401

    @jwt.invalid_token_loader
    def handle_invalid_token(reason):
        return jsonify({"error": f"Token inválido: {reason}"}), 401

    @jwt.expired_token_loader
    def handle_expired_token(_jwt_header, _jwt_payload):
        return jsonify({"error": "La sesión ha expirado. Inicia sesión nuevamente."}), 401

    # 3 Importar modelos aquí para que SQLAlchemy / Flask-Migrate registren las tablas
    from app import models # pylint: disable=import-outside-toplevel

    # 4. Ruta base de verificación (healthcheck)
    @app.get("/api/v1/health")
    def health_check():
        return jsonify({"status": "ok", "environment":env_name}), 200

    # 5 Aquí registramos nuestros Blueprints modulares (ej. autch, users, projects...)
    # e importaciones
    # from app.api.v1 import api_v1_bp
    # app.register_blueprint(api_v1_bp)

    from app.api.v1.projects.routes import projects_bp # pylint: disable=import-outside-toplevel
    from app.api.v1.auth.routes import auth_bp  # pylint: disable=import-outside-toplevel

    app.register_blueprint(auth_bp)
    app.register_blueprint(projects_bp)

    return app
