"""
.. module:: Config
    :platform: Platform Independent
    :synopsis: This module has commonly used config parameters
"""

import os


class Config:
    def __init__(self):
        #        os.environ[
        #            "GOOGLE_APPLICATION_CREDENTIALS"
        #        ] = "project-voicebox-fa7bc2f8fa18.json"
        self.OUT_DIR = "data_dump"
        # self.ENCODING = speech.enums.RecognitionConfig.AudioEncoding.LINEAR16
        self.ENCODING = "FLAC"
        self.CHANNELS = 1
        self.SAMPLE_RATE = 44100
        self.STREAMING_LIMIT = 240000
        self.CHUNK_SIZE = int(self.SAMPLE_RATE / 100)  # 100ms
        self.SAMPLE_WIDTH = 2
        self.LANGUAGE_CODE = "en-IN"
        self.ENABLE_AUTOMATIC_PUNCTUATION = True
        self.SPEECH_CONTEXT_PHRASES = []


cfg = Config()
