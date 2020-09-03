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
import helper as helper
from config import cfg

import keras.backend.tensorflow_backend as tb
from deepsegment import DeepSegment


import time
segmenter = DeepSegment('en')

print("Inside asr server", flush=True)

vosk_model_path = cfg.VOSK_MODEL_PATH

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
    tb._SYMBOLIC_SCOPE.value = True

    responseJsonStr = ""
    resultStatus = False
    if message == '{"eof" : 1}':
        responseJsonStr = rec.FinalResult()
        resultStatus = True
    elif rec.AcceptWaveform(message):
        responseJsonStr = rec.Result()
        resultStatus = False
    else:
        #print("Partial Result", rec.PartialResult())
        responseJsonStr = rec.PartialResult()
        resultStatus = False

    responseJson = json.loads(responseJsonStr)
    #print("responseJson", responseJson)
    if "result" in responseJson:
        resultText = responseJson["text"]
        #print("transcription without punct:", resultText, flush=True)
        #start = time.time()
        #result_after_fastpunct = fastpunct.punct([resultText], batch_size=1)
        #end = time.time()
        #print("Time for fastpunct", end - start, flush=True)
        #print("result_after_fastpunct", result_after_fastpunct, flush=True)
        #start = time.time()
        deepSegResult = segmenter.segment(resultText)
        deepSegResultStr = '. '.join(deepSegResult)
        deepSegResultStr = deepSegResultStr + ". "
        #end = time.time()
        #print("Time for deepSegResult", end - start, flush=True)
        #print("deepSegResult", deepSegResultStr, flush=True)

        
        #print("transcription after punct:", result_after_fastpunct, flush=True)
        return deepSegResultStr, resultStatus
    return None, resultStatus

async def recognize(websocket, path):

    rec = None
    word_list = None
    sample_rate = cfg.SAMPLE_RATE

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

    record_audio = []

    try:
        while True:

            message = await websocket.recv()
            record_audio.append(message)
            #print("message", message, flush=True)
            # Create the recognizer, word list is temporary disabled since not every model supports it
            if not rec:
                if False and word_list:
                    rec = KaldiRecognizer(model, sample_rate, word_list)
                else:
                    rec = KaldiRecognizer(model, sample_rate)

            resultText, stop = await loop.run_in_executor(pool, process_chunk, rec, message)
            if resultText is not None:
                print("Transcription: ", resultText, flush=True)
                await websocket.send(resultText)
                #
                #print("resultText", resultText)

            #print("response", response)
            
            if stop: break
    
    except (
        websockets.exceptions.ConnectionClosed,
        websockets.exceptions.ConnectionClosedError,
        websockets.exceptions.ConnectionClosedOK,
    ) as error:
        print("Websocket connection closed", error)

    
    print("Exit from transcription_loop function saving recorded audio", flush=True)

    folderName = os.path.join("recorded_audio", data_origin, conversation_id)
    os.makedirs(folderName, exist_ok=True)
    fileName = "recorded_audio_" + helper.generate_filename() + ".wav"
    full_file_name = os.path.join(folderName, fileName)
    print("\n*** Writing audio data in file:", full_file_name, flush=True)

    helper.write_audio_wave(record_audio, full_file_name, cfg.SAMPLE_RATE, cfg.SAMPLE_WIDTH, cfg.CHANNELS)
    

ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
ssl_context.load_cert_chain(
    certfile=cfg.CERT_FILE_PATH, keyfile=cfg.KEY_FILE_PATH
)

print("\n\n****Vosk Kaldi voice recognizer server is now ready", flush=True)
print("vosk_interface", cfg.INTERFACE, flush=True)
print("vosk_port", cfg.PORT, flush=True)
start_server = websockets.serve(
    recognize, cfg.INTERFACE, cfg.PORT, ssl=ssl_context, max_queue=None)

loop.run_until_complete(start_server)
loop.run_forever()
