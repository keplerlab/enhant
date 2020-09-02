#!/bin/bash

set -e
set -x

docker build --build-arg KALDI_MKL=0 --file Dockerfile.kaldi-vosk-server --tag mayank10j/kaldi-vosk-server:latest .


docker push mayank10j/kaldi-vosk-server:latest

