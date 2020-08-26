"""
.. module:: message_processor
    :platform: Platform Independent
    :synopsis: Main module for processing all messages from websocket client
"""

import logging
from fastapi import FastAPI, WebSocket

import json
import pkt_handler as pkt_handler
from config import Config
from db_handler import MongoDBClient
from note_processor import Note
from conversation_processor import Conversation
from transcription_processor import Transcription

# Import config
cfg = Config()

# Initialize mongo db client
mongo_client = MongoDBClient(cfg.mongodb_hostname, cfg.mongodb_port, cfg.mongodb_dbname)

app = FastAPI()

@app.websocket("/")
async def websocket_endpoint(websocket: WebSocket):
    """[Main websocket endpoint]

    :param websocket: [description]
    :type websocket: WebSocket
    :raises Exception: [description]
    """
    await websocket.accept()
    while True:
        pkt = await websocket.receive_json()
        print("Packet Received", pkt, flush=True)
        print(pkt["msg"]["name"])
        is_ok, statusPkt = pkt_handler.isRequestValid(pkt)
        if is_ok is False:
            print("ERROR in request", flush=True)
            response_pkt = pkt_handler.prepare_response(pkt, is_ok, statusPkt)
            await websocket.send_json(response_pkt)
            # raise Exception("Incorrect request")
        else:
            data = pkt_handler.extract_data_from_msg(pkt)
            print("Data received", data, flush=True)
            inserted_record_id = None
            if "transcription" in data:
                print("Saving transcription", data, flush=True)
                myTranscription = Transcription(mongo_client, pkt)
                inserted_record_id = await myTranscription.save_transcription()
            elif "note" in data:
                myNote = Note(mongo_client, pkt)
                inserted_record_id = await myNote.process_note()
            elif "conversation" in data:
                myConoversation = Conversation(mongo_client, pkt)
                inserted_record_id = await myConoversation.save_conversation()
            else:
                is_ok = False
                print("Error in processing incoming request: ", pkt, flush=True)
            response_pkt = pkt_handler.prepare_response(
                pkt, is_ok, statusPkt, inserted_record_id
            )
            print("Packet Sent", response_pkt, flush=True)
            await websocket.send_json(response_pkt)


@app.on_event("startup")
async def startup():
    """[Establish connection with mongodb on websocket startup]
    """
    await mongo_client.connect()
