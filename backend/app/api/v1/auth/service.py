"""Lógica de negocio para registro, inicio de sesión, verificación y recuperación."""

import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from flask import current_app
from flask_jwt_extended import create_access_token
from app.api.v1.auth import repository, schemas
from app.infrastructure.email_service import send_email

PURPOSE_EMAIL_VERIFICATION = "email_verification"
PURPOSE_PASSWORD_RESET = "password_reset"


def _hash_token(raw_token: str) -> str:
    """Genera el hash SHA-256 hexadecimal de un token en texto plano."""
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def _issue_and_send_verification_email(user) -> None:
    """Emite un token de verificación hasheado y envía el enlace por correo."""
    raw_token = secrets.token_urlsafe(32)
    token_hash = _hash_token(raw_token)
    ttl_minutes = current_app.config.get("EMAIL_VERIFICATION_EXPIRES_MINUTES", 1440)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=ttl_minutes)

    repository.create_auth_token(
        user_id=user.id,
        token_hash=token_hash,
        purpose=PURPOSE_EMAIL_VERIFICATION,
        expires_at=expires_at,
    )

    frontend_url = current_app.config.get("FRONTEND_URL", "http://localhost:5173").rstrip("/")
    verify_url = f"{frontend_url}/verify-email?token={raw_token}"

    text_body = (
        f"Hola {user.name},\n\n"
        f"Verifica tu correo electrónico en Project Bridge visitando:\n{verify_url}\n\n"
        f"Este enlace expira en {ttl_minutes} minutos."
    )
    html_body = (
        f"<p>Hola <strong>{user.name}</strong>,</p>"
        f"<p>Verifica tu correo electrónico en <strong>Project Bridge</strong>:</p>"
        f'<p><a href="{verify_url}">Verificar correo electrónico</a></p>'
        f"<p>Este enlace expira en {ttl_minutes} minutos.</p>"
    )

    send_email(
        to_email=user.email,
        subject="Verifica tu correo — Project Bridge",
        text_body=text_body,
        html_body=html_body,
    )


def _issue_and_send_reset_email(user) -> None:
    """Emite un token de recuperación hasheado y envía el enlace por correo."""
    raw_token = secrets.token_urlsafe(32)
    token_hash = _hash_token(raw_token)
    ttl_minutes = current_app.config.get("PASSWORD_RESET_EXPIRES_MINUTES", 30)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=ttl_minutes)

    repository.create_auth_token(
        user_id=user.id,
        token_hash=token_hash,
        purpose=PURPOSE_PASSWORD_RESET,
        expires_at=expires_at,
    )

    frontend_url = current_app.config.get("FRONTEND_URL", "http://localhost:5173").rstrip("/")
    reset_url = f"{frontend_url}/reset-password?token={raw_token}"

    text_body = (
        f"Hola {user.name},\n\n"
        f"Solicitaste restablecer tu contraseña en Project Bridge:\n{reset_url}\n\n"
        f"Este enlace expira en {ttl_minutes} minutos."
    )
    html_body = (
        f"<p>Hola <strong>{user.name}</strong>,</p>"
        f"<p>Solicitaste restablecer tu contraseña en <strong>Project Bridge</strong>:</p>"
        f'<p><a href="{reset_url}">Restablecer contraseña</a></p>'
        f"<p>Este enlace expira en {ttl_minutes} minutos.</p>"
    )

    send_email(
        to_email=user.email,
        subject="Restablecer contraseña — Project Bridge",
        text_body=text_body,
        html_body=html_body,
    )


def register_user(payload: dict):
    """Registra un nuevo usuario, envía correo de verificación y devuelve usuario + access_token."""
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
    _issue_and_send_verification_email(user)
    access_token = create_access_token(identity=str(user.id))

    return {
        "access_token": access_token,
        "token_type": "Bearer",
        "user": schemas.serialize_user(user),
        "message": "Cuenta creada. Revisa tu correo para verificar tu cuenta.",
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


def request_email_verification(payload: dict):
    """Solicita o reenvía un enlace de verificación de correo."""
    clean_data, error = schemas.validate_email_only(payload)
    if error:
        return None, error, 400

    user = repository.get_user_by_email(clean_data["email"])
    if not user or not user.is_active:
        return (
            {"message": "Si el correo está registrado, se enviará un enlace de verificación."},
            None,
            200,
        )

    if user.email_verified:
        return {
            "already_verified": True,
            "message": "El correo electrónico ya se encuentra verificado.",
            "user": schemas.serialize_user(user),
        }, None, 200

    _issue_and_send_verification_email(user)
    return {
        "already_verified": False,
        "message": "Se envió un nuevo enlace de verificación a tu correo electrónico.",
    }, None, 200


def verify_email_token(raw_token: str):
    """Valida el token de verificación y marca el correo del usuario como verificado."""
    token = (raw_token or "").strip()
    if not token:
        return None, "El token de verificación es obligatorio.", 400

    token_record = repository.get_valid_token(
        token_hash=_hash_token(token),
        purpose=PURPOSE_EMAIL_VERIFICATION,
    )
    if not token_record:
        return None, "El enlace de verificación es inválido o ha expirado.", 400

    user = repository.get_user_by_id(token_record.user_id)
    if not user or not user.is_active:
        return None, "Usuario no encontrado o inactivo.", 404

    repository.consume_token(token_record)
    verified_user = repository.mark_user_email_verified(user)

    return {
        "message": "Correo electrónico verificado correctamente.",
        "user": schemas.serialize_user(verified_user),
    }, None, 200


def request_password_reset(payload: dict):
    """Envía enlace de restablecimiento únicamente si la cuenta existe, está activa y verificó su correo."""
    clean_data, error = schemas.validate_email_only(payload)
    if error:
        return None, error, 400

    user = repository.get_user_by_email(clean_data["email"])
    if not user or not user.is_active:
        return None, "No existe una cuenta activa asociada a ese correo electrónico.", 404

    if not user.email_verified:
        return (
            None,
            "Debes verificar tu correo electrónico antes de poder restablecer tu contraseña.",
            403,
        )

    _issue_and_send_reset_email(user)
    return {
        "message": "Se envió un enlace para restablecer tu contraseña a tu correo verificado.",
    }, None, 200


def reset_password(payload: dict):
    """Valida el token de recuperación, actualiza la contraseña e invalida el token."""
    clean_data, error = schemas.validate_reset_password(payload)
    if error:
        return None, error, 400

    token_record = repository.get_valid_token(
        token_hash=_hash_token(clean_data["token"]),
        purpose=PURPOSE_PASSWORD_RESET,
    )
    if not token_record:
        return None, "El enlace de restablecimiento es inválido o ha expirado.", 400

    user = repository.get_user_by_id(token_record.user_id)
    if not user or not user.is_active:
        return None, "Usuario no encontrado o inactivo.", 404

    if not user.email_verified:
        return (
            None,
            "Debes verificar tu correo electrónico antes de poder restablecer tu contraseña.",
            403,
        )

    repository.consume_token(token_record)
    repository.update_user_password(user=user, new_password=clean_data["new_password"])

    return {
        "message": "Contraseña actualizada correctamente. Ya puedes iniciar sesión.",
    }, None, 200