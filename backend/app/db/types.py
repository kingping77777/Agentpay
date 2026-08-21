"""
app/db/types.py

Cross-database compatible column types:
- Uses native PostgreSQL JSONB and UUID on PostgreSQL
- Uses JSON and CHAR(32)/CHAR(36) UUID on SQLite
"""
from sqlalchemy import JSON, Uuid
from sqlalchemy.dialects.postgresql import JSONB

JSON_TYPE = JSON().with_variant(JSONB(), "postgresql")
UUID_TYPE = Uuid(as_uuid=True)
