"""Configuración base de fixtures para Pytest."""

from pathlib import Path
import sys
import pytest

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app import create_app  # noqa: E402
from app.extensions import db  # noqa: E402


@pytest.fixture
def app():
    """Crea la aplicación en modo testing con base en memoria."""
    flask_app = create_app("testing")
    with flask_app.app_context():
        db.create_all()
        yield flask_app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """Entrega un cliente HTTP de pruebas para la app."""
    return app.test_client()