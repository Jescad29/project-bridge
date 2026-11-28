"""Pruebas de integración para los endpoints CRUD del módulo projects."""


def test_projects_full_crud_flow(client):
    """Verifica el flujo completo: crear, listar, consultar detalle, editar y eliminar."""
    # 1. Arrange & Act: Crear proyecto (POST 201)
    create_payload = {
        "name": "Proyecto Integración Full CRUD",
        "description": "Descripción inicial del proyecto",
        "status": "draft",
    }
    create_resp = client.post("/api/v1/projects/", json=create_payload)

    # Assert
    assert create_resp.status_code == 201
    created_data = create_resp.get_json()
    assert created_data["name"] == create_payload["name"]
    assert created_data["description"] == create_payload["description"]
    assert created_data["status"] == "draft"
    project_id = created_data["id"]

    # 2. Act: Listar proyectos (GET 200)
    list_resp = client.get("/api/v1/projects/")

    # Assert
    assert list_resp.status_code == 200
    list_data = list_resp.get_json()
    assert list_data["total"] >= 1
    assert any(item["id"] == project_id for item in list_data["items"])

    # 3. Act: Consultar detalle individual (GET /<id> 200)
    detail_resp = client.get(f"/api/v1/projects/{project_id}")

    # Assert
    assert detail_resp.status_code == 200
    detail_data = detail_resp.get_json()
    assert detail_data["id"] == project_id
    assert detail_data["name"] == create_payload["name"]

    # 4. Act: Actualización parcial (PATCH /<id> 200)
    patch_payload = {
        "name": "Proyecto Actualizado",
        "status": "active",
    }
    patch_resp = client.patch(f"/api/v1/projects/{project_id}", json=patch_payload)

    # Assert: Se actualizan los campos enviados y se conserva la descripción original
    assert patch_resp.status_code == 200
    patched_data = patch_resp.get_json()
    assert patched_data["name"] == "Proyecto Actualizado"
    assert patched_data["status"] == "active"
    assert patched_data["description"] == create_payload["description"]

    # 5. Act: Eliminar proyecto (DELETE /<id> 200)
    delete_resp = client.delete(f"/api/v1/projects/{project_id}")

    # Assert
    assert delete_resp.status_code == 200

    # 6. Act & Assert: Consultar y eliminar proyecto ya borrado (404)
    assert client.get(f"/api/v1/projects/{project_id}").status_code == 404
    assert client.delete(f"/api/v1/projects/{project_id}").status_code == 404


def test_projects_validation_and_not_found_errors(client):
    """Verifica respuestas 400 por datos inválidos y 404 para IDs inexistentes."""
    # Crear sin nombre obligatorio -> 400
    bad_create = client.post("/api/v1/projects/", json={"description": "Sin nombre"})
    assert bad_create.status_code == 400

    # Consultar detalle de ID inexistente -> 404
    assert client.get("/api/v1/projects/999999").status_code == 404

    # Actualizar ID inexistente -> 404
    assert client.patch("/api/v1/projects/999999", json={"status": "active"}).status_code == 404

    # Crear proyecto válido para probar validaciones de PATCH -> 400
    created = client.post(
        "/api/v1/projects/",
        json={"name": "Proyecto Validación", "status": "draft"},
    ).get_json()
    project_id = created["id"]

    # PATCH con estado inválido -> 400
    bad_status = client.patch(
        f"/api/v1/projects/{project_id}",
        json={"status": "estado_inexistente"},
    )
    assert bad_status.status_code == 400

    # PATCH con payload vacío -> 400
    empty_patch = client.patch(f"/api/v1/projects/{project_id}", json={})
    assert empty_patch.status_code == 400