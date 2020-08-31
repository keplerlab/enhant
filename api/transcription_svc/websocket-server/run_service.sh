#!/bin/sh

if [ "$USE_GOOGLE_TRANSCRIPTION_SERVICE" == "True" ]; then
  echo "Running Google transription service" && python python_websocket.py ;
else
  echo "Running VOC Kaldi offline transription service" && python asr_server.py /opt/transcription_svc/vosk-model-en/model ;
fi