
from os import path
# from fastapi_contrib.db.models import MongoDBModel
# import asyncio

import motor.motor_asyncio

url='mongodb://mongo:27018/pecunia'
local_url='mongodb://localhost:27018/pecunia'

# class MyModel(MongoDBModel):
#     additional_field1: str
#     optional_field2: int = 42

#     class Meta:
#         collection = "mymodel_collection"


async def save_transcription(pkt, data):
    print('Inside save_transcription function', flush=True)
    client = motor.motor_asyncio.AsyncIOMotorClient('mongo', 27018)
    print('Connection establieshed with motor', flush=True)
    db = client.test_database
    collection = db.test_collection
    document = {'hello': 'world'}
    print('Data saving in db', document, flush=True)
    result = await db.test_collection.insert_one(document)
    print('result %s' % repr(result.inserted_id), flush=True)

    # mymodel = MyModel(additional_field1="value")
    # mymodel.save()
    # assert mymodel.additional_field1 == "value"
    # assert mymodel.optional_field2 == 42
    # assert isinstance(mymodel.id, int)

    print("Saving transcription here: ", data, flush=True)


async def save_notes(pkt, data):
    print("Saving notes here: ", data)


async def save_bookmark(pkt, data):
    print("Saving bookmark here: ", data)

