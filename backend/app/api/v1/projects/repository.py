"""Capa de acceso a datos (Repository) para proyectos."""

from app.extensions import db
from app.models.project import Project


def list_all_projects() -> list[Project]:
    """Obtiene todos los proyectos ordenados del más reciente al más antiguo."""
    return Project.query.order_by(Project.created_at.desc()).all()


def get_project_by_id(project_id: int) -> Project | None:
    """Busca un proyecto por su clave primaria."""
    return db.session.get(Project, project_id)


def create_project(name: str, description: str | None, status: str) -> Project:
    """Crea y persiste un nuevo proyecto en la base de datos."""
    project = Project(
        name=name,
        description=description,
        status=status,
    )
    db.session.add(project)
    db.session.commit()
    return project


def delete_project(project: Project) -> None:
    """Elimina un proyecto existente de la base de datos."""
    db.session.delete(project)
    db.session.commit()