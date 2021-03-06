"""
.. module:: QuestionsFinder
    :platform: Platform Independent
    :synopsis: This module is for handling all functions for a transcription 
"""
import sys
import os
from typing import NoReturn, Tuple, Dict
from colorama import init, Fore

from nltk.tokenize import RegexpTokenizer


init(init(autoreset=True))

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
        self.tokenizer = RegexpTokenizer(r'\w+')

    def _check_if_junk(self, input_sentence: str) -> bool:
        
        tokens = self.tokenizer.tokenize(input_sentence)
        if len(tokens) <= 4:
            return True
        else:
            return False

    def _transformTranscription(self, transcriptions_pkt: dict) -> Dict:
        """[transform transcription packet]

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
        """[Public function for saving engagement]

        :param conv_id: [description]
        :type conv_id: [type]
        """

        print(Fore.GREEN + "\n**** Analyzing Questions ****")
        if input_json_data == None:
            print(f"No matching conversation for input_json_data: {input_json_data}")
            return
        conv_id = input_json_data["meeting_id"]

        listOfQuestions = []
        if guest_transcription_list is not None:
            for transcriptions_pkt in guest_transcription_list:
                transcription, start_time = self._transformTranscription(
                    transcriptions_pkt
                )
                interrogativeSentences = question_finder.processMessage(transcription)
                if len(interrogativeSentences) > 0:
                    for interrogativeSentence in interrogativeSentences:
                        originKey = dict()
                        originKey["origin"] = "guest"
                        originKey["time"] = start_time
                        originKey["question"] = interrogativeSentence
                        listOfQuestions.append(originKey)

        if host_transcription_list is not None:
            for transcriptions_pkt in host_transcription_list:
                transcription, start_time = self._transformTranscription(
                    transcriptions_pkt
                )
                interrogativeSentences = question_finder.processMessage(transcription)
                if len(interrogativeSentences) > 0:
                    for interrogativeSentence in interrogativeSentences:
                        originKey = dict()
                        originKey["origin"] = "host"
                        originKey["time"] = start_time
                        originKey["question"] = interrogativeSentence
                        listOfQuestions.append(originKey)

        if len(listOfQuestions) > 0:
            # jsonPkt = {"questionsAsked": listOfQuestions}
            input_json_data["questionsAsked"] = listOfQuestions


    def processbatch(
        self,
        input_json_data: dict,
        output_json_data: dict,

    ) -> NoReturn:
        """[Public function for saving engagement]

        :param conv_id: [description]
        :type conv_id: [type]
        """

        print(Fore.GREEN + "\n**** Analyzing Questions ****")
        if input_json_data == None:
            print(f"No matching conversation for input_json_data: {input_json_data}")
            return

        listOfQuestions = []
        #print("\n\ninput_json_data", input_json_data)
        #print("\noutput_json_data", output_json_data)

        if input_json_data is not None:
            for transcriptions_pkt in input_json_data:
                #print("transcriptions_pkt", transcriptions_pkt)
                transcription, start_time, speakerTag = self._transformTranscriptionbatch(
                    transcriptions_pkt
                )
                interrogativeSentences = question_finder.processMessage(transcription)
                if len(interrogativeSentences) > 0:
                    for interrogativeSentence in interrogativeSentences:
                        if not self._check_if_junk(interrogativeSentence):
                            originKey = dict()
                            originKey["origin"] = speakerTag
                            originKey["time"] = start_time
                            originKey["question"] = interrogativeSentence
                            listOfQuestions.append(originKey)


        if len(listOfQuestions) > 0:
            # jsonPkt = {"questionsAsked": listOfQuestions}
            output_json_data["questionsAsked"] = listOfQuestions
