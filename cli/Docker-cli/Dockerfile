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
	make \
    gpg-agent

    
RUN  curl -sL https://deb.nodesource.com/setup_12.x | bash - \
    && \
    apt-get install -y nodejs \
    && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN npm install -g jsdoc

#Install MINICONDA
RUN wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O Miniconda.sh && \
	/bin/bash Miniconda.sh -b -p /opt/conda && \
	rm Miniconda.sh

ENV PATH /opt/conda/bin:$PATH
ARG HOME_DIR=/home/
ARG PROJECT_DIR=/home/cli/
RUN mkdir ${PROJECT_DIR}

#COPY environment_docker.yml .
RUN conda install python=3.7

RUN pip install --no-cache-dir colorama typer pydantic pysrt transformers==3.0.2 flair tensorflow_hub nltk sphinx_rtd_theme sphinx_js tensorflow==2.2.0 keras==2.3.1 fastpunct

# Download nltk model 
RUN (echo "import nltk" ; echo "nltk.download('punkt')") | python

RUN (echo "import flair" ; echo "flair_sentiment = flair.models.TextClassifier.load('en-sentiment')" ) | python

RUN (echo "from fastpunct import FastPunct" ; echo "fastpunct = FastPunct('en')" ) | python

RUN (echo "import nltk" ; echo "nltk.download('nps_chat')") | python

RUN pip --no-cache-dir install deepsegment \
   && (echo "from deepsegment import DeepSegment" ; echo "segmenter = DeepSegment('en')" ) | python 

RUN pip install punctuator \
    && mkdir -p ~/.punctuator \
    && cd ~/.punctuator \
    && gdown https://drive.google.com/uc?id=0B7BsN5f2F1fZd1Q0aXlrUDhDbnM

COPY train_questions_model.py .
RUN mkdir -p /home/model \
    && python train_questions_model.py

RUN npm install --save @google-cloud/speech
RUN pip install google-cloud-storage 
RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

ARG PROJECT_DIR=/home/cli/
WORKDIR ${PROJECT_DIR}
CMD ["/bin/bash"]
