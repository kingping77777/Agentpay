"""
alembic/env.py

Alembic environment configuration.
Uses the synchronous SYNC_DATABASE_URL because Alembic's migration
runner is not async. The application itself uses asyncpg.
"""

import os
import sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

# ── Make sure the backend/ package is importable ─────────────────────────────
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# ── Load .env before importing settings ──────────────────────────────────────
from dotenv import load_dotenv  # noqa: E402

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

# ── Import Base so Alembic can detect all models ─────────────────────────────
from app.db.base import Base  # noqa: E402
import app.db.models          # noqa: E402 — registers all models in Base.metadata
from app.core.config import settings  # noqa: E402

# ── Alembic Config ────────────────────────────────────────────────────────────
config = context.config

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Override the sqlalchemy.url from alembic.ini with our env variable
config.set_main_option("sqlalchemy.url", settings.SYNC_DATABASE_URL)

# The MetaData object that holds all table definitions
target_metadata = Base.metadata


# ── Offline migrations (generates SQL file, no DB connection needed) ──────────
def run_migrations_offline() -> None:
    """
    Run migrations in 'offline' mode.
    Useful for generating SQL scripts to review before running.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()


# ── Online migrations (connects to DB and runs migrations directly) ───────────
def run_migrations_online() -> None:
    """
    Run migrations in 'online' mode.
    A connection is made to the database and migrations run live.
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,  # NullPool: don't keep connections open after migration
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,          # detect column type changes
            compare_server_default=True, # detect default value changes
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
