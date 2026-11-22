from datetime import datetime, timezone
from app.extensions import db

class Project(db.Model):
    """Modelo de base de datos que representa un proyecto

    Attributes:
        id : Clave primaria enter
        name : Nombre del proyecto, texto obligatorio
        description : Descripción opcional
        status : Estado controlado, por ejemplo "draft", "active", "completed", con valor por defecto "draft"
        created_at : Fecha/Hora de creación
    """
    __tablename__ = "projects"
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(30), nullable=False, default="draft")
    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )