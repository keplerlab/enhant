#!/usr/bin/env python3

import json
import os
import sys
import asyncio
import ssl
import pathlib
import websockets
import concurrent.futures
import logging
from vosk import Model, KaldiRecognizer

# Enable loging if needed
#
# logger = logging.getLogger('websockets')
# logger.setLevel(logging.INFO)
# logger.addHandler(logging.StreamHandler())

# vosk_interface = os.environ.get('VOSK_SERVER_INTERFACE', '0.0.0.0')
# vosk_port = int(os.environ.get('VOSK_SERVER_PORT', 2700))
# vosk_model_path = os.environ.get('VOSK_MODEL_PATH', 'model')
# vosk_sample_rate = float(os.environ.get('VOSK_SAMPLE_RATE', 8000))
vosk_interface = '0.0.0.0'
vosk_port = 1111
vosk_model_path = 'model'
vosk_sample_rate = 44100

print("Inside asr server", flush=True)

if len(sys.argv) > 1:
   vosk_model_path = sys.argv[1]

# Gpu part, uncomment if vosk-api has gpu support
#
# from vosk import GpuInit, GpuInstantiate
# GpuInit()
# def thread_init():
#     GpuInstantiate()
# pool = concurrent.futures.ThreadPoolExecutor(initializer=thread_init)

model = Model(vosk_model_path)
pool = concurrent.futures.ThreadPoolExecutor((os.cpu_count() or 1))
loop = asyncio.get_event_loop()

def process_chunk(rec, message):
    if message == '{"eof" : 1}':
        return rec.FinalResult(), True
    elif rec.AcceptWaveform(message):
        return rec.Result(), False
    else:
        return rec.PartialResult(), False

async def recognize(websocket, path):

    rec = None
    word_list = None
    sample_rate = vosk_sample_rate

    print("\n****New Websocket connection Established ", flush=True)
    jsonDataString = await websocket.recv()
    print("jsonDataString", jsonDataString)
    #print("\n\n****jsonData:", jsonDataString, flush=True)
    jsonData = json.loads(jsonDataString)
    print("\n\n****jsonData:", jsonData, flush=True)
    if jsonData["cmd"] != "start":
        print("Error in initial packet start packet not found", flush=True)
        return 0

    if jsonData["origin"] != "mic" and jsonData["origin"] != "speaker":
        print("Error in initial packet: Incorrect origin", flush=True)
        return 0

    data_origin = jsonData["origin"]

    if "conversation_id" not in jsonData:
        print("Error in initial packet conversation_id not found", flush=True)
        return 0

    conversation_id = jsonData["conversation_id"]
    print("conversation_id", conversation_id, flush=True)
    print("data_origin", data_origin, flush=True)

    try:
        while True:

            message = await websocket.recv()
            print("message", message, flush=True)
            # Create the recognizer, word list is temporary disabled since not every model supports it
            if not rec:
                if False and word_list:
                    rec = KaldiRecognizer(model, sample_rate, word_list)
                else:
                    rec = KaldiRecognizer(model, sample_rate)

            response, stop = await loop.run_in_executor(pool, process_chunk, rec, message)
            await websocket.send(response)
            if stop: break
    
    except (
        websockets.exceptions.ConnectionClosed,
        websockets.exceptions.ConnectionClosedError,
        websockets.exceptions.ConnectionClosedOK,
    ) as error:
        print("Websocket connection closed", error)

ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
ssl_context.load_cert_chain(
    certfile="certificates/localhost+2.pem", keyfile="certificates/localhost+2-key.pem"
)

print("\n\n****Vosk Kaldi voice recognizer server is now ready", flush=True)
print("vosk_interface", vosk_interface, flush=True)
print("vosk_port", vosk_port, flush=True)
start_server = websockets.serve(
    recognize, vosk_interface, vosk_port, ssl=ssl_context, max_queue=None)

loop.run_until_complete(start_server)
loop.run_forever()
