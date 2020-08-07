
from os import path


from config import Config
cfg = Config()

async def save_transcription(mongo_client, pkt, data):
    collection = "transcriptions"
    print('Data saving in db', pkt, flush=True)
    result = await mongo_client.insert_json(pkt, collection)
    print('result %s' % repr(result.inserted_id), flush=True)
    return repr(result.inserted_id)

async def save_notes(mongo_client, pkt, data):
    print("Saving notes here: ", data)
    collection = "notes"
    print('Data saving in db', pkt, flush=True)
    result = await mongo_client.insert_json(pkt, collection)
    print('inserted_id for record', result.inserted_id, flush=True)
    return result.inserted_id


