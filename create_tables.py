import sys
sys.path.insert(0, "src")

from introflow.config.settings import get_settings
from introflow.models.video_call_models import Base
from sqlalchemy import create_engine

settings = get_settings()
engine = create_engine(str(settings.database_url))
Base.metadata.create_all(engine)
print("Tables created successfully")