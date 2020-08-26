#!/bin/bash
eval "$(conda shell.bash hook)"
conda activate pecunia-transcription
python -u python_websocket.py 2>&1 | tee -a log.txt
