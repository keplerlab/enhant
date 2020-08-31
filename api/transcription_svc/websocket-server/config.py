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
        self.ENCODING = "LINEAR16"
        self.CHANNELS = 1
        self.SAMPLE_RATE = int(os.environ.get('SAMPLE_RATE', 44100))
        self.STREAMING_LIMIT = 240000
        self.CHUNK_SIZE = int(self.SAMPLE_RATE / 100)  # 100ms
        self.SAMPLE_WIDTH = 2
        self.LANGUAGE_CODE = "en-US"
        self.ENABLE_AUTOMATIC_PUNCTUATION = True
        self.SPEECH_CONTEXT_PHRASES = []
        self.TRANSCRIPTION_PROVDER = "Kaldi"
        self.INTERFACE = os.environ.get('SERVER_INTERFACE', '0.0.0.0')
        self.PORT = int(os.environ.get('SERVER_PORT', 1111))
        self.VOSK_MODEL_PATH = os.environ.get('VOSK_MODEL_PATH', 'model')
        self.CERT_FILE_PATH = "certificates/localhost+2.pem"
        self.KEY_FILE_PATH = "certificates/localhost+2-key.pem"


cfg = Config()
