#!/bin/sh
python asr_server.py /opt/transcription_svc/vosk-model-en/model 2>&1 | tee -a log.txt
