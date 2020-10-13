import json
import os
from colorama import init, Fore, Back, Style
from interaction_finder import InteractionFinder

interaction_finder = InteractionFinder()

from questions_finder import QuestionsFinder
questions_finder = QuestionsFinder()

from sentiment_finder import SentimentFinder
sentiment_finder = SentimentFinder()

def _parse_number(input_dict: dict, dict_key: str):
    # print(input_dict, dict_key)
    if dict_key in input_dict:
        return int(input_dict[dict_key])
    else:
        return 0


def _transform_time_stamp(element: dict) -> dict:
    # print("element:", element)
    element["startTime"] = (
        _parse_number(element["startTime"], "seconds") * 1000
        + _parse_number(element["startTime"], "nanos") // 1000000
    )
    element["endTime"] = (
        _parse_number(element["endTime"], "seconds") * 1000
        + _parse_number(element["endTime"], "nanos") // 1000000
    )

    return element


def _join_word_after_sentence(sentence: str, word: str) -> str:
    return sentence + " " + word


def parse_speaker_wise_json(input_json: dict) -> dict:
    speaker_tag_result = input_json[len(input_json) - 1]
    temp = speaker_tag_result["alternatives"][0]["words"]
    consolidated_speaker_tag_list = []
    prev_speaker_tag = -1

    for idx, element in enumerate(temp):
        element = _transform_time_stamp(element)
        currentSpeakerTag = element["speakerTag"]
        if idx == 0:
            if element["startTime"] <= 10:
                consolidated_speaker_tag_list.append(element)
            else:
                silence_element = element.copy()
                silence_element["startTime"] = 0
                silence_element["endTime"] = element["startTime"]
                silence_element["word"] = ""
                silence_element["speakerTag"] = "silence"
                consolidated_speaker_tag_list.append(silence_element)
                consolidated_speaker_tag_list.append(element)

        elif consolidated_speaker_tag_list[-1]["endTime"] == element["startTime"]:
            if currentSpeakerTag != prev_speaker_tag:
                consolidated_speaker_tag_list.append(element)
            else:
                consolidated_speaker_tag_list[-1]["endTime"] = element["endTime"]
                consolidated_speaker_tag_list[-1]["word"] = _join_word_after_sentence(
                    consolidated_speaker_tag_list[-1]["word"], element["word"]
                )
        else:
            # Insert silent and then data
            silence_element = element.copy()
            silence_element["startTime"] = consolidated_speaker_tag_list[-1]["endTime"]
            silence_element["endTime"] = element["startTime"]
            silence_element["word"] = ""
            silence_element["speakerTag"] = "silence"
            consolidated_speaker_tag_list.append(silence_element)
            consolidated_speaker_tag_list.append(element)

        prev_speaker_tag = currentSpeakerTag
    return consolidated_speaker_tag_list


input_json_file_name = "meeting-data/testing/16_Learn_something_new/Learn_Something_New/speaker_wise.json"
input_json_data = None
if os.path.isfile(input_json_file_name):
    with open(input_json_file_name) as f:
        transcription_json = json.load(f)
        # print("input_json_data", input_json_data)
        #transcription_json = parse_speaker_wise_json(input_json_data)
        #interaction_json = interaction_finder.process(result_json)
        result_json = dict()
        interaction_finder.processbatch(transcription_json,result_json)
        questions_finder.processbatch(transcription_json,result_json)
        sentiment_finder.processbatch(transcription_json,result_json)
        print(json.dumps(result_json, indent=6))
        # print("interaction_json", interaction_json)

else:
    print(Fore.RED + f"\n ERROR: Input JSON file seems to be missing")
