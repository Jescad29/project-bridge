# backend/tests/conftest.py
import pytest
from backend.app import create_app

@pytest.fixture
def app():
    return create_app("testing")