"""
.. module:: EngagmentFinder
    :platform: Platform Independent
    :synopsis: This module is for handling all functions for a transcription 
"""

import sys
import os
from typing import NoReturn, Tuple
from colorama import init, Fore

init(init(autoreset=True))

sys.path.insert(1, os.path.join(sys.path[0], "..", "nlp_lib"))

from nlp_lib_engagement import NLP_lib_engagement

engagement_lib = NLP_lib_engagement()


def timeSortingFunction(tuple):
    """[summary]

    :param tuple: [description]
    :type tuple: [type]
    :return: [description]
    :rtype: [type]
    """
    return int(tuple[1]["end_time"])


class EngagmentFinder(object):
    """[Client for handling notes]

    :param object: [description]
    :type object: [type]
    :return: [description]
    :rtype: [type]
    """

    def __init__(self):
        """[init function]

        """
        self.processed_conversation_collection = "conversations_processed"
        self.collection = "transcriptions"

    def _transformTranscription(self, transcriptions_pkt: dict) -> Tuple[dict]:
        """[transform Transcription]

        :param transcriptions_pkt: [description]
        :type transcriptions_pkt: [type]
        :return: [description]
        :rtype: [type]
        """

        return (
            transcriptions_pkt["msg"]["data"]["transcription"],
            transcriptions_pkt["context"]["origin"],
        )

    def process(
        self,
        input_json_data,
        guest_transcription_list: list,
        host_transcription_list: list,
    ) -> NoReturn:
        """[Public function for saving engagement]

        :param conv_id: [description]
        :type conv_id: [type]
        """

        print(Fore.GREEN + "\n**** Analyzing Engagement ****")

        if input_json_data == None:
            print(f"No matching conversation for input_json_data: {input_json_data}")
            return

        conv_id = input_json_data["meeting_id"]

        if guest_transcription_list is None or len(guest_transcription_list) == 0:
            return

        transcriptions_with_time = []
        if guest_transcription_list is not None:
            for transcriptions_pkt in guest_transcription_list:
                msg, origin = self._transformTranscription(transcriptions_pkt)
                transcription_with_time = (origin, msg)
                transcriptions_with_time.append(transcription_with_time)

        if host_transcription_list is not None:
            for transcriptions_pkt in host_transcription_list:
                msg, origin = self._transformTranscription(transcriptions_pkt)
                transcription_with_time = (origin, msg)
                transcriptions_with_time.append(transcription_with_time)

        transcriptions_with_time.sort(key=timeSortingFunction)

        engagement_scores = []
        total_of_engagement_scores = 0
        number_of_engagement_scores = 0
        for transcriptionTuple in transcriptions_with_time:

            end_time = transcriptionTuple[1]["end_time"]
            engagement_score = engagement_lib.processMessage(
                conv_id, transcriptionTuple[0], transcriptionTuple[1]
            )

            engagement_with_time = (int(end_time), engagement_score)
            engagement_scores.append(engagement_with_time)
            total_of_engagement_scores += engagement_score
            number_of_engagement_scores += 1
        if number_of_engagement_scores > 0:
            avg_engagement_score = (
                total_of_engagement_scores / number_of_engagement_scores
            )
        else:
            avg_engagement_score = 0

        if len(engagement_scores) > 0:

            jsonPkt = {
                "engagement_scores": engagement_scores,
                "avg_engagement_score": avg_engagement_score,
            }
            input_json_data["engagement_scores"] = jsonPkt
