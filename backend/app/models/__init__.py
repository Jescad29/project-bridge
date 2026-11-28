# backend/app/models/__init__.py
from app.models.project import Project
from app.models.user import User

__all__ = ["Project", "User"]