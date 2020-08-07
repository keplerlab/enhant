import logging
from fastapi import FastAPI, WebSocket
# from fastapi_contrib.db.utils import setup_mongodb

import json
import pkt_handler as pkt_handler
import save_data as data_saver
from config import Config
from db_handler import MongoDBClient

# Import config 
cfg = Config()

# place holder for mongo client 
#mongo_client = None
mongo_client = MongoDBClient(cfg.mongodb_hostname, cfg.mongodb_port, cfg.mongodb_dbname)


app = FastAPI()


@app.websocket("/")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        pkt = await websocket.receive_json()
        print("Packet Received", pkt, flush=True)
        print(pkt["msg"]["name"])
        is_ok = pkt_handler.isRequestValid(pkt) 
        if is_ok is False:
            print("ERROR in request", flush=True)
            response_pkt = pkt_handler.prepare_response(pkt, is_ok)
            await websocket.send_json(response_pkt)
            #raise Exception("Incorrect request")
        else:
            data = pkt_handler.extract_data_from_msg(pkt)
            print("Data received", data, flush=True)
            inserted_record_id = None
            if "transcription" in data:
                print("Saving transcription", data, flush=True)
                inserted_record_id = await data_saver.save_transcription(mongo_client, pkt, data)
            elif "note" in data:
                inserted_record_id = await data_saver.save_notes(mongo_client, pkt, data)
            else:
                is_ok = False
            response_pkt = pkt_handler.prepare_response(pkt, is_ok, inserted_record_id)
            print("Packet Sent", response_pkt, flush=True)
            await websocket.send_json(response_pkt)


@app.on_event('startup')
async def startup():
    await mongo_client.connect()

