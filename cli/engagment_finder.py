"""
.. module:: EngagmentFinder
    :platform: Platform Independent
    :synopsis: This module is for handling all functions for a transcription 
"""

import sys
import os

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

    def __init__(self, mongo_client):
        """[init function]

        :param mongo_client: [description]
        :type mongo_client: [type]
        """
        self.processed_conversation_collection = "conversations_processed"
        self.collection = "transcriptions"
        self.mongo_client = mongo_client
        self.low_sentiment_threshold = 0.3
        self.high_sentiment_threshold = 0.7

    def _transformTranscription(self, transcriptions_pkt):
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

    def process(self, conv_id):
        """[Public function for saving engagement]

        :param conv_id: [description]
        :type conv_id: [type]
        """
        # print("inside questions processing code with conversationo id: ", conv_id)

        # Connecct to db
        self.mongo_client.connect()

        conversation_document = self.mongo_client.findOneQueryProcessor(
            self.mongo_client.get_search_by_id_query(conv_id),
            self.processed_conversation_collection,
        )
        # print("\n***conversation_document: ", conversation_document)
        if conversation_document == None:
            print(f"No matching conversation for conv ID: {conv_id}")
            return

        cursor = self.mongo_client.findQueryProcessor(
            self.mongo_client.get_search_query_context_conv_id(conv_id), self.collection
        )

        transcriptions_with_time = []
        for transcriptions_pkt in cursor:
            msg, origin = self._transformTranscription(transcriptions_pkt)
            transcription_with_time = (origin, msg)
            transcriptions_with_time.append(transcription_with_time)

        print("transcriptions_with_time", transcriptions_with_time)
        transcriptions_with_time.sort(key=timeSortingFunction)
        print("Sorted transcriptions_with_time", transcriptions_with_time)

        engagement_scores = []
        for transcriptionTuple in transcriptions_with_time:
            # print("transcriptionTuple",transcriptionTuple)
            print("transcriptionTuple[0]", transcriptionTuple[0])
            print("transcriptionTuple[1]", transcriptionTuple[1])
            end_time = transcriptionTuple[1]["end_time"]
            engagement_score = engagement_lib.processMessage(
                conv_id, transcriptionTuple[0], transcriptionTuple[1]
            )
            engagement_with_time = (int(end_time), engagement_score)
            engagement_scores.append(engagement_with_time)

        print("engagement_scores", engagement_scores)
        if len(engagement_scores) > 0:
            jsonPkt = {"engagement_scores": engagement_scores}
            self.mongo_client.update_json(
                str(conv_id), jsonPkt, self.processed_conversation_collection
            )
