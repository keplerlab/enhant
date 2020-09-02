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

RUN pip install fastapi[all] typer pysrt

# For color coding console prints
RUN pip install colorama

# For autoformatting code for dev use, uncomment for production
# RUN eval "$(conda shell.bash hook)" && conda activate enhant && \
#     pip install black

RUN pip install  --no-cache-dir transformers==3.0.2 flair

RUN pip install tensorflow_hub nltk

RUN pip install sphinx_rtd_theme sphinx_js

RUN pip install tensorflow==2.2.0 keras==2.3.1 

RUN pip install --upgrade fastpunct

# Download nltk model 
RUN (echo "import nltk" ; echo "nltk.download('punkt')") | python

RUN (echo "import flair" ; echo "flair_sentiment = flair.models.TextClassifier.load('en-sentiment')" ) | python

RUN (echo "from fastpunct import FastPunct" ; echo "fastpunct = FastPunct('en')" ) | python


WORKDIR ${PROJECT_DIR}
CMD ["/bin/bash"]
