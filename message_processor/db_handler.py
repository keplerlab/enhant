
from os import path
import motor.motor_asyncio

# import json
# from bson import ObjectId
# from bson import Binary, Code
# from bson.json_util import dumps
# from bson.json_util import loads

from fastapi.encoders import jsonable_encoder


# class JSONEncoder(json.JSONEncoder):
#     def default(self, o):
#         if isinstance(o, ObjectId):
#             return str(o)
#         return json.JSONEncoder.default(self, o)

#JSONEncoder().encode(analytics)

class MongoDBClient(object):
    """Client for adding mongodb connections"""
    def __init__(self, db_hostname, db_port, db_name):
        self.db_hostname = db_hostname
        self.db_port = db_port
        self.db_name = db_name
        self.db_name = db_name
        self.db_client_handler = None
        self.db_handler = None

    async def connect(self):
        """Connecting to db"""
        print('Connecting to db:', flush=True)
        self.db_client_handler = motor.motor_asyncio.AsyncIOMotorClient(self.db_hostname, self.db_port)
        print('Connection established with db using motor', flush=True)
        self.db_handler = self.db_client_handler[self.db_name]
    
    async def insert_json(self, jsonPkt, collectionName):
        collection = self.db_handler[collectionName]
        #print('Data saving in db', jsonPkt, flush=True)
        #print("jsonable_encoder(jsonPkt): " ,jsonable_encoder(jsonPkt),flush=True)
        result = await collection.insert_one(jsonable_encoder(jsonPkt))
        return result




