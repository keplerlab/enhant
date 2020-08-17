from fuzzywuzzy import fuzz
from os import path
import json
from nltk import sent_tokenize


class FuzzyWuzzy(object):

    PARTIAL_RATIO = 0
    TOKENSET = 1

    def __init__(self, data, algotype, rules):
        self.request_data = data
        self.responses = ""
        self.rules = rules
        self.algotype = algotype

    def get_responses(self):
        """ Returns responses as rules along with score """
        data_rules_score = {}
        if self.algotype == self.TOKENSET:
            data_rules_score = self._get_rules_score_tokenset()
        else:
            data_rules_score = self._get_rules_score_partial_ratio()

        return data_rules_score

    def _tokenize_sentences(self, sentences):
        return sent_tokenize(sentences)

    def _get_rules_score_partial_ratio(self):

        data_rules_score = {}

        # Each data can have multiple sentences.
        sentences = self._tokenize_sentences(self.request_data)

        for sentence in sentences:

            # Get all the utterances for a key
            for key in self.rules:
                master_uttrances = self.rules[key]["MATCHING_UTTERANCES"]
                best_score = data_rules_score.get(key, 0)

                for uttrance in master_uttrances:
                    ratio = fuzz.partial_ratio(self.request_data, uttrance)

                    if best_score < ratio:
                        best_score = ratio

                current_key_score = data_rules_score.get(key, 0)

                if best_score > current_key_score:
                    data_rules_score[key] = best_score

        return data_rules_score

    def _get_rules_score_tokenset(self):

        data_rules_score = {}
        sentences = self._tokenize_sentences(self.request_data)

        for sentence in sentences:

            for key in self.rules:
                master_uttrances = self.rules[key]["MATCHING_UTTERANCES"]
                best_score = data_rules_score.get(key, 0)

                for uttrance in master_uttrances:
                    ratio = fuzz.token_set_ratio(self.request_data, uttrance)

                    if best_score < ratio:
                        best_score = ratio

                current_key_score = data_rules_score.get(key, 0)

                if best_score > current_key_score:
                    data_rules_score[key] = best_score

        return data_rules_score

    def _filter_responses(self):
        filter_rules = []
        for key, value in self.rules_scores.items():
            if value > 75:  # Threshold for filtering
                
                filter_rules.append(key)
        return filter_rules

    def _get_threshold_partial_ratio(self):
        return 75

    def _get_threshold_tokenset(self):
        return 80
