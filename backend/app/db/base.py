"""
app/db/base.py

Declares the SQLAlchemy DeclarativeBase used by every model.
All models must be imported HERE so Alembic can discover them
automatically via metadata introspection.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """
    Base class for all ORM models.
    Provides shared metadata and the mapper registry.
    """
    pass

