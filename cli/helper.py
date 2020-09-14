"""
.. module:: Helper
    :platform: Platform Independent
    :synopsis: This module is for handling all misc utility functions 
"""
import sys
import os

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
import pysrt
from typing import List, Optional
from colorama import init, Fore, Back, Style
import textwrap

init(init(autoreset=True))
from fastpunct import FastPunct

fastpunct = FastPunct("en")


def eprint(*args, **kwargs):
    print(*args, file=sys.stderr, **kwargs)


def _transformTime(srt_time, start_utc_time=0):
    """[summary]

    :return: [description]
    :rtype: [type]
    """
    minutes = srt_time.minutes
    seconds = srt_time.seconds + 60 * minutes
    milliseconds = srt_time.milliseconds + seconds * 1000 + start_utc_time
    return milliseconds


def add_origin(transcription_pkt_list, origin: str):
    """[add origin field in transcription packet list]

    :param transcription_pkt_list: [description]
    :type transcription_pkt_list: [type]
    :param origin: [description]
    :type origin: [type]
    """
    for transcriptions_pkt in transcription_pkt_list:
        transcriptions_pkt["context"] = {}
        transcriptions_pkt["context"]["origin"] = origin

    return transcription_pkt_list


def truncate_string_to_fixed_size(input_string: str, max_len: int = 350) -> str:
    """truncate string to fix size 

    :param input_string: [description]
    :type input_string: str
    :param max_len: [description]
    :type max_len: int
    :return: [description]
    :rtype: str
    """
    truncated_string = (
        (input_string[:max_len] + "..") if len(input_string) > max_len else input_string
    )
    return truncated_string


def transform_Srt_and_correct_punct(
    input_data_folder_path: str, origin: str, use_punct_correction: bool, meeting_start_utc: Optional[int] = 0, 
):
    """[transform srt packet to list]
    :return: [description]
    :rtype: [type]
    """

    srt_file_name = os.path.join(input_data_folder_path, origin + ".srt")

    transcription_pkt_list = []

    if os.path.isfile(srt_file_name):
        srtList = pysrt.open(srt_file_name)

        transcription_list = []
        corrected_transcription_list = []
        for srt in srtList:
            srt_with_newline_corrected = srt.text.replace("\n", " ")
            if use_punct_correction:
                truncated_string = truncate_string_to_fixed_size(srt_with_newline_corrected)
                transcription_list.append(truncated_string)
            else:
                transcription_list.append(srt_with_newline_corrected)
            
        if use_punct_correction:
            #print("Doing punct correction using fastpunct")
            corrected_transcription_list = fastpunct.punct(
            transcription_list, batch_size=32
            )
        for idx, srt in enumerate(srtList):

            transcriptions_pkt = {}
            transcriptions_pkt["msg"] = {}

            transcriptions_pkt["msg"]["data"] = {}
            transcriptions_pkt["msg"]["data"]["transcription"] = {}

            if use_punct_correction:
                transcriptions_pkt["msg"]["data"]["transcription"][
                    "content"
                ] = corrected_transcription_list[idx]
            else:
                transcriptions_pkt["msg"]["data"]["transcription"][
                    "content"
                ] = transcription_list[idx]                
            transcriptions_pkt["msg"]["data"]["transcription"][
                "start_time"
            ] = _transformTime(srt.start, meeting_start_utc)

            transcriptions_pkt["msg"]["data"]["transcription"][
                "end_time"
            ] = _transformTime(srt.end, meeting_start_utc)

            transcription_pkt_list.append(transcriptions_pkt)
            transcription_pkt_list = add_origin(
                transcription_pkt_list, meeting_start_utc
            )

    else:
        print(f"\n {Fore.YELLOW} WARNING: {origin}.srt file not present")

    # print("transcription_pkt_list", transcription_pkt_list)
    return transcription_pkt_list


def transform_Srt_to_list(
    input_data_folder_path: str, origin: str, meeting_start_utc: Optional[int] = 0
):
    """[transform srt packet to list]
    :return: [description]
    :rtype: [type]
    """

    srt_file_name = os.path.join(input_data_folder_path, origin + ".srt")

    transcription_pkt_list = []

    if os.path.isfile(srt_file_name):
        srtList = pysrt.open(srt_file_name)

        for srt in srtList:

            transcriptions_pkt = {}
            transcriptions_pkt["msg"] = {}

            transcriptions_pkt["msg"]["data"] = {}
            transcriptions_pkt["msg"]["data"]["transcription"] = {}

            transcriptions_pkt["msg"]["data"]["transcription"]["content"] = srt.text
            transcriptions_pkt["msg"]["data"]["transcription"][
                "start_time"
            ] = _transformTime(srt.start, meeting_start_utc)

            transcriptions_pkt["msg"]["data"]["transcription"][
                "end_time"
            ] = _transformTime(srt.end, meeting_start_utc)

            transcription_pkt_list.append(transcriptions_pkt)
            transcription_pkt_list = add_origin(
                transcription_pkt_list, meeting_start_utc
            )

    else:
        print(f"\n {Fore.YELLOW} WARNING: {origin}.srt file not present")

    # print("transcription_pkt_list", transcription_pkt_list)
    return transcription_pkt_list
