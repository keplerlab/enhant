"""
.. module:: helper
    :platform: Platform Independent
    :synopsis: This module has commonly used helper functions used by client
"""


import os
import sys
import glob
import platform
import wave
import random
import string
import datetime
import time
import json
import collections
from array import array
import soundfile

import numpy as np

def eprint(*args, **kwargs):
    print(*args, file=sys.stderr, **kwargs)


def _creation_date(path_to_file):
    """
    Internal function for getting creation date
    Try to get the date that a file was created, falling back to when it was
    last modified if that isn't possible.
    See http://stackoverflow.com/a/39501288/1709587 for explanation.

    :param path_to_file: Get unique file name by getting creation date
    :type path_to_file: string
    :return: get creation date
    :rtype: stat.st_mtime

    """
    if platform.system() == "Windows":
        return os.path.getctime(path_to_file)
    else:
        stat = os.stat(path_to_file)
        try:
            return stat.st_birthtime
        except AttributeError:
            # We're probably on Linux. No easy way to get creation dates here,
            # so we'll settle for when its content was last modified.
            return stat.st_mtime


def get_current_time():
    """Return Current Time in MS."""

    return int(round(time.time() * 1000))


def get_current_time_now():
    """Return Current Time in MS."""

    return datetime.datetime.now()


def generate_filename():
    rand_str = "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
    now = datetime.datetime.now().strftime("%d-%m-%Y-%H-%M-%S")

    return now + rand_str


def write_audio_wave(audio_data, filename, RATE, SAMPLE_WIDTH, CHANNELS=1):
    wf = wave.open(filename, "wb")
    wf.setnchannels(CHANNELS)
    wf.setsampwidth(SAMPLE_WIDTH)
    wf.setframerate(RATE)
    wf.writeframes(b"".join(audio_data))
    wf.close()


def write_audio(audio_data, filename, RATE, SAMPLE_WIDTH, CHANNELS=1):
    f = open(filename, "w+b")
    # binary_format = bytes(audio_data)
    # binary_format = bytearray(audio_data)
    binary_format = b"".join(audio_data)
    f.write(binary_format)
    f.close()


def write_audio_flac(audio_data, filename):

    # arr = numpy.array(audio_data, dtype=numpy.float32)
    # print("arr.dtype", arr.dtype)
    # bytearray(audio_data)

    mat = np.array(audio_data)
    print("\n\n***mat.dtype", mat)

    if len(audio_data) > 100:
        binary_format = b"".join(audio_data)
        f = open(filename, "w+b")
        f.write(binary_format)
        f.close()
    else:
        print("audio Data is empty, skip save", flush=True)

    # sf.write(filename, arr, RATE)
