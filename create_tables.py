import sys
sys.path.insert(0, "src")

from introflow.config.settings import get_settings
from sqlalchemy import create_engine, text, inspect

settings = get_settings()
engine = create_engine(str(settings.database_url))

with engine.connect() as conn:
    inspector = inspect(engine)
    existing = inspector.get_table_names()
    print(f"Existing tables: {existing}")

    if "video_calls" not in existing:
        conn.execute(text("""
            CREATE TABLE video_calls (
                id SERIAL PRIMARY KEY,
                caller_id INTEGER NOT NULL,
                recipient_id INTEGER NOT NULL,
                scheduled_time TIMESTAMP NOT NULL,
                duration INTEGER NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'pending',
                room_id VARCHAR(255) UNIQUE,
                title VARCHAR(255) NOT NULL,
                notes TEXT,
                created_at TIMESTAMP NOT NULL DEFAULT now(),
                updated_at TIMESTAMP NOT NULL DEFAULT now()
            )
        """))
        print("Created video_calls table")
    else:
        print("video_calls already exists - skipping")

    if "user_availability" not in existing:
        conn.execute(text("""
            CREATE TABLE user_availability (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                day_of_week INTEGER NOT NULL,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL,
                timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
                is_active BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMP NOT NULL DEFAULT now(),
                updated_at TIMESTAMP NOT NULL DEFAULT now()
            )
        """))
        print("Created user_availability table")
    else:
        print("user_availability already exists - skipping")

    if "call_ratings" not in existing:
        conn.execute(text("""
            CREATE TABLE call_ratings (
                id SERIAL PRIMARY KEY,
                call_id INTEGER NOT NULL,
                rater_id INTEGER NOT NULL,
                rating INTEGER NOT NULL,
                feedback TEXT,
                is_professional BOOLEAN NOT NULL DEFAULT true,
                would_recommend BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMP NOT NULL DEFAULT now(),
                updated_at TIMESTAMP NOT NULL DEFAULT now()
            )
        """))
        print("Created call_ratings table")
    else:
        print("call_ratings already exists - skipping")

    conn.commit()
    print("All done!")