"""
.. module:: SentimentFinder
    :platform: Platform Independent
    :synopsis: This module is for handling all functions for a transcription 
"""
import sys
import os

sys.path.insert(1, os.path.join(sys.path[0], '..', 'nlp_lib'))

from nlp_lib_sentiment import NLP_lib_sentiment
sentiment_lib = NLP_lib_sentiment()


class SentimentFinder(object):
    """Client for handling notes"""

    def __init__(self, mongo_client):
        self.collection = "transcriptions"
        self.mongo_client = mongo_client
        self.low_sentiment_threshold = 0.3
        self.high_sentiment_threshold = 0.7


    def save_transcription(self):
        if self.pkt["msg"]["name"] == "UPDATE":
            result = self.mongo_client.insert_json(self.pkt, self.collection)
            print('inserted_id for record', result.inserted_id, flush=True)
            return result.inserted_id
        elif self.pkt["msg"]["name"] == "DELETE":
            id = self.pkt["msg"]["data"]["transcription"]["id"]
            result = self.mongo_client.delete_json(id, self.collection)
            return result

    def _transformTranscription(self, transcriptions_pkt):
        return transcriptions_pkt["msg"]["data"]["transcription"]["content"] , transcriptions_pkt["msg"]["data"]["transcription"]["Start_time"]

    def process(self, convid):
        #print("inside questions processing code with conversationo id: ", convid)

        # Connecct to db
        self.mongo_client.connect()
        query = {"conversation_id": str(convid)} 
        conversation_document = self.mongo_client.findOneQueryProcessor(query, "conversations")
        #print("\n***conversation_document: ", conversation_document)
        if conversation_document == None:
            print(f"No matching conversation for conv ID: {convid}")
            return
        query = {"context.conversation_id": str(convid)}
        cursor = self.mongo_client.findQueryProcessor(query, self.collection)

        low_sentiment_scores = []
        high_sentiment_scores = []
        for transcriptions_pkt in cursor:
            transcription, start_time = self._transformTranscription(transcriptions_pkt)
            sentiment_score = sentiment_lib.processMessage(transcription)
            sentiment_with_time = (start_time, transcription, sentiment_score)
            if sentiment_score < self.low_sentiment_threshold:
                low_sentiment_scores.append(sentiment_with_time)
            elif sentiment_score > self.high_sentiment_threshold:
                high_sentiment_scores.append(sentiment_with_time)

        print("high_sentiment_scores", high_sentiment_scores)
        print("low_sentiment_scores", low_sentiment_scores)

        if len(high_sentiment_scores) > 0:
            jsonPkt = {"highSentimentSentence": high_sentiment_scores}
            self.mongo_client.update_json(str(convid), jsonPkt, "conversations")
        if len(low_sentiment_scores) > 0:
            jsonPkt = {"lowSentimentSentence": low_sentiment_scores}
            self.mongo_client.update_json(str(convid), jsonPkt, "conversations")
