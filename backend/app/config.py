import os
from pathlib import Path
from dotenv import load_dotenv
from datetime import timedelta

# Carga backend/.env si existe (en Docker o producción, las variables del entorno ya tienen prioridad)
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


class BaseConfig:
    """Configuración base compartida por todos los entornos."""

    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'dev-jwt-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        minutes=int(os.environ.get('JWT_ACCESS_TOKEN_MINUTES', 60))
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_SORT_KEYS = False
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True, "pool_recycle": 1800}
    CORS_ORIGINS =[
        origin.strip()
        for origin in os.environ.get(
            "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
        ).split(",")
        if origin.strip()
    ]
    # URL del frontend para enlaces de verificación de correo y restablecimiento
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
    EMAIL_VERIFICATION_EXPIRES_MINUTES = int(
        os.getenv("EMAIL_VERIFICATION_EXPIRES_MINUTES", "1440")
    )
    PASSWORD_RESET_EXPIRES_MINUTES = int(
        os.getenv("PASSWORD_RESET_EXPIRES_MINUTES", "30")
    )

    # Configuración de correo (si MAIL_SERVER queda vacío, email_service registra en log)
    MAIL_SERVER = os.getenv("MAIL_SERVER", "")
    MAIL_PORT = int(os.getenv("MAIL_PORT", "587"))
    MAIL_USERNAME = os.getenv("MAIL_USERNAME", "")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "")
    MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "true").lower() == "true"
    MAIL_DEFAULT_SENDER = os.getenv("MAIL_DEFAULT_SENDER", "noreply@projectbridge.local")


class DevelopmentConfig(BaseConfig):
    """Configuración para entorno de desarrollo local y Docker dev."""

    DEBUG = True
    SECRET_KEY = os.getenv(
        "SECRET_KEY",
        "dev-secret-key-change-in-production"
    )
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql://bridge_user:bridge_pass@localhost:5432/project_bridge_dev",
    )


class TestingConfig(BaseConfig):
    """Configuración aislada para ejecución de pruebas con pytest."""

    TESTING = True
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "TEST_DATABASE_URL",
        "sqlite:///:memory:",
    )
    MAIL_SERVER = ""

    # Evitar configuraciones de pool especificas de PostgreSQL durante las pruebas con SQLite
    SQLALCHEMY_ENGINE_OPTIONS = {}


class ProductionConfig(BaseConfig):
    """Configuración estricta para despliegue en producción."""

    DEBUG = False
    TESTING = False
    SECRET_KEY = os.getenv("SECRET_KEY")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")

    @classmethod
    def init_app(cls, app) -> None:
        """Valida variables críticas solo al inicializar una app de producción."""
        if not cls.SECRET_KEY:
            raise RuntimeError(
                "SECRET_KEY no está configurada. Define SECRET_KEY para producción."
            )
        if not cls.JWT_SECRET_KEY:
            raise RuntimeError(
                "JWT_SECRET_KEY no está configurada. Define JWT_SECRET_KEY para producción."
            )
        if not cls.SQLALCHEMY_DATABASE_URI:
            raise RuntimeError(
                "DATABASE_URL no está configurada. Define DATABASE_URL para producción."
            )
# configuración factory para seleccionar la configuración según el entorno
config_by_name = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}