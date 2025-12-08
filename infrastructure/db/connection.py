from persistent.db.base import Base
from settings.settings import settings
from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine


def connection() -> async_sessionmaker[AsyncSession]:
    engine = create_async_engine(
        f"postgresql+asyncpg://{settings.pg.username}:{settings.pg.password}@"
        f"{settings.pg.host}:{settings.pg.port}/{settings.pg.database}"
    )

    return async_sessionmaker(autocommit=False, autoflush=False, bind=engine)


def create_all_tables() -> None:
    print("=" * 50)
    print("🔧 [DEBUG] create_all_tables() CALLED!")
    
    try:
        import persistent.db.models 
        print("✅ Models imported")
    except ImportError as e:
        print(f"⚠️  Could not import models: {e}")
    
    try:
        from settings.settings import settings
        print(f"🔧 [DEBUG] Settings object: {settings}")
        
        print(f"🔧 [DEBUG] Tables in Base.metadata: {list(Base.metadata.tables.keys())}")
        
        # Проверим что есть в метаданных
        if not Base.metadata.tables:
            print("⚠️  Base.metadata.tables is EMPTY! Models not registered.")
            print("🔧 Trying to import models manually...")
            
            import importlib
            import pkgutil
            import persistent.db
            
            for _, module_name, _ in pkgutil.iter_modules(persistent.db.__path__):
                if module_name.startswith('models') or 'model' in module_name:
                    try:
                        importlib.import_module(f'persistent.db.{module_name}')
                        print(f"✅ Imported persistent.db.{module_name}")
                    except Exception as e:
                        print(f"⚠️  Failed to import {module_name}: {e}")
            
            print(f"🔧 Tables after import: {list(Base.metadata.tables.keys())}")
        
    except Exception as e:
        print(f"❌ [DEBUG] Error getting settings: {e}")
        import os
        username = os.getenv("HACKATHON_PG__USERNAME", "hackathon_user")
        password = os.getenv("HACKATHON_PG__PASSWORD", "hackathon_pass")
        host = os.getenv("HACKATHON_PG__HOST", "postgres")
        port = os.getenv("HACKATHON_PG__PORT", "5432")
        database = os.getenv("HACKATHON_PG__DATABASE", "hackathon")
        
        engine = create_engine(
            f"postgresql://{username}:{password}@{host}:{port}/{database}"
        )
    else:
        engine = create_engine(
            f"postgresql://{settings.pg.username}:{settings.pg.password}@"
            f"{settings.pg.host}:{settings.pg.port}/{settings.pg.database}"
        )
    
    try:
        print("🔧 [DEBUG] Creating tables with Base.metadata.create_all()...")
        print(f"🔧 [DEBUG] Tables to create: {Base.metadata.tables.keys()}")
        
        Base.metadata.create_all(engine)
        print("✅ [DEBUG] Tables created successfully!")
            
    except Exception as e:
        print(f"❌ [DEBUG] Error creating tables: {e}")
        import traceback
        traceback.print_exc()
    
    print("=" * 50)
