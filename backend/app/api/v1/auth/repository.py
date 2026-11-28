"""Capa de acceso a datos para el módulo de autenticación."""

from app.extensions import db
from app.models.user import User


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
    )
    user.set_password(raw_password)
    db.session.add(user)
    db.session.commit()
    return user