"""
.. module:: srtHelper
    :platform: Platform Independent
    :synopsis: This module is for handling all functions for easing up processing of srt files 
"""
import sys
import os
import pysrt

def eprint(*args, **kwargs):
    print(*args, file=sys.stderr, **kwargs)

def transformSrt(srtList, meeting_start_utc, meeting_end_utc):
    """[transform srt packet]
    :return: [description]
    :rtype: [type]
    """    

    transcription_pkt_list = []
    for srt in srtList:
        print("srt.start.seconds", srt.start.seconds)
        print("srt.start.milliseconds", srt.start.milliseconds)
        transcriptions_pkt = {}
        transcriptions_pkt['msg'] = {}
        transcriptions_pkt['msg']['data'] = {}
        transcriptions_pkt['msg']['data']['transcription'] = {}
        #transcriptions_pkt['msg']['data']['transcription']['content'] = {}
        transcriptions_pkt["msg"]["data"]["transcription"]["content"] = srt.text
        transcriptions_pkt["msg"]["data"]["transcription"]["start_time"] = srt.start.milliseconds
        transcriptions_pkt["msg"]["data"]["transcription"]["end_time"] = srt.end.milliseconds
        print("transcriptions_pkt", transcriptions_pkt)
        transcription_pkt_list.append(transcriptions_pkt)

    print("transcription_pkt_list", transcription_pkt_list) 
    return transcription_pkt_list
