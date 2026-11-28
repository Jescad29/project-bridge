"""Validación de payloads y serialización de respuestas para auth."""
#archivo: schemas.py
#ubicacion: backend/app/api/v1/auth/schemas.py

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


def validate_email_only(payload: dict):
    """Valida un payload que únicamente requiere el campo 'email'."""
    if not isinstance(payload, dict):
        return None, "El cuerpo de la petición debe ser un objeto JSON válido."

    email = str(payload.get("email", "")).strip().lower()
    if not email or not EMAIL_REGEX.match(email):
        return None, "Proporciona un correo electrónico válido."
    if len(email) > 180:
        return None, "El campo 'email' no debe superar 180 caracteres."

    return {"email": email}, None

def validate_reset_password(payload: dict):
    """Valida token de recuperación y nueva contraseña."""
    if not isinstance(payload, dict):
        return None, "El cuerpo de la petición debe ser un objeto JSON válido."

    token = str(payload.get("token", "")).strip()
    new_password = payload.get("new_password")
    if new_password is None:
        new_password = payload.get("password")

    if not token:
        return None, "El campo 'token' es obligatorio."
    if not isinstance(new_password, str) or len(new_password) < 8:
        return None, "La nueva contraseña debe tener al menos 8 caracteres."

    return {
        "token": token,
        "new_password": new_password,
    }, None

def serialize_user(user: User) -> dict:
    """Serializa la entidad User omitiendo datos sensibles como password_hash."""
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "is_active": user.is_active,
        "email_verified": user.email_verified,
        "email_verified_at": (
            user.email_verified_at.isoformat() if user.email_verified_at else None
        ),
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }