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

        # Audio recording parameters
        self.STREAMING_LIMIT = 10000
        self.SAMPLE_RATE = 24000
        self.CHUNK_SIZE = int(self.SAMPLE_RATE / 100)  # 100ms
        self.SAMPLE_WIDTH = 2
        self.LANGUAGE_CODE = "en-IN"
        self.enable_automatic_punctuation = True
        self.SPEECH_CONTEXT_PHRASES = []

        # Color code
        self.RED = "\033[0;31m"
        self.GREEN = "\033[0;32m"
        self.YELLOW = "\033[0;33m"
