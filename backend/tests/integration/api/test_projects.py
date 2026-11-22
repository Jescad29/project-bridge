import pytest
from app import create_app
from app.extensions import db

def test_create_list_and_delete_project(client):
    # 1. Arrange: payload válido según schemas.py
    payload = {
        "name": "Project Bridge Test",
        "description": "Prueba CRUD automatizada",
        "status": "active",
    }

    # 2. Act: crear proyecto con POST
    create_resp = client.post("/api/v1/projects/", json=payload)

    # 3. Assert: se creó con 201 y devolvió los datos serializados
    assert create_resp.status_code == 201
    created = create_resp.get_json()
    assert created["name"] == "Project Bridge Test"
    assert created["status"] == "active"
    assert "id" in created

    # Act & Assert: listar con GET y verificar que aparece
    list_resp = client.get("/api/v1/projects/")
    assert list_resp.status_code == 200
    listed = list_resp.get_json()
    assert listed["total"] == 1
    assert listed["items"][0]["id"] == created["id"]

    # Act & Assert: borrar con DELETE y luego confirmar 404 al repetir
    delete_resp = client.delete(f"/api/v1/projects/{created['id']}")
    assert delete_resp.status_code == 200

    not_found_resp = client.delete(f"/api/v1/projects/{created['id']}")
    assert not_found_resp.status_code == 404