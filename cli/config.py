from pydantic import BaseSettings

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

    def get_data_analyers(conString: str):
        """
        Returns the list of analyzers.
        """

        # Add or remove analyzers here. All the analyzers will update the conversation JSON
        return [foo(conString), bar(conString)]
    

    data_analyzers: list =  get_data_analyers(mongo_DB_string)



settings = Settings()