"""
.. module:: InteractionFinder
    :platform: Platform Independent
    :synopsis: This module is for handling all functions for a transcription 
"""

import sys
import os
from typing import NoReturn, Tuple
from colorama import init, Fore

init(init(autoreset=True))

class InteractionFinder(object):
    """[Client for handling notes]

    :param object: [description]
    :type object: [type]
    :return: [description]
    :rtype: [type]
    """

    def __init__(self):
        """[init function]

        """
        self.total_interaction_scores = 120
        self.interaction_window = 240 * 1000  # 60 sec

    def _interaction_duration_in_window(
        self, start_timewindow, end_timewindow, start_time_element, end_time_element
    ):
        end_time = 0
        start_time = 0
        if end_timewindow > end_time_element:
            end_time = end_time_element
        else:
            end_time = end_timewindow

        if start_timewindow < start_time_element:
            start_time = start_time_element
        else:
            start_time = start_timewindow

        duration = end_time - start_time
        # print("duration", duration)
        return duration

    def _get_interaction_in_time_window(
        self, interaction_json: dict, start_timewindow: int, end_timewindow: int
    ) -> dict:
        # print("interaction_json", interaction_json)
        # print("start_timewindow", start_timewindow)
        # print("end_timewindow", end_timewindow)
        interaction_list = []
        speaker_time = dict()
        total_time = 0
        for element in interaction_json:
            if (
                (
                    (element["endTime"] >= start_timewindow)
                    and (element["endTime"] <= end_timewindow)
                )
                or (
                    (element["startTime"] >= start_timewindow)
                    and (element["startTime"] <= end_timewindow)
                )
                or (
                    (element["startTime"] <= start_timewindow)
                    and (element["endTime"] >= end_timewindow)
                )
            ):
                # interaction_list.append(element)
                duration = self._interaction_duration_in_window(
                    start_timewindow,
                    end_timewindow,
                    element["startTime"],
                    element["endTime"],
                )
                total_time += duration
                if element["speakerTag"] not in speaker_time:
                    speaker_time[element["speakerTag"]] = duration
                else:
                    speaker_time[element["speakerTag"]] += duration
            else:
                if element["speakerTag"] not in speaker_time:
                    speaker_time[element["speakerTag"]] = 0

        # print("total_time", total_time)
        for speakerID, time in speaker_time.items():
            speaker_time[speakerID] = (time * 100.0) / total_time

        result_json = dict()
        result_json["speakerID"] = speaker_time
        result_json["end_time"] = end_timewindow
        # print("result_json", result_json)

        return result_json

    def _generate_time_windows(
        self, meeting_start_time: float, meeting_end_time: float
    ) -> list:
        #print("meeting_start_time", meeting_start_time)
        #print("meeting_end_time", meeting_end_time)
        time_window_list = []
        duration_of_each_window = (
            meeting_end_time - meeting_start_time
        ) / self.total_interaction_scores
        #print("duration_of_each_window", duration_of_each_window)
        for idx in range(self.total_interaction_scores):
            if idx == 0:
                element = dict()
                element["startTime"] = meeting_start_time
                element["endTime"] = int(duration_of_each_window)
                time_window_list.append(element)
            else:
                element = dict()
                element["endTime"] = int(
                    time_window_list[-1]["endTime"] + duration_of_each_window
                )
                element["startTime"] = element["endTime"] - self.interaction_window
                if element["startTime"] <= 0:
                    element["startTime"] = 0
                time_window_list.append(element)

        # print("time_window_list", time_window_list)
        return time_window_list

    def processbatch(self, input_json_data: dict, ouptut_json_data:dict):

        """[summary]
        """
        """[Public function for saving engagement]

        :param input_json_data: [description]
        :type dict: [type]
        """

        print(Fore.GREEN + "\n**** Analyzing interaction ****")

        if input_json_data == None:
            print(f"No matching conversation for input_json_data: {input_json_data}")
            return

        start_meeting_time = input_json_data[0]["startTime"]
        end_meeting_time = input_json_data[-1]["endTime"]
        time_windows = self._generate_time_windows(start_meeting_time, end_meeting_time)

        ouptut_json_data["interaction"] = dict()
        ouptut_json_data["interaction"]["interaction_scores_plot"] = []
        ouptut_json_data["interaction"]["interaction_scores_total"] = dict()

        for time_window in time_windows:
            interaction_result = self._get_interaction_in_time_window(
                input_json_data, time_window["startTime"], time_window["endTime"]
            )
            ouptut_json_data["interaction"]["interaction_scores_plot"].append(
                interaction_result
            )

            # print("interactions_list", interactions_list)
        # print()
        interaction_result_total = self._get_interaction_in_time_window(
            input_json_data, start_meeting_time, end_meeting_time
        )
        del interaction_result_total["end_time"]
        ouptut_json_data["interaction"][
            "interaction_scores_total"
        ] = interaction_result_total
