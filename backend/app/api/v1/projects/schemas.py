"""Validación y serialización para el dominio de proyectos."""

ALLOWED_STATUSES = {"draft", "active", "completed"}


def validate_create_project(payload: dict) -> tuple[dict | None, str | None]:
    """Valida los datos de entrada para crear un proyecto."""
    if not isinstance(payload, dict):
        return None, "El cuerpo de la petición debe ser un objeto JSON."

    name = str(payload.get("name", "")).strip()
    if not name:
        return None, "El campo 'name' es obligatorio."
    if len(name) > 120:
        return None, "El campo 'name' no puede exceder 120 caracteres."

    description = payload.get("description")
    if description is not None:
        description = str(description).strip() or None

    status = str(payload.get("status", "draft")).strip().lower()
    if status not in ALLOWED_STATUSES:
        return None, f"El campo 'status' debe ser uno de: {', '.join(sorted(ALLOWED_STATUSES))}."

    return {
        "name": name,
        "description": description,
        "status": status,
    }, None


def serialize_project(project) -> dict:
    """Convierte un modelo Project en un diccionario serializable a JSON."""
    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "status": project.status,
        "created_at": project.created_at.isoformat() if project.created_at else None,
    }