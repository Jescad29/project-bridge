"""Rutas HTTP del dominio de proyectos para la API v1.
   Endpoints REST para el dominio de proyectos.
"""

from flask import Blueprint, jsonify, request
from app.api.v1.projects import service

projects_bp = Blueprint("projects", __name__, url_prefix="/api/v1/projects")

@projects_bp.get("/")
def list_projects():
    """Lista todos los proyectos registrados."""
    projects = service.get_projects()
    return jsonify({"items": projects, "total": len(projects)}), 200


@projects_bp.post("/")
def create_project():
    """Crea un nuevo proyecto a partir de un payload JSON."""
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({"error": "Payload JSON inválido o vacío."}), 400

    project, error = service.register_project(payload)
    if error:
        return jsonify({"error": error}), 400

    return jsonify(project), 201


@projects_bp.delete("/<int:project_id>")
def delete_project(project_id: int):
    """Elimina un proyecto por su ID."""
    deleted, error = service.remove_project(project_id)
    if not deleted:
        return jsonify({"error": error}), 404

    return jsonify({"message": f"Proyecto {project_id} eliminado correctamente."}), 200