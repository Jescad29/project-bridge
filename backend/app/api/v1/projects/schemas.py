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


def validate_update_project(payload: dict):
    if not isinstance(payload, dict):
        return None, "El cuerpo de la petición debe ser un objeto JSON válido."

    updates = {}

    if "name" in payload:
        raw_name = payload.get("name")
        name = str(raw_name).strip() if raw_name is not None else ""
        if not name:
            return None, "El nombre del proyecto no puede estar vacío."
        if len(name) > 120:
            return None, "El nombre no debe superar los 120 caracteres."
        updates["name"] = name

    if "description" in payload:
        raw_description = payload.get("description")
        if raw_description is None:
            updates["description"] = None
        else:
            cleaned_desc = str(raw_description).strip()
            updates["description"] = cleaned_desc if cleaned_desc else None

    if "status" in payload:
        raw_status = payload.get("status")
        status = str(raw_status).strip().lower() if raw_status is not None else ""
        if status not in ALLOWED_STATUSES:
            return None, f"Estado inválido. Valores permitidos: {', '.join(sorted(ALLOWED_STATUSES))}."
        updates["status"] = status

    if not updates:
        return None, "Debes enviar al menos un campo válido para actualizar (name, description o status)."

    return updates, None


def serialize_project(project) -> dict:
    """Convierte un modelo Project en un diccionario serializable a JSON."""
    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "status": project.status,
        "created_at": project.created_at.isoformat() if project.created_at else None,
    }