
FROM mayank10j/kaldi-vosk-server:latest

ENV MODEL_VERSION 0.2
RUN mkdir -p /opt/transcription_svc/vosk-model-en \
   && cd /opt/transcription_svc/vosk-model-en \
   && wget http://alphacephei.com/kaldi/models/vosk-model-en-us-aspire-${MODEL_VERSION}.zip \
   && unzip vosk-model-en-us-aspire-${MODEL_VERSION}.zip \
   && mv vosk-model-en-us-aspire-${MODEL_VERSION} model \
   && rm -rf vosk-model-en-us-aspire-${MODEL_VERSION}.zip

RUN eval  pip install google.cloud.speech websockets
RUN pip install tensorflow keras 
RUN pip install --upgrade fastpunct

# RUN git clone https://github.com/plkmo/NLP_Toolkit.git /opt/transcription_svc/NLP_Toolkit/  \
# && cd /opt/transcription_svc/NLP_Toolkit/  \
# && pip install . \
# python -m spacy download en_core_web_lg

WORKDIR /opt/transcription_svc/websocket-server
EXPOSE 1111


CMD ["bash","run_service.sh"]
