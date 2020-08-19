"""
.. module:: QuestionsFinder
    :platform: Platform Independent
    :synopsis: This module is for handling all functions for a transcription 
"""
import sys
import os

sys.path.insert(1, os.path.join(sys.path[0], "..", "nlp_lib"))

from nlp_lib_questions_finder import Questions_finder

question_finder = Questions_finder()


class QuestionsFinder(object):
    """Client for handling notes"""

    def __init__(self, mongo_client):
        self.processed_conversation_collection = "conversations_processed"
        self.collection = "transcriptions"
        self.mongo_client = mongo_client

    def _transformTranscription(self, transcriptions_pkt):
        return transcriptions_pkt["msg"]["data"]["transcription"]["content"]

    def process(self, conv_id):
        # print("inside questions processing code with conversationo id: ", conv_id)

        # Connecct to db
        self.mongo_client.connect()

        conversation_document = self.mongo_client.findOneQueryProcessor(
            self.mongo_client.conv_finder_query_in_result_db(conv_id),
            self.processed_conversation_collection,
        )
        # print("\n***conversation_document: ", conversation_document)

        if conversation_document == None:
            print(f"No matching conversation for conv ID: {conv_id}")
            return

        cursor = self.mongo_client.findQueryProcessor(
            self.mongo_client.conv_finder_query_in_other_db(conv_id), self.collection
        )

        listOfQuestions = []
        for transcriptions_pkt in cursor:
            transcription = self._transformTranscription(transcriptions_pkt)
            interrogativeSentences = question_finder.processMessage(transcription)
            if len(interrogativeSentences) > 0:
                listOfQuestions.extend(interrogativeSentences)

        print("listOfQuestions", listOfQuestions)
        if len(listOfQuestions) > 0:
            jsonPkt = {"questionsAsked": listOfQuestions}
            self.mongo_client.update_json(
                str(conv_id), jsonPkt, self.processed_conversation_collection
            )
