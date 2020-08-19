from os import path
import motor.motor_asyncio
from fastapi.encoders import jsonable_encoder
from bson import ObjectId


class MongoDBClient(object):
    """Client for adding mongodb connections"""

    def __init__(self, db_hostname, db_port, db_name):
        self.db_hostname = db_hostname
        self.db_port = db_port
        self.db_name = db_name
        self.db_name = db_name
        self.db_client_handler = None
        self.db_handler = None

    def get_search_by_id_query(self, id):
        return {"_id": ObjectId(id)}

    def get_search_query_context_conv_id(self, conv_id):
        return {"context.conv_id": str(conv_id)}

    async def connect(self):
        """Connecting to db"""
        print("Connecting to db:", flush=True)
        self.db_client_handler = motor.motor_asyncio.AsyncIOMotorClient(
            self.db_hostname, self.db_port
        )
        print("Connection established with db using motor", flush=True)
        self.db_handler = self.db_client_handler[self.db_name]

    async def insert_json(self, jsonPkt, collectionName):
        collection = self.db_handler[collectionName]

        # print('Data saving in db', jsonPkt, flush=True)

        # Convert json packet to pymongo compatible serialize
        # format using fastapi helper api
        db_insert_json = jsonable_encoder(jsonPkt)
        result = await collection.insert_one(db_insert_json)
        return result

    async def update_json(self, conv_id, jsonPkt, collectionName):
        collection = self.db_handler[collectionName]
        db_insert_json = jsonable_encoder(jsonPkt)
        result = await collection.find_one_and_update(
            self.get_search_by_id_query(conv_id), {"$set": db_insert_json}
        )

        return result

    async def delete_json(self, id, collectionName):
        collection = self.db_handler[collectionName]
        result = await collection.delete_one(self.get_search_by_id_query(conv_id))
        print("API call recieved:", result.acknowledged)
        print("Documents deleted:", result.deleted_count)
        return result.deleted_count

    async def findQueryProcessor(self, query, collectionName):
        print("\n\n\n****Calling findQueryProcessor")
        collection = self.db_handler[collectionName]
        cursor = collection.find(query)
        # print("cursor", cursor,  flush=True)
        listOfItems = await cursor.to_list(None)
        print("listOfItems", listOfItems, flush=True)

        return listOfItems

    async def findOneQueryProcessor(self, query, collectionName):
        collection = self.db_handler[collectionName]
        myDocument = collection.find_one(query)
        return myDocument
