import logging
from fastapi import FastAPI, WebSocket
import json
import pkt_handler as pkt_handler


# setup loggers
logging.config.fileConfig('logging.conf', disable_existing_loggers=False)

app = FastAPI()


@app.websocket("/")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        pkt = await websocket.receive_json()
        print("Packet Received", pkt)
        if pkt_handler.isRequestValid(pkt) is False:
            print("")
            raise Exception("Incorrect request")
        else: 
            response_pkt = pkt
            response_pkt["response"] = {"name": "ADD", "status": True}
            print("Packet Sent", response_pkt)
            await websocket.send_json(response_pkt)


