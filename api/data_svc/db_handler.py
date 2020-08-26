"""
.. module:: db handler
    :platform: Platform Independent
    :synopsis: This module is for handling all functions for db handling 
"""
from os import path
import motor.motor_asyncio
from fastapi.encoders import jsonable_encoder
from bson import ObjectId


class MongoDBClient(object):
    """[Client for adding mongodb connections]

    :param object: [description]
    :type object: [type]
    :return: [description]
    :rtype: [type]
    """    

    def __init__(self, db_hostname, db_port, db_name):
        """[init function]

        :param db_hostname: [description]
        :type db_hostname: [type]
        :param db_port: [description]
        :type db_port: [type]
        :param db_name: [description]
        :type db_name: [type]
        """
        self.db_hostname = db_hostname
        self.db_port = db_port
        self.db_name = db_name
        self.db_name = db_name
        self.db_client_handler = None
        self.db_handler = None

    def get_search_by_id_query(self, id):
        """[Return mongodb query for searching by id in primary collection]

        :param id: [description]
        :type id: [type]
        :return: [description]
        :rtype: [type]
        """
        return {"_id": ObjectId(id)}

    def get_search_query_context_conv_id(self, conv_id):
        """[Return mongodb query for searching by conv_id in collections]

        :param conv_id: [description]
        :type conv_id: [type]
        :return: [description]
        :rtype: [type]
        """
        return {"context.conv_id": str(conv_id)}

    async def connect(self):
        """[Connecting to db]
        """        
        print("Connecting to db:", flush=True)
        self.db_client_handler = motor.motor_asyncio.AsyncIOMotorClient(
            self.db_hostname, self.db_port
        )
        print("Connection established with db using motor", flush=True)
        self.db_handler = self.db_client_handler[self.db_name]

    async def insert_json(self, jsonPkt, collectionName):
        """[Insert given json into given collection in db]

        :param jsonPkt: [description]
        :type jsonPkt: [type]
        :param collectionName: [description]
        :type collectionName: [type]
        :return: [description]
        :rtype: [type]
        """
        collection = self.db_handler[collectionName]

        # print('Data saving in db', jsonPkt, flush=True)

        # Convert json packet to pymongo compatible serialize
        # format using fastapi helper api
        db_insert_json = jsonable_encoder(jsonPkt)
        result = await collection.insert_one(db_insert_json)
        return result

    async def update_json(self, conv_id, jsonPkt, collectionName):
        """[Update given json into given collection in db for given conv_id record]

        :param conv_id: [description]
        :type conv_id: [type]
        :param jsonPkt: [description]
        :type jsonPkt: [type]
        :param collectionName: [description]
        :type collectionName: [type]
        :return: [description]
        :rtype: [type]
        """
        collection = self.db_handler[collectionName]
        db_insert_json = jsonable_encoder(jsonPkt)
        result = await collection.find_one_and_update(
            self.get_search_by_id_query(conv_id), {"$set": db_insert_json}
        )

        return result

    async def delete_json(self, id, collectionName):
        """[Delete given json with id from given collection in db]

        :param id: [description]
        :type id: [type]
        :param collectionName: [description]
        :type collectionName: [type]
        :return: [description]
        :rtype: [type]
        """
        collection = self.db_handler[collectionName]
        result = await collection.delete_one(self.get_search_by_id_query(id))
        print("API call recieved:", result.acknowledged)
        print("Documents deleted:", result.deleted_count)
        return result.deleted_count

    async def findQueryProcessor(self, query, collectionName):
        """[Returns all records matching given query from given collection]

        :param query: [description]
        :type query: [type]
        :param collectionName: [description]
        :type collectionName: [type]
        :return: [description]
        :rtype: [type]
        """
        print("\n\n\n****Calling findQueryProcessor")
        collection = self.db_handler[collectionName]
        cursor = collection.find(query)
        # print("cursor", cursor,  flush=True)
        listOfItems = await cursor.to_list(None)
        print("listOfItems", listOfItems, flush=True)

        return listOfItems

    async def findOneQueryProcessor(self, query, collectionName):
        """[Find one record matching given query from given collection]

        :param query: [description]
        :type query: [type]
        :param collectionName: [description]
        :type collectionName: [type]
        :return: [description]
        :rtype: [type]
        """
        collection = self.db_handler[collectionName]
        myDocument = collection.find_one(query)
        return myDocument
