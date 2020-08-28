#!/usr/bin/env python3

import asyncio
import websocket
import sys
import ssl
import pathlib

# ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
# #localhost_pem = pathlib.Path(__file__).with_name("certificates/cert.pem")
# ssl_context.load_verify_locations("certificates/cert.pem")

#ws = websockets.WebSocket(sslopt={"cert_reqs": ssl.CERT_NONE})
ws = websocket.WebSocket(sslopt={"cert_reqs": ssl.CERT_NONE})

async def hello(uri):

    ws.connect(uri)
    wf = open(sys.argv[1], "rb")
    while True:
        data = wf.read(44100)

        if len(data) == 0:
            break

        ws.send(data)
        print (ws.recv())

    ws.send('{"eof" : 1}')
    print (ws.recv())

asyncio.get_event_loop().run_until_complete(
    hello('wss://0.0.0.0:1111'))
