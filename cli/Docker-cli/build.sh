#!/bin/bash

set -e
set -x

docker build --file Dockerfile --tag keplerlab/enhant-cli:latest .
docker push keplerlab/enhant-cli:latest

