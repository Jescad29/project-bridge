"""Validación de payloads y serialización de respuestas para auth."""

import re
from app.models.user import User

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def validate_register(payload: dict):
    """Valida los datos de entrada para registrar un usuario."""
    if not isinstance(payload, dict):
        return None, "El cuerpo de la petición debe ser un objeto JSON válido."

    name = str(payload.get("name", "")).strip()
    email = str(payload.get("email", "")).strip().lower()
    password = payload.get("password")

    if not name:
        return None, "El campo 'name' es obligatorio."
    if len(name) > 120:
        return None, "El campo 'name' no debe superar 120 caracteres."

    if not email or not EMAIL_REGEX.match(email):
        return None, "Proporciona un correo electrónico válido."
    if len(email) > 180:
        return None, "El campo 'email' no debe superar 180 caracteres."

    if not isinstance(password, str) or len(password) < 8:
        return None, "El campo 'password' debe tener al menos 8 caracteres."

    return {
        "name": name,
        "email": email,
        "password": password,
    }, None


def validate_login(payload: dict):
    """Valida los datos de entrada para iniciar sesión."""
    if not isinstance(payload, dict):
        return None, "El cuerpo de la petición debe ser un objeto JSON válido."

    email = str(payload.get("email", "")).strip().lower()
    password = payload.get("password")

    if not email or not password or not isinstance(password, str):
        return None, "Debes enviar 'email' y 'password'."

    return {
        "email": email,
        "password": password,
    }, None


def serialize_user(user: User) -> dict:
    """Serializa la entidad User omitiendo datos sensibles como password_hash."""
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }