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

    def _transformTranscription(self, transcriptions_pkt):
        """[transform transcription packet]

        :param transcriptions_pkt: [description]
        :type transcriptions_pkt: [type]
        :return: [description]
        :rtype: [type]
        """
        return transcriptions_pkt["msg"]["data"]["transcription"]["content"]

    def process(self, conv_id):
        """[Public function for extracting and saving questions]

        :param conv_id: [description]
        :type conv_id: [type]
        """
        # print("inside questions processing code with conversationo id: ", conv_id)

        # print("\n***conversation_document: ", conversation_document)

        if conversation_document == None:
            print(f"No matching conversation for conv ID: {conv_id}")
            return


        listOfQuestions = []
        for transcriptions_pkt in cursor:
            transcription = self._transformTranscription(transcriptions_pkt)
            interrogativeSentences = question_finder.processMessage(transcription)
            if len(interrogativeSentences) > 0:
                listOfQuestions.extend(interrogativeSentences)

        print("listOfQuestions", listOfQuestions)
        if len(listOfQuestions) > 0:
            jsonPkt = {"questionsAsked": listOfQuestions}

