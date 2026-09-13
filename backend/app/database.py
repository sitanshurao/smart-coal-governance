# backend/app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# For local testing, we use SQLite. 
# To switch to PostgreSQL later, change this to: "postgresql://user:password@localhost/coal_db"
SQLALCHEMY_DATABASE_URL = "sqlite:///./coal_governance.db"

# connect_args is specifically required for SQLite in FastAPI
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()