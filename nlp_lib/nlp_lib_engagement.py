"""
.. module:: NLP_lib_engagement
    :platform: Platform Independent
    :synopsis: This module is for calculating Engagement given text from two sides
"""
from os import path
import json
from nltk import sent_tokenize
import nltk
import flair
from types import SimpleNamespace
import copy


class NLP_lib_engagement(object):
    def __init__(self):
        """init function
        """
        self.expected_multiplier = 2.0
        self.expected_time_window = 120
        self.totalTime = {}
        self.totalSpokenWordsClient = {}
        self.totalSpokenWordsAdvisor = {}
        self.avgWordsPerMinuteClient = {}
        self.avgWordsPerMinuteAdvisor = {}
        self.spokenMsgsClientInTimeWindow = {}
        self.spokenMsgsAdvisorInTimeWindow = {}

    def processMessage(self, meeting_id: str, origin: str, msg: dict) -> float:
        """Returns responses as rules along with score

        :param meeting_id: [description]
        :type meeting_id: str
        :param origin: [description]
        :type origin: str
        :param msg: [description]
        :type msg: dict
        :return: [description]
        :rtype: float
        """
        if meeting_id in self.totalTime:
            pass
        else:
            self.totalTime[meeting_id] = 1.0
            self.totalSpokenWordsClient[meeting_id] = 1.0
            self.totalSpokenWordsAdvisor[meeting_id] = 1.0
            self.spokenMsgsClientInTimeWindow[meeting_id] = []
            self.spokenMsgsAdvisorInTimeWindow[meeting_id] = []
            self.avgWordsPerMinuteClient[meeting_id] = 1.0
            self.avgWordsPerMinuteAdvisor[meeting_id] = 1.0

        engagementScore = self._getEngagement(meeting_id, origin, msg)
        return engagementScore

    def resetState(self):
        """Reset state for all clients
        """
        self.totalTime = {}
        self.totalSpokenWordsClient = {}
        self.totalSpokenWordsAdvisor = {}
        self.avgWordsPerMinuteClient = {}
        self.avgWordsPerMinuteAdvisor = {}
        self.spokenMsgsClientInTimeWindow = {}
        self.spokenMsgsAdvisorInTimeWindow = {}
        print(
            "\n\n**********Reset state for engagement detection complete**********\n\n"
        )

    def _getEngagement(self, meeting_id: str, origin: str, msg: dict) -> float:
        """Get engagement score at receiving msg

        :param meeting_id: [description]
        :type meeting_id: str
        :param origin: [description]
        :type origin: str
        :param msg: [description]
        :type msg: dict
        :return: [description]
        :rtype: float
        """
        requestData = msg["content"]
        num_of_words = len(requestData.split())

        wordMessage = dict(
            [
                ("num_of_words", num_of_words),
                ("timestamp_start", float(msg["start_time"]) / 1000),
                ("timestamp_stop", float(msg["end_time"]) / 1000),
            ]
        )
        wordMessage = SimpleNamespace(**wordMessage)
        avg_engagement_score = 1.0

        if origin == "client2":
            self.spokenMsgsClientInTimeWindow[meeting_id].append(wordMessage)
            wordMessage2 = copy.deepcopy(wordMessage)
            wordMessage2.num_of_words = 0
            self.spokenMsgsAdvisorInTimeWindow[meeting_id].append(wordMessage2)

        elif origin == "client1":
            self.spokenMsgsAdvisorInTimeWindow[meeting_id].append(wordMessage)
            wordMessage2 = copy.deepcopy(wordMessage)
            wordMessage2.num_of_words = 0
            self.spokenMsgsClientInTimeWindow[meeting_id].append(wordMessage2)

        self.spokenMsgsClientInTimeWindow[meeting_id] = self._cleanListForTimeWindow(
            self.spokenMsgsClientInTimeWindow[meeting_id],
            float(msg["end_time"]) / 1000.0,
        )

        self.spokenMsgsAdvisorInTimeWindow[meeting_id] = self._cleanListForTimeWindow(
            self.spokenMsgsAdvisorInTimeWindow[meeting_id],
            float(msg["end_time"]) / 1000.0,
        )

        for item in self.spokenMsgsClientInTimeWindow[meeting_id]:
            self.totalSpokenWordsClient[meeting_id] += item.num_of_words
            self.totalTime[meeting_id] += item.timestamp_stop - item.timestamp_start

        for item in self.spokenMsgsAdvisorInTimeWindow[meeting_id]:
            self.totalSpokenWordsAdvisor[meeting_id] += item.num_of_words

        self.avgWordsPerMinuteClient[meeting_id] = (
            self.totalSpokenWordsClient[meeting_id] * 60.0
        ) / self.totalTime[meeting_id]

        self.avgWordsPerMinuteAdvisor[meeting_id] = (
            self.totalSpokenWordsAdvisor[meeting_id] * 60.0
        ) / self.totalTime[meeting_id]

        avg_engagement_score = (
            self._relu(
                (self.avgWordsPerMinuteClient[meeting_id] * self.expected_multiplier)
                / self.avgWordsPerMinuteAdvisor[meeting_id]
            )
            * 100.0
        )

        avg_engagement_score = round(avg_engagement_score)
        # print("avg_engagement_score", avg_engagement_score)

        return avg_engagement_score

    def _relu(self, value: float) -> float:
        """Limit value between 0 to 1

        :param value: [description]
        :type value: float
        :return: [description]
        :rtype: float
        """
        if value > 1.0:
            return 1.0
        elif value < 0.0:
            return 0.0
        else:
            return value

    def _tokenize_sentences(self, sentences: list) -> list:
        """Call nltk sentence tokenizer on given sentences

        :param sentences: [description]
        :type sentences: list
        :return: [description]
        :rtype: list
        """
        return sent_tokenize(sentences)

    def _cleanListForTimeWindow(self, msgList: list, current_endtime: float) -> list:
        """Filter out messages from msgList that are older than
         expected_time_window amount of time

        :param msgList: [description]
        :type msgList: list
        :param current_endtime: [description]
        :type current_endtime: float
        :return: [description]
        :rtype: list
        """
        updatedList = []
        for item in msgList:
            if (current_endtime - item.timestamp_start) <= self.expected_time_window:
                updatedList.append(item)
            else:
                pass

        return updatedList
