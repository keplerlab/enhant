#!/bin/bash
eval "$(conda shell.bash hook)"
conda activate enhant
uvicorn message_processor:app --port 8000 --host 0.0.0.0 --ssl-keyfile=./certificates/key.pem --ssl-certfile=./certificates/cert.pem --reload 2>&1 | tee -a log.txt
