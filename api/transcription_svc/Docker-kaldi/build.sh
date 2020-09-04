#!/bin/bash

set -e
set -x

docker build --build-arg KALDI_MKL=0 --file Dockerfile.kaldi-vosk-server --tag keplerlab/kaldi-vosk-wesocket-server:latest .


docker push keplerlab/kaldi-vosk-wesocket-server:latest

