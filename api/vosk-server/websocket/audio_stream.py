import time
import re
import sys
import os
from six.moves import queue
import datetime
import traceback
import asyncio

from config import cfg


def get_current_time():
    """Return Current Time in MS."""

    return int(round(time.time() * 1000))


class ResumableMediaStream:
    """Opens a recording stream as a generator yielding the audio chunks."""

    def __init__(
        self, rate, chunk_size, audio_buffer, stream_closed_flag, audio_recording_frames
    ):
        self._rate = rate
        self.audio_buffer = audio_buffer
        self.chunk_size = chunk_size
        self._num_channels = 1
        self.audio_recording_frames = audio_recording_frames
        self.closed = True
        self.stream_closed_flag = stream_closed_flag
        self.start_time = get_current_time()
        self.restart_counter = 0
        self.audio_input = []
        self.last_audio_input = []
        self.result_end_time = 0
        self.is_final_end_time = 0
        self.final_request_end_time = 0
        self.bridging_offset = 0
        self.last_transcript_was_final = False
        self.new_stream = True

    def __enter__(self):

        self.closed = False
        return self

    def __exit__(self, type, value, traceback):

        self.closed = True
        # Signal the generator to terminate so that the client's
        # streaming_recognize method will not block the process termination.
        self.audio_buffer.put(None)

    def fill_buffer(self, in_data, *args, **kwargs):
        """Continuously collect data from the audio stream, into the buffer."""
        self.audio_buffer.put(in_data)
        # self._buff.put(in_data)
        return None

    def generator(self):
        """Stream Audio from microphone to API and to local buffer"""

        while not self.closed:
            self.closed = bool(self.stream_closed_flag.value)

            data = []
            try:
                if self.new_stream and self.last_audio_input:

                    chunk_time = cfg.STREAMING_LIMIT / len(self.last_audio_input)

                    if chunk_time != 0:

                        if self.bridging_offset < 0:
                            self.bridging_offset = 0

                        if self.bridging_offset > self.final_request_end_time:
                            self.bridging_offset = self.final_request_end_time

                        chunks_from_ms = round(
                            (self.final_request_end_time - self.bridging_offset)
                            / chunk_time
                        )

                        self.bridging_offset = round(
                            (len(self.last_audio_input) - chunks_from_ms) * chunk_time
                        )

                        for i in range(chunks_from_ms, len(self.last_audio_input)):
                            data.append(self.last_audio_input[i])

                    self.new_stream = False

                # Use a blocking get() to ensure there's at least one chunk of
                # data, and stop iteration if the chunk is None, indicating the
                # end of the audio stream.

                chunk = self.audio_buffer.get(block=True)

                if chunk is None:
                    return
                self.audio_input.append(chunk)
                data.append(chunk)
                # Now consume whatever other data's still buffered.
                while True:
                    try:
                        chunk = self.audio_buffer.get(block=False)

                        if chunk is None:
                            return

                        data.append(chunk)
                        self.audio_input.append(chunk)

                    except queue.Empty:
                        break

            except Exception as error:
                print("Exception catcher", error)
                traceback.print_exc()
                raise error

            yield b"".join(data)
