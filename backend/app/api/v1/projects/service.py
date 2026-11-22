"""Capa de lógica de negocio (Service) para proyectos."""
from app.api.v1.projects import repository, schemas


def get_projects() -> list[dict]:
    """Orquesta la obtención y serialización de todos los proyectos."""
    projects = repository.list_all_projects()
    return [schemas.serialize_project(project) for project in projects]


def register_project(payload: dict) -> tuple[dict | None, str | None]:
    """Valida entrada, aplica reglas y crea un nuevo proyecto."""
    clean_data, error = schemas.validate_create_project(payload)
    if error:
        return None, error

    project = repository.create_project(
        name=clean_data["name"],
        description=clean_data["description"],
        status=clean_data["status"],
    )
    return schemas.serialize_project(project), None


def remove_project(project_id: int) -> tuple[bool, str | None]:
    """Verifica que el proyecto exista y lo elimina."""
    project = repository.get_project_by_id(project_id)
    if not project:
        return False, f"No se encontró el proyecto con id {project_id}."

    repository.delete_project(project)
    return True, None