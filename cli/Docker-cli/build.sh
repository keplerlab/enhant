#!/bin/bash

set -e
set -x

docker build --file Dockerfile --tag keplerlab/enhant-cli:0.1.4 .
docker push keplerlab/enhant-cli:0.1.4

