
FROM mayank10j/kaldi-vosk-server:latest

ENV MODEL_VERSION 0.2
# RUN mkdir /opt/vosk-server/vosk-model-en \
#    && cd /opt/vosk-server/vosk-model-en \
#    && wget http://alphacephei.com/kaldi/models/vosk-model-en-us-aspire-${MODEL_VERSION}.zip \
#    && unzip vosk-model-en-us-aspire-${MODEL_VERSION}.zip \
#    && mv vosk-model-en-us-aspire-${MODEL_VERSION} model \
#    && rm -rf vosk-model-en-us-aspire-${MODEL_VERSION}.zip

RUN eval  pip install google.cloud.speech websockets
   

EXPOSE 1111
WORKDIR /opt/vosk-server/websocket
CMD [ "python3", "./python_websocket.py"]

#CMD [ "python3", "./asr_server.py", "/opt/vosk-server/vosk-model-en/model" ]
