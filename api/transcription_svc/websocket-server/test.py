#!/usr/bin/env python3

import asyncio
import websockets
import sys
import json 

jsonData = {}
jsonData["origin"] = "speaker"
jsonData["cmd"] = "start"
jsonData["conversation_id"] = "1111"

# convert into JSON:
jsonDataStr = json.dumps(jsonData)

output_file = open("output_transcription.txt", "w")

async def hello(uri):
    async with websockets.connect(uri) as websocket:
        wf = open(sys.argv[1], "rb")
        await websocket.send(jsonDataStr)
        while True:
            data = wf.read(44100)
            

            if len(data) == 0:
                break

            await websocket.send(data)
            #await asyncio.sleep(0.1)
            output = await websocket.recv()
            
            if output != "":
                print(output)
                output_file.write(output)

        await websocket.send('{"eof" : 1}')
        print (await websocket.recv())
        output_file.close()



asyncio.get_event_loop().run_until_complete(
    hello('ws://0.0.0.0:1112'))
