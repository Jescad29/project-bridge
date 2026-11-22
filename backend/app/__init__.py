import os 
from flask import Flask, jsonify

from app.config import config_by_name
from app.extensions import db, migrate

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
    
    # 3. Ruta base de verificación (healthcheck)
    @app.get("/api/v1/health")
    def health_check():
        return jsonify({"status": "ok", "environment":env_name}), 200
    
    # 4 Aquí registramos nuestros Blueprints modulares (ej. autch, users, projects...) e importaciones
    # from app.api.v1 import api_v1_bp
    # app.register_blueprint(api_v1_bp)
    
    from app.api.v1.projects.routes import projects_bp
    
    app.register_blueprint(projects_bp)
    
    return app
