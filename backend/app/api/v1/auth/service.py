"""Lógica de negocio para registro, inicio de sesión y consulta de perfil."""

from flask_jwt_extended import create_access_token
from app.api.v1.auth import repository, schemas


def register_user(payload: dict):
    """Registra un nuevo usuario y devuelve usuario + access_token."""
    clean_data, error = schemas.validate_register(payload)
    if error:
        return None, error, 400

    if repository.get_user_by_email(clean_data["email"]):
        return None, "Ya existe una cuenta registrada con ese correo electrónico.", 409

    user = repository.create_user(
        name=clean_data["name"],
        email=clean_data["email"],
        raw_password=clean_data["password"],
    )
    access_token = create_access_token(identity=str(user.id))

    return {
        "access_token": access_token,
        "token_type": "Bearer",
        "user": schemas.serialize_user(user),
    }, None, 201


def login_user(payload: dict):
    """Autentica al usuario y devuelve usuario + access_token."""
    clean_data, error = schemas.validate_login(payload)
    if error:
        return None, error, 400

    user = repository.get_user_by_email(clean_data["email"])
    if not user or not user.check_password(clean_data["password"]):
        return None, "Credenciales inválidas.", 401

    if not user.is_active:
        return None, "La cuenta se encuentra inactiva.", 403

    access_token = create_access_token(identity=str(user.id))

    return {
        "access_token": access_token,
        "token_type": "Bearer",
        "user": schemas.serialize_user(user),
    }, None, 200


def get_current_user(user_id_raw: str):
    """Obtiene el perfil del usuario autenticado a partir del identity del JWT."""
    try:
        user_id = int(user_id_raw)
    except (TypeError, ValueError):
        return None, "Identificador de token inválido.", 401

    user = repository.get_user_by_id(user_id)
    if not user or not user.is_active:
        return None, "Usuario no encontrado o inactivo.", 404

    return schemas.serialize_user(user), None, 200