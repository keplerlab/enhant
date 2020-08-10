from pydantic import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Enhanr"
    mongo_DB_string: str = "What ever it is"

    

settings = Settings()