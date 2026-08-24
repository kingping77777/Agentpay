"""
scripts/verify_models.py

Quick smoke test — imports all models and prints a summary.
Run from backend/ with: python scripts/verify_models.py
"""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# Simulate a .env being present (values don't matter for import check)
os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://test:test@localhost/test")
os.environ.setdefault("SYNC_DATABASE_URL", "postgresql://test:test@localhost/test")
os.environ.setdefault("JWT_SECRET", "test-secret")

print("Importing models...")

from app.db.base import Base  # noqa — triggers all model imports
from app.db.models import (
    AgentAction, AgentSession, AuditLog,
    Cart, CartItem, Customer,
    Inventory, Merchant, MerchantPolicy,
    Order, Payment, Product,
    ProductRelation, Promotion, User,
)

tables = sorted(Base.metadata.tables.keys())

print(f"\n[OK] All models imported successfully.")
print(f"[OK] {len(tables)} tables registered in metadata:\n")
for t in tables:
    cols = len(Base.metadata.tables[t].columns)
    print(f"  {t:<30} ({cols} columns)")

print(f"\nTotal: {len(tables)} tables")

