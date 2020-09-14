
How to use custom transcription service
========================================

Due to unavailability of capability of current browsers to do guest side/or screen 
side audio transcription we cannot do guest side transcription in browser,
hence currently host side transcription for enhant plugin is done 
by command line docker application , for this enhant plugin sends captures screen
audio using tabcapture api in chrome, this audio is sent into with following 
format::

    type: LINEAR16
    number of channels: 1 
    sample rate: 44100
    sample width: 2 

additionally transcription service is hosted as an websocket server with https enabled
on port number **1111** 

To communicate some of the configuration parameters are communicated between 
plugin and command line application. 
Format of data sent by Plugin to application on first connect::

    {
        "cmd":"start",
        "origin":"speaker",
        "conversation_id":"ID",
        "lang":"en-US"
    }

On successfully connect application sends following json data back::

    {
        "cmd":"start",
        "origin":"speaker",
        "conversation_id":"ID",
        "lang_enabled":"en-US",
        "need_punctuation": True
    }

After this initial handshake browser plugin needs to send continuous packets of raw
audio data in format discussed earlier. In return transcription service sends back 
text transcription data as and when available. 

To implement your own transcription service you need to follow the same protocol 
so that plugin remains interface agnostic to actual transcription service. 

