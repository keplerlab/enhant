import asyncio
import pathlib
import ssl
import websockets
import os
import time
import sys
import re
import traceback
import wave
import helper as helper

from google.cloud import speech_v1p1beta1 as speech
from six.moves import queue

from audio_stream import ResumableMediaStream
from config import cfg
from concurrent.futures import ProcessPoolExecutor
from multiprocessing import Process, Queue, Pipe, Value, Manager
import json

# dec = opuslib.Decoder(cfg.SAMPLE_RATE, cfg.CHANNELS)

# import logging

# logger = logging.getLogger("asyncio").setLevel(logging.WARNING)
# logger.addHandler(logging.StreamHandler())


def get_current_time():
    """Return Current Time in MS."""

    return int(round(time.time() * 1000))


# Audio recording parameters

RED = "\033[0;31m"
GREEN = "\033[0;32m"
YELLOW = "\033[0;33m"


# async def say_after(delay, what):
#     await asyncio.sleep(delay)
#     print(what)


def listen_print_loop(responses, stream, parent_conn, stream_closed_flag):
    """Iterates through server responses and prints them.
    The responses passed is a generator that will block until a response
    is provided by the server.
    Each response may contain multiple results, and each result may contain
    multiple alternatives; for details, see https://goo.gl/tjCPAU.  Here we
    print only the transcription for the top alternative of the top result.
    In this case, responses are provided for interim results as well. If the
    response is an interim one, print a line feed at the end of it, to allow
    the next result to overwrite it, until the response is a final one. For the
    final one, print a newline to preserve the finalized transcription.
    """

    for response in responses:

        # Assign stream closed flag to stream closed
        stream.closed = bool(stream_closed_flag.value)
        if stream.closed is True:
            print("Breaking out of loop")
            break

        if get_current_time() - stream.start_time > cfg.STREAMING_LIMIT:
            stream.start_time = get_current_time()
            break

        if not response.results:
            continue

        result = response.results[0]

        if not result.alternatives:
            continue

        transcript = result.alternatives[0].transcript

        result_seconds = 0
        result_nanos = 0

        if result.result_end_time.seconds:
            result_seconds = result.result_end_time.seconds

        if result.result_end_time.nanos:
            result_nanos = result.result_end_time.nanos

        stream.result_end_time = int((result_seconds * 1000) + (result_nanos / 1000000))

        corrected_time = (
            stream.result_end_time
            - stream.bridging_offset
            + (cfg.STREAMING_LIMIT * stream.restart_counter)
        )
        # uncomment next line if want to Display interim results, but with a carriage return at the end of the
        # line, so subsequent lines will overwrite them.
        # parent_conn.send(transcript)
        if result.is_final:
            # Send transcript to parent process through pipe
            parent_conn.send(transcript)
            sys.stdout.write(str(corrected_time) + ": " + transcript + "\n")
            stream.is_final_end_time = stream.result_end_time
            stream.last_transcript_was_final = True
        else:
            stream.last_transcript_was_final = False


def transcription_loop(
    audio_buffer, parent_conn, stream_closed_flag, audio_recording_frames
):
    # await asyncio.sleep(4)
    # audio_recording_frames = []

    audio_manager = ResumableMediaStream(
        cfg.SAMPLE_RATE,
        cfg.CHUNK_SIZE,
        audio_buffer,
        stream_closed_flag,
        audio_recording_frames,
    )
    client = speech.SpeechClient()
    config = speech.types.RecognitionConfig(
        encoding=cfg.ENCODING,
        sample_rate_hertz=cfg.SAMPLE_RATE,
        enable_automatic_punctuation=cfg.ENABLE_AUTOMATIC_PUNCTUATION,
        language_code=cfg.LANGUAGE_CODE,
        max_alternatives=1,
    )
    streaming_config = speech.types.StreamingRecognitionConfig(
        config=config, interim_results=True
    )

    try:
        with audio_manager as stream:

            while not stream.closed:

                stream.closed = bool(stream_closed_flag.value)
                print("Value of stream.closed flag: ", stream.closed)
                # sys.stdout.write(YELLOW)
                sys.stdout.write(
                    "\n"
                    + str(cfg.STREAMING_LIMIT * stream.restart_counter)
                    + ": NEW REQUEST\n"
                )

                stream.audio_input = []
                audio_generator = stream.generator()

                requests = (
                    speech.types.StreamingRecognizeRequest(audio_content=content)
                    for content in audio_generator
                )

                responses = client.streaming_recognize(streaming_config, requests)

                # Now, put the transcription responses to use.
                listen_print_loop(responses, stream, parent_conn, stream_closed_flag)

                if stream.result_end_time > 0:
                    stream.final_request_end_time = stream.is_final_end_time
                stream.result_end_time = 0
                stream.last_audio_input = []
                stream.last_audio_input = stream.audio_input
                stream.audio_input = []
                stream.restart_counter = stream.restart_counter + 1

                if not stream.last_transcript_was_final:
                    sys.stdout.write("\n")
                stream.new_stream = True

    except Exception as error:
        print("Error in transcription service: ", error)
        stream_closed_flag.value = True
    print("\n\n***Transcription process closed ")
    stream_closed_flag.value = True


async def on_data(websocket, path):

    print("\n****New Websocket connection Established ")
    jsonDataString = await websocket.recv()
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

    ## Make audio manager
    audio_buffer = Queue()
    parent_conn, child_conn = Pipe()
    stream_closed_flag = Value("i", 0)
    stream_closed_flag.value = False

    manager = Manager()
    audio_recording_frames = manager.list()
    reader_process = Process(
        target=transcription_loop,
        args=(
            (audio_buffer),
            (parent_conn),
            (stream_closed_flag),
            (audio_recording_frames),
        ),
    )
    reader_process.daemon = True
    reader_process.start()

    record_audio = []

    # conv_id = jsonData[""]

    try:
        async for message in websocket:
            print("pkt", message)
            audio_buffer.put(message)

            # Comment out next two lines if no recording needed
            record_audio.append(message)

            if child_conn.poll():
                msg = child_conn.recv()
                await websocket.send(msg)
                print("Received the message: {}".format(msg))

            if bool(stream_closed_flag.value) == True:
                websocket.close()
                print("Breaking out of aysnc for in loop")
                break

    except (
        websockets.exceptions.ConnectionClosedError,
        websockets.exceptions.ConnectionClosedOK,
    ) as error:
        stream_closed_flag.value = True
        print("Websocket connection closed", error)
        print("Stream closed flag set to true")

    print("\n\n***Websocket connection closed")
    

    print("Exit from transcription_loop function saving recorded audio")

    folderName = os.path.join("recorded_audio", data_origin, conversation_id)

    os.makedirs(folderName, exist_ok=True)

    fileName = "recorded_audio_" + helper.generate_filename() + ".wav"
    full_file_name = os.path.join(folderName, fileName)
    print("\n*** Writing audio data in file:", full_file_name)

    helpler.write_audio_wave(record_audio, full_file_name, cfg.SAMPLE_RATE, cfg.SAMPLE_WIDTH, cfg.CHANNELS)
    
    # helper.write_audio_flac(
    #     record_audio, full_file_name
    # )
    await websocket.close()


ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
ssl_context.load_cert_chain(
    certfile="certificates/cert.pem", keyfile="certificates/key.pem"
)

start_server = websockets.serve(
    on_data, "0.0.0.0", 1111, ssl=ssl_context, max_queue=None
)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
