from pydantic import BaseSettings

class foo():
    def __init__(self, dbString: str):
        self.conStr = dbString
    def show(self):
        print(self.conStr)

class bar():
    def __init__(self, dbString: str):
        self.conStr = dbString
    def show(self):
        print(self.conStr)

class Settings(BaseSettings):
    app_name: str = "Enhanr"
    mongo_DB_string: str = "What ever it is"
            # mongo db parameters
    mongodb_hostname: str = "mongo"
    mongodb_port: int = 27018
    mongodb_dbname: str = "enhant_db"


settings = Settings()