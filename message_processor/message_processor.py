import logging
from fastapi import FastAPI, WebSocket
import json
import pkt_handler as pkt_handler


# setup loggers
#logging.config.fileConfig('logging.conf', disable_existing_loggers=False)

app = FastAPI()


@app.websocket("/")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        pkt = await websocket.receive_json()
        print("Packet Received", pkt)
        print(pkt["msg"]["name"])
        is_ok = pkt_handler.isRequestValid(pkt) 
        if is_ok is False:
            print("ERROR in request")
            response_pkt = pkt_handler.prepare_response(pkt, is_ok)
            await websocket.send_json(response_pkt)
            #raise Exception("Incorrect request")
        else:
            response_pkt = pkt_handler.prepare_response(pkt, is_ok)
            print("Packet Sent", response_pkt, )
            await websocket.send_json(response_pkt)


