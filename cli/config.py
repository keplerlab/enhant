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
    mongo_DB_string: str = "Its a DB connection string"
    fooObj: foo = foo("Hello") 
    
    def get_data_analyers(self):
        return [foo("Hello Foo"), bar("Hello Bar")] 

    

settings = Settings()