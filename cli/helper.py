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
from typing import NoReturn, Tuple
import time

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

def read_srt_file(input_data_folder_path: str, origin: str) -> dict:
    """[summary]

    :param input_data_folder_path: [description]
    :type input_data_folder_path: str
    :param origin: [description]
    :type origin: str
    :return: [description]
    :rtype: [type]
    """
    srt_file_name = os.path.join(input_data_folder_path, origin + ".srt")
    if os.path.isfile(srt_file_name):
        srtList = pysrt.open(srt_file_name)
        return srtList
    else:
        print(f"\n {Fore.YELLOW} WARNING: {origin}.srt file not present")
        return None


def save_corrected_srt_file(srtList:dict, input_data_folder_path: str, origin: str) -> NoReturn:
    """[summary]

    :param srtList: [description]
    :type srtList: dict
    :param input_data_folder_path: [description]
    :type input_data_folder_path: str
    :param origin: [description]
    :type origin: str
    :return: [description]
    :rtype: NoReturn
    """
    srt_file_name = os.path.join(input_data_folder_path, origin + "_corrected.srt")
    srtList.save(srt_file_name, encoding='utf-8')

def fix_apostrophe(string_to_fix: str) -> str:
    """fix apostrophe issue in string

    :param string_to_fix: [description]
    :type string_to_fix: str
    :return: [description]
    :rtype: str
    """
    if string_to_fix.startswith("` "):
        string_fixed = string_to_fix[2:]
        return string_fixed
    else:
        return string_to_fix

def correct_punctuation_srt_file(srtList: dict, use_punct_correction: bool):
    """[transform srt packet to list]
    :return: [description]
    :rtype: [type]
    """

    transcription_list = []
    corrected_transcription_list = []
    for srt in srtList:
        srt.text = srt.text.replace("\n", " ")
        if use_punct_correction:
            srt.text = truncate_string_to_fixed_size(srt.text)
            transcription_list.append(srt.text)

    start = time.time()
    if use_punct_correction:
        corrected_transcription_list = fastpunct.punct(
        transcription_list, batch_size=32
        )
    end = time.time()
    print("Time for fastpunct:", end - start)

    for idx, srt in enumerate(srtList):
        if use_punct_correction:
            string_text = corrected_transcription_list[idx]
            srt.text = fix_apostrophe(string_text)

    return srtList


def transform_Srt_to_list(
    srtList: dict , meeting_start_utc: Optional[int] = 0
):
    """[transform srt packet to list]
    :return: [description]
    :rtype: [type]
    """

    transcription_pkt_list = []
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


    # print("transcription_pkt_list", transcription_pkt_list)
    return transcription_pkt_list
