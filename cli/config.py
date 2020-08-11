from pydantic import BaseSettings
from note import Note
from transcription import Transcription
from db_handler import MongoDBClient

class foo():
    def __init__(self, dbString: str):
        self.conStr = dbString
    def show(self):
        print(self.conStr, "Hello Foo")

class bar():
    def __init__(self, dbString: str):
        self.conStr = dbString
    def show(self):
        print(self.conStr, "Hello Bar")

class Settings(BaseSettings):
    app_name: str = "Enhanr"
    mongo_DB_string: str = "What ever it is"
    # mongo db parameters
    mongodb_hostname: str = "mongo"
    mongodb_port: int = 27018
    mongodb_dbname: str = "enhant_db"
    mongo_client = MongoDBClient(mongodb_hostname, mongodb_port, mongodb_dbname)

    #mongo_client: MongoClient = None

    def get_data_analyers(mongo_client):
        """
        Returns the list of analyzers.
        """

        # Add or remove analyzers here. All the analyzers will update the conversation JSON
        return [Note(mongo_client), Transcription(mongo_client)]
    

    data_analyzers: list =  get_data_analyers(mongo_client)



settings = Settings()