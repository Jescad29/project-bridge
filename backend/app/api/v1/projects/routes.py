"""Rutas HTTP del dominio de proyectos para la API v1."""

from flask import Blueprint, jsonify, request

projects_bp = Blueprint("projects", __name__, url_prefix="/api/v1/projects")

@projects_bp.get("/")
def list_projects():
    """
    Listar projectos:
    
    """
    return jsonify({"items": [], "count": 0}), 200

@projects_bp.post("/")
def create_project():
    """
    Crear projectos:
    
    """
    payload = request.get_json(silent=True) or {}
    name = payload.get("name")
    if not name:
        return jsonify({"error": "El campo 'name' es obligatorio"}), 400
    return jsonify({"message": "Proyecto validado", "name": name}), 201
