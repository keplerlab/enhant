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
ARG PROJECT_DIR=/home/cli/
RUN mkdir ${PROJECT_DIR}

#COPY environment_docker.yml .

RUN conda create --name enhant python=3.7 

RUN eval "$(conda shell.bash hook)" && conda activate enhant && \
    pip install fastapi[all] typer
    
RUN eval "$(conda shell.bash hook)" && conda activate enhant && \
    pip install motor

# For autoformatting code for dev use, uncomment for production
RUN eval "$(conda shell.bash hook)" && conda activate enhant && \
    pip install black

RUN eval "$(conda shell.bash hook)" && conda activate enhant && \
    pip install flair

RUN eval "$(conda shell.bash hook)" && conda activate enhant && \
    pip install tensorflow_hub nltk

# Download nltk model 
RUN eval "$(conda shell.bash hook)" && conda activate enhant && \
    (echo "import nltk" ; echo "nltk.download('punkt')") | python

# RUN eval "$(conda shell.bash hook)" && conda activate enhant && \
#     pip install motor fastapi_contrib[mongo] pytz

#RUN eval "$(conda shell.bash hook)" && conda activate pecunia-nlp && pip install fuzzywuzzy

COPY activate_env.sh ${PROJECT_DIR}
WORKDIR ${PROJECT_DIR}
RUN touch /root/.bashrc \
 && cat ${PROJECT_DIR}/activate_env.sh >> /root/.bashrc

CMD ["/bin/bash"]
