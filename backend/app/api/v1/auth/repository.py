"""Capa de acceso a datos para el módulo de autenticación."""
# Archivo: backend/app/api/v1/auth/repository.py

from datetime import datetime, timezone
from app.extensions import db
from app.models.user import User, AuthToken


def get_user_by_email(email: str) -> User | None:
    """Busca un usuario por correo electrónico normalizado."""
    return User.query.filter_by(email=email.strip().lower()).first()


def get_user_by_id(user_id: int) -> User | None:
    """Busca un usuario por su identificador primario."""
    return db.session.get(User, user_id)


def create_user(name: str, email: str, raw_password: str) -> User:
    """Crea un usuario con contraseña hasheada y confirma la transacción."""
    user = User(
        name=name.strip(),
        email=email.strip().lower(),
        is_active=True,
        email_verified=False,
        email_verified_at=None,
    )
    user.set_password(raw_password)
    db.session.add(user)
    db.session.commit()
    return user

def mark_user_email_verified(user: User) -> User:
    """Marca el correo del usuario como verificado y registra la fecha UTC."""
    now_utc = datetime.now(timezone.utc)
    user.email_verified = True
    if user.email_verified_at is None:
        user.email_verified_at = now_utc
    db.session.commit()
    return user


def update_user_password(user: User, new_password: str) -> User:
    """Actualiza el hash de contraseña del usuario y confirma la transacción."""
    user.set_password(new_password)
    db.session.commit()
    return user


def invalidate_active_tokens(user_id: int, purpose: str) -> None:
    """Marca como usados los tokens vigentes previos del mismo propósito y usuario."""
    now_utc = datetime.now(timezone.utc)
    db.session.query(AuthToken).filter(
        AuthToken.user_id == user_id,
        AuthToken.purpose == purpose,
        AuthToken.used_at.is_(None),
    ).update({"used_at": now_utc}, synchronize_session=False)
    db.session.commit()


def create_auth_token(
    user_id: int,
    token_hash: str,
    purpose: str,
    expires_at: datetime,
) -> AuthToken:
    """Invalida tokens activos previos del mismo propósito y registra uno nuevo."""
    invalidate_active_tokens(user_id=user_id, purpose=purpose)
    token_record = AuthToken(
        user_id=user_id,
        token_hash=token_hash,
        purpose=purpose,
        expires_at=expires_at,
    )
    db.session.add(token_record)
    db.session.commit()
    return token_record


def get_valid_token(token_hash: str, purpose: str) -> AuthToken | None:
    """Recupera un token activo (no usado y no expirado) para el propósito indicado."""
    now_utc = datetime.now(timezone.utc)
    token_record = (
        db.session.query(AuthToken)
        .filter(
            AuthToken.token_hash == token_hash,
            AuthToken.purpose == purpose,
            AuthToken.used_at.is_(None),
        )
        .first()
    )
    if not token_record:
        return None

    expires_at = token_record.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at <= now_utc:
        return None

    return token_record


def consume_token(token_record: AuthToken) -> None:
    """Marca un token como utilizado para impedir su reutilización."""
    token_record.used_at = datetime.now(timezone.utc)
    db.session.commit()