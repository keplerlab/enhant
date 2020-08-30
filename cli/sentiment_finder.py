"""
.. module:: SentimentFinder
    :platform: Platform Independent
    :synopsis: This module is for handling all functions for a transcription 
"""
import sys
import os
from typing import NoReturn, Tuple

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

    def _transformTranscription(self, transcriptions_pkt:dict)-> Tuple[dict]:
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

    def process(self, input_json_data , guest_transcription_list:list, host_transcription_list:list) \
        ->NoReturn:
        """[Public function for extracting and getting sentiments]

        :param conv_id: [description]
        :type conv_id: [type]
        """

        print("\n**** Analyzing Sentiment ****")
        if input_json_data == None:
            print(f"No matching conversation for input_json_data: {input_json_data}")
            return
        conv_id = input_json_data["meeting_id"]


        listOfQuestions = []


        low_sentiment_scores = []
        high_sentiment_scores = []

        if guest_transcription_list is not None:
            for transcriptions_pkt in guest_transcription_list:
                transcription, start_time = self._transformTranscription(transcriptions_pkt)
                sentiment_score = sentiment_lib.processMessage(transcription)
                sentiment_with_time = (start_time, transcription, sentiment_score)

                if sentiment_score < self.low_sentiment_threshold:
                    low_sentiment_scores.append(sentiment_with_time)
                elif sentiment_score > self.high_sentiment_threshold:
                    high_sentiment_scores.append(sentiment_with_time)

        if host_transcription_list is not None:
            for transcriptions_pkt in host_transcription_list:
                transcription, start_time = self._transformTranscription(transcriptions_pkt)
                sentiment_score = sentiment_lib.processMessage(transcription)
                sentiment_with_time = (start_time, transcription, sentiment_score)

                if sentiment_score < self.low_sentiment_threshold:
                    low_sentiment_scores.append(sentiment_with_time)
                elif sentiment_score > self.high_sentiment_threshold:
                    high_sentiment_scores.append(sentiment_with_time)

        
        #print("high_sentiment_scores", high_sentiment_scores)
        #print("low_sentiment_scores", low_sentiment_scores)

        if len(high_sentiment_scores) > 0:
            jsonPkt = {"highSentimentSentence": high_sentiment_scores}
            input_json_data["highSentimentSentence"] = jsonPkt
            

        if len(low_sentiment_scores) > 0:
            jsonPkt = {"lowSentimentSentence": low_sentiment_scores}
            input_json_data["lowSentimentSentence"] = jsonPkt

