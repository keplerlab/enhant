FROM ubuntu:18.04


# Identify the maintainer of an image
LABEL maintainer="Kepler Lab <keplerwaasi@gmail.com>"
ARG DEBIAN_FRONTEND=noninteractive

RUN  apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
	wget \
    git \
    curl \
    software-properties-common \
	make 
    
RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/*


#Install MINICONDA
RUN wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O Miniconda.sh && \
	/bin/bash Miniconda.sh -b -p /opt/conda && \
	rm Miniconda.sh

ENV PATH /opt/conda/bin:$PATH
#COPY environment_docker.yml .
RUN conda install python=3.7

RUN pip install websockets google.cloud.speech

WORKDIR /opt/transcription_svc/websocket-server
EXPOSE 1111
CMD ["bash","./start_transcription_google_cloud.sh"]
