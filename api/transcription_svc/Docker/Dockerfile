
FROM mayank10j/kaldi-vosk-server:latest

ENV MODEL_VERSION 0.2
RUN mkdir -p /opt/transcription_svc/vosk-model-en \
   && cd /opt/transcription_svc/vosk-model-en \
   && wget http://alphacephei.com/kaldi/models/vosk-model-en-us-aspire-${MODEL_VERSION}.zip \
   && unzip vosk-model-en-us-aspire-${MODEL_VERSION}.zip \
   && mv vosk-model-en-us-aspire-${MODEL_VERSION} model \
   && rm -rf vosk-model-en-us-aspire-${MODEL_VERSION}.zip

RUN eval  pip install google.cloud.speech websockets
RUN pip install --upgrade fastpunct

EXPOSE 1111
WORKDIR /opt/transcription_svc/websocket-server

CMD ["bash","run_service.sh"]
