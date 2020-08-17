"""
.. module:: QuestionsFinder
    :platform: Platform Independent
    :synopsis: This module is for handling all functions for a transcription 
"""
import sys
import os

sys.path.insert(1, os.path.join(sys.path[0], '..', 'nlp_lib'))

from nlp_lib_questions_finder import Questions_finder
question_finder = Questions_finder()

class QuestionsFinder(object):
    """Client for handling notes"""

    def __init__(self, mongo_client):
        self.collection = "transcriptions"
        self.mongo_client = mongo_client

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
        return transcriptions_pkt["msg"]["data"]["transcription"]["content"]

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

        listOfQuestions = []
        for transcriptions_pkt in cursor:
            transcription = self._transformTranscription(transcriptions_pkt)
            interrogativeSentences = question_finder.processMessage(transcription)
            if len(interrogativeSentences) > 0:
                listOfQuestions.extend(interrogativeSentences)

        print("listOfQuestions", listOfQuestions)
        if len(listOfQuestions) > 0:
            jsonPkt = {"questionsAsked": listOfQuestions}
            self.mongo_client.update_json(str(convid), jsonPkt, "conversations")
