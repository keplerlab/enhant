FROM ubuntu:18.04


# Identify the maintainer of an image
LABEL maintainer="mjain28@sapient.com"
ARG DEBIAN_FRONTEND=noninteractive

RUN  apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
	wget \
    git \
    curl \
    software-properties-common \
	make 


#Install MINICONDA
RUN wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O Miniconda.sh && \
	/bin/bash Miniconda.sh -b -p /opt/conda && \
	rm Miniconda.sh

ENV PATH /opt/conda/bin:$PATH
ARG HOME_DIR=/home/
ARG PROJECT_DIR=/home/transcription/
RUN mkdir ${PROJECT_DIR}

#COPY environment_docker.yml .

RUN conda create --name pecunia-transcription python=3.7 

RUN eval "$(conda shell.bash hook)" && conda activate pecunia-transcription && \
    pip install websockets google.cloud.speech

RUN apt-get install -y libopus-dev libsndfile1
RUN eval "$(conda shell.bash hook)" && conda activate pecunia-transcription && \
    pip install opuslib pysoundfile cffi numpy
    
RUN eval "$(conda shell.bash hook)" && conda activate pecunia-transcription && \
    conda install cffi numpy

RUN eval "$(conda shell.bash hook)" && conda activate pecunia-transcription && \
    pip install pysoundfile

COPY start_transcription_server.sh ${PROJECT_DIR}

WORKDIR ${PROJECT_DIR}
CMD ["bash","./start_transcription_server.sh"]
