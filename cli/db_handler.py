from os import path
from pymongo import MongoClient
from fastapi.encoders import jsonable_encoder
from bson import ObjectId
from pymongo.errors import ConnectionFailure


class MongoDBClient(object):
    """Client for adding mongodb connections"""

    def __init__(self, db_hostname, db_port, db_name):
        self.db_hostname = db_hostname
        self.db_port = db_port
        self.db_name = db_name
        self.db_name = db_name
        self.db_client_handler = None
        self.db_handler = None

    def conv_finder_query_in_result_db(self, conv_id):
        return {"_id": ObjectId(conv_id)}

    def conv_finder_query_in_other_db(self, conv_id):
        return {"context.conv_id": str(conv_id)}

    def connect(self):
        """Connecting to db"""
        print("Connecting to db:", flush=True)
        # self.db_client_handler = motor.motor_asyncio.AsyncIOMotorClient(
        #    self.db_hostname, self.db_port
        # )
        print("Connection established with db using pymongo", flush=True)
        self.db_client_handler = MongoClient(self.db_hostname, self.db_port)
        self.db_handler = self.db_client_handler[self.db_name]

        try:
            # The ismaster command is cheap and does not require auth.
            self.db_client_handler.admin.command("ismaster")
        except ConnectionFailure:
            print("Server not available")

    def insert_json(self, jsonPkt, collectionName):
        collection = self.db_handler[collectionName]
        db_insert_json = jsonable_encoder(jsonPkt)
        result = collection.insert_one(db_insert_json)
        return result

    def delete_json(self, id, collectionName):
        collection = self.db_handler[collectionName]
        myquery = {"_id": ObjectId(id)}
        result = collection.delete_one(myquery)
        # print the API call's results
        print("API call recieved:", result.acknowledged)
        print("Documents deleted:", result.deleted_count)
        return result.deleted_count

    def update_json(self, conv_id, jsonPkt, collectionName):
        collection = self.db_handler[collectionName]
        db_insert_json = jsonable_encoder(jsonPkt)
        result = collection.find_one_and_update(
            self.conv_finder_query_in_result_db(conv_id), {"$set": db_insert_json}
        )
        return result

    def findQueryProcessor(self, query, collectionName):
        collection = self.db_handler[collectionName]
        cursor = collection.find(query)
        return cursor

    def findOneQueryProcessor(self, query, collectionName):
        collection = self.db_handler[collectionName]
        # t_query = jsonable_encoder(query)
        myDocument = collection.find_one(query)
        return myDocument
