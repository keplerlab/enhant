from pydantic import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Enhanr"
    mongo_DB_string: str = "What ever it is"
            # mongo db parameters
    mongodb_hostname: str = "mongo"
    mongodb_port: int = 27018
    mongodb_dbname: str = "enhant_db"


settings = Settings()