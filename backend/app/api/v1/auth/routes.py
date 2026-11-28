"""Endpoints HTTP para autenticación de usuarios."""

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from app.api.v1.auth import service

auth_bp = Blueprint("auth", __name__, url_prefix="/api/v1/auth")


@auth_bp.post("/register")
def register():
    """Registra un usuario nuevo y entrega su token JWT."""
    payload = request.get_json(silent=True)
    data, error, status_code = service.register_user(payload)
    if error:
        return jsonify({"error": error}), status_code
    return jsonify(data), status_code


@auth_bp.post("/login")
def login():
    """Inicia sesión con email y contraseña y entrega su token JWT."""
    payload = request.get_json(silent=True)
    data, error, status_code = service.login_user(payload)
    if error:
        return jsonify({"error": error}), status_code
    return jsonify(data), status_code


@auth_bp.get("/me")
@jwt_required()
def me():
    """Retorna la información del usuario autenticado actual."""
    identity = get_jwt_identity()
    user_data, error, status_code = service.get_current_user(identity)
    if error:
        return jsonify({"error": error}), status_code
    return jsonify({"user": user_data}), status_code