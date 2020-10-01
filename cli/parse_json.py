
import json
import os

def _parse_number(input_dict: dict, dict_key: str):
    if dict_key in input_dict:
        return int(input_dict[dict_key])
    else:
        return 0 

def _transform_time_stamp(element: dict) -> dict:
    element["startTime"] = _parse_number(element["startTime"], "seconds")*1000 + _parse_number(element["startTime"], "nanos")//1000000 
    element["endTime"] = _parse_number(element["endTime"], "seconds")*1000 + _parse_number(element["endTime"], "nanos")//1000000 
    
    return element

def _join_word_after_sentence(sentence: str, word: str) -> str:
    return sentence + " " + word

def parse_speaker_wise_json(input_json: dict) -> dict :
    speaker_tag_result = input_json[len(input_json) - 1 ]
    temp = speaker_tag_result["alternatives"][0]["words"]
    consolidated_speaker_tag_list = []
    prev_speaker_tag = -1
    for element in temp:
        element = _transform_time_stamp(element)
        currentSpeakerTag = element["speakerTag"]
        if currentSpeakerTag != prev_speaker_tag:
            consolidated_speaker_tag_list.append(element)
        else:
            consolidated_speaker_tag_list[-1]["endTime"] = element["endTime"]
            consolidated_speaker_tag_list[-1]["word"] = _join_word_after_sentence(consolidated_speaker_tag_list[-1]["word"], element["word"])
        prev_speaker_tag = currentSpeakerTag
    return consolidated_speaker_tag_list


input_json_file_name = "meeting-data/testing/12/02-call-resedule/speaker_wise.json"
input_json_data = None
if os.path.isfile(input_json_file_name):
    with open(input_json_file_name) as f:
        input_json_data = json.load(f)
        result_json = parse_speaker_wise_json(input_json_data)
else:
    print(Fore.RED + f"\n ERROR: Input JSON file seems to be missing")

