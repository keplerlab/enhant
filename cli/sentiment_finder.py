"""
.. module:: SentimentFinder
    :platform: Platform Independent
    :synopsis: This module is for handling all functions for a transcription 
"""
import sys
import os
from typing import NoReturn, Tuple
from colorama import init, Fore
import warnings

warnings.filterwarnings("ignore")

init(init(autoreset=True))

sys.path.insert(1, os.path.join(sys.path[0], "..", "nlp_lib"))
from nlp_lib_sentiment import NLP_lib_sentiment

sentiment_lib = NLP_lib_sentiment()


class SentimentFinder(object):
    """[Class for extracting sentiments from given text]

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
        self.low_sentiment_threshold = 0.3
        self.high_sentiment_threshold = 0.7

    def _transformTranscription(self, transcriptions_pkt: dict) -> Tuple[dict]:
        """[summary transcription packet]

        :param transcriptions_pkt: [description]
        :type transcriptions_pkt: [type]
        :return: [description]
        :rtype: [type]
        """
        return (
            transcriptions_pkt["msg"]["data"]["transcription"]["content"],
            transcriptions_pkt["msg"]["data"]["transcription"]["start_time"],
        )

    def _transformTranscriptionbatch(self, transcriptions_pkt: dict) -> dict:
        """[transform transcription packet]

        :param transcriptions_pkt: [description]
        :type transcriptions_pkt: [type]
        :return: [description]
        :rtype: [type]
        """
        return (
            transcriptions_pkt["word"],
            transcriptions_pkt["startTime"],
            transcriptions_pkt["speakerTag"],
        )

    def process(
        self,
        input_json_data: dict,
        guest_transcription_list: list,
        host_transcription_list: list,
    ) -> NoReturn:
        """[Public function for extracting and getting sentiments]

        :param conv_id: [description]
        :type conv_id: [type]
        """

        print(Fore.GREEN + "\n**** Analyzing Sentiment ****")
        if input_json_data == None:
            print(f"No matching conversation for input_json_data: {input_json_data}")
            return
        conv_id = input_json_data["meeting_id"]

        low_sentiment_scores_guest = []
        high_sentiment_scores_guest = []
        low_sentiment_scores_host = []
        high_sentiment_scores_host = []
        total_of_sentiment_scores_host = 0.0
        number_of_sentiment_scores_host = 0
        total_of_sentiment_scores_guest = 0.0
        number_of_sentiment_scores_guest = 0
        avg_sentiment_score_guest = 0.0
        avg_sentiment_score_host = 0.0

        if guest_transcription_list is not None:
            for transcriptions_pkt in guest_transcription_list:
                transcription, start_time = self._transformTranscription(
                    transcriptions_pkt
                )
                sentiment_score = sentiment_lib.processMessage(transcription)
                sentiment_with_time = (start_time, transcription, sentiment_score)
                total_of_sentiment_scores_guest += float(sentiment_score)
                number_of_sentiment_scores_guest += 1

                if sentiment_score < self.low_sentiment_threshold:
                    low_sentiment_scores_guest.append(sentiment_with_time)
                elif sentiment_score > self.high_sentiment_threshold:
                    high_sentiment_scores_guest.append(sentiment_with_time)

        if host_transcription_list is not None:
            for transcriptions_pkt in host_transcription_list:
                transcription, start_time = self._transformTranscription(
                    transcriptions_pkt
                )
                sentiment_score = sentiment_lib.processMessage(transcription)
                sentiment_with_time = (start_time, transcription, sentiment_score)
                total_of_sentiment_scores_host += sentiment_score
                number_of_sentiment_scores_host += 1

                if sentiment_score < self.low_sentiment_threshold:
                    low_sentiment_scores_host.append(sentiment_with_time)
                elif sentiment_score > self.high_sentiment_threshold:
                    high_sentiment_scores_host.append(sentiment_with_time)

        if len(high_sentiment_scores_host) > 0 or len(high_sentiment_scores_guest) > 0:
            jsonPkt = {
                "highSentimentSentencesHost": high_sentiment_scores_host,
                "highSentimentSentencesGuest": high_sentiment_scores_guest,
            }
            input_json_data["highSentimentSentences"] = jsonPkt

        if len(low_sentiment_scores_host) > 0 or len(low_sentiment_scores_guest) > 0:
            jsonPkt = {
                "lowSentimentSentencesHost": low_sentiment_scores_host,
                "lowSentimentSentencesGuest": low_sentiment_scores_guest,
            }
            input_json_data["lowSentimentSentences"] = jsonPkt

        if number_of_sentiment_scores_guest > 0:
            avg_sentiment_score_guest = (
                total_of_sentiment_scores_guest / number_of_sentiment_scores_guest
            )
            input_json_data["avgSentimentScoreGuest"] = str(avg_sentiment_score_guest)

        if number_of_sentiment_scores_host > 0:
            avg_sentiment_score_host = (
                total_of_sentiment_scores_host / number_of_sentiment_scores_host
            )
            input_json_data["avgSentimentScoreHost"] = str(avg_sentiment_score_host)



    def processbatch(
        self,
        input_json_data: dict,
        output_json_data: dict,

    ) -> NoReturn:
        """[Public function for extracting and getting sentiments]

        :param conv_id: [description]
        :type conv_id: [type]
        """

        print(Fore.GREEN + "\n**** Analyzing Sentiment ****")
        if input_json_data == None:
            print(f"No matching conversation for input_json_data: {input_json_data}")
            return

        low_sentiment_scores = []
        high_sentiment_scores = []
        total_of_sentiment_scores = 0.0
        number_of_sentiment_scores = 0
        avg_sentiment_score = 0.0
        avg_sentiment_score = 0.0

        if input_json_data is not None:
            for transcriptions_pkt in input_json_data:
                transcription, start_time, speakerTag = self._transformTranscriptionbatch(
                    transcriptions_pkt
                )
                sentiment_score = sentiment_lib.processMessage(transcription)
                sentiment_with_time = (start_time, transcription, sentiment_score)
                total_of_sentiment_scores += float(sentiment_score)
                number_of_sentiment_scores += 1

                if sentiment_score < self.low_sentiment_threshold:
                    low_sentiment_scores.append(sentiment_with_time)
                elif sentiment_score > self.high_sentiment_threshold:
                    high_sentiment_scores.append(sentiment_with_time)

        if len(high_sentiment_scores) > 0 :
            jsonPkt = {
                "highSentimentSentences": high_sentiment_scores,
            }
            output_json_data["highSentimentSentences"] = jsonPkt

        if len(low_sentiment_scores) > 0 :
            jsonPkt = {
                "low_sentiment_scores": low_sentiment_scores,
            }
            output_json_data["lowSentimentSentences"] = jsonPkt

        if number_of_sentiment_scores > 0:
            avg_sentiment_score = (
                total_of_sentiment_scores / number_of_sentiment_scores
            )
            output_json_data["avgSentimentScore"] = str(avg_sentiment_score)
