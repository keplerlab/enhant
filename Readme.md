# Basics

Enhant is AI powered platform which enables real time analytics of video calls. Enhant enables participants engagement & sentiment detection, capture moments and notes, analyze interrogatives to find commonly asked questions, etc.

Enhant comes with docker and internally creates multiple containers:

1. Chrome plugin: Enhant uses chrome plugin for getting meeting audios for any compatible services that can run on web browser e.g. Teams, Zoom etc. 

2.  Mongo: Enhant use mongo to store user and meetings data. The mongo service handles all the installation and the data is stored inside */path/to/enhant/db*.
**Mongo is exposed on port 27018**.

3. Transcription: Enhant uses python based Transcription service to transcribe speech **Transcription API service is exposed on port 1111**. 

4. Message Processor: An fastapi server to host the enhant web server. **Web server is exposed on port 8000**.

5. cli: Enhant uses Natural Language processing service for Sentiment & Engagement analysis, and detecting client interrogatives. 
**NLP is run using batch process and invoked as command line utility made using typer python framework. 



# Running Enhant

1. Start Docker containers:

```
cd /path/to/enahant-repo/
docker-compose up
```

2. Invoke cli for conversation id (111 in example below):

```
cd /path/to/enahant-repo
docker-compose run cli
python  main.py analyze 111 
```