"""
.. module:: EngagmentFinder
    :platform: Platform Independent
    :synopsis: This module is for handling all functions for a transcription 
"""
import sys
import os

sys.path.insert(1, os.path.join(sys.path[0], '..', 'nlp_lib'))

from nlp_lib_engagement import NLP_lib_engagement
engagement_lib = NLP_lib_engagement()

def timeSortingFunction(tuple):
  return int(tuple[1]["End_time"])

class EngagmentFinder(object):
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
        return transcriptions_pkt["msg"]["data"]["transcription"], transcriptions_pkt["context"]["origin"]

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
            #print("transcriptionTuple",transcriptionTuple)
            print("transcriptionTuple[0]",transcriptionTuple[0])
            print("transcriptionTuple[1]",transcriptionTuple[1])
            end_time = transcriptionTuple[1]["End_time"]
            engagement_score = engagement_lib.processMessage(convid, transcriptionTuple[0], transcriptionTuple[1])
            engagement_with_time = (int(end_time), engagement_score)
            engagement_scores.append(engagement_with_time)

        print("engagement_scores", engagement_scores)
        if len(engagement_scores) > 0:
            jsonPkt = {"engagement_scores": engagement_scores}
            self.mongo_client.update_json(str(convid), jsonPkt, "conversations")
