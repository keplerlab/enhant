from os import path
import json

from sklearn.cluster import AgglomerativeClustering, KMeans
from nltk.corpus import stopwords
from keras.preprocessing.text import Tokenizer
from keras.preprocessing.sequence import pad_sequences
import re
import Levenshtein as lev
import scipy.spatial
from nltk import sent_tokenize
import pickle
from pathlib import Path

import tensorflow as tf
import tensorflow_hub as hub

import numpy as np
import os
import re


class TF_ULM(object):

    def __init__(self, advisor_rules, customer_rules):
        self.client_rules_vec_pickle_file = "data/client_rules_vec_pickle.pickle"
        self.advisor_rules_vec_pickle_file = "data/advisor_rules_vec_pickle.pickle"
        # self.model_file_path = "data/tf_ulm_model"
        # In linux uncomment next line
        self.model_file_path = "https://tfhub.dev/google/universal-sentence-encoder/4"

        self.advisor_rules = advisor_rules
        self.customer_rules = customer_rules
        self.embeded_model = self._load_model()
        self.master_utterances_advisor_vec = self._initialise_rules(
            advisor_rules, self.advisor_rules_vec_pickle_file
        )
        self.master_utterances_client_vec = self._initialise_rules(
            customer_rules, self.client_rules_vec_pickle_file
        )

    def _load_model(self):
        embeded_model = hub.load(self.model_file_path)
        return embeded_model

    def _initialise_rules(self, rules, rules_vec_pickle_file):

        master_utterances = {}
        master_utterances_vec = {}
        if not os.path.isfile(rules_vec_pickle_file):
            print("Generating New Master Rules utterances vectors pickle")
            for key in rules:
                master_utterances[key] = rules[key]["MATCHING_UTTERANCES"]
                master_utterances[key] = [x.lower() for x in master_utterances[key]]
                master_utterances_vec[key] = self.embeded_model(master_utterances[key])

            with open(rules_vec_pickle_file, "wb") as handle:
                pickle.dump(
                    master_utterances_vec, handle, protocol=pickle.HIGHEST_PROTOCOL
                )
        else:
            print("Load Master Rules utterances vectors from Pickle")
            with open(rules_vec_pickle_file, "rb") as handle:
                master_utterances_vec = pickle.load(handle)

        return master_utterances_vec

    def _tokenize_sentences(self, sentences):
        return sent_tokenize(sentences)

    def get_responses(self, data, rules, speaker):

        data_rules_score = {}

        data_rules_score = {}
        for key in rules:
            data_rules_score[key] = 0

        sentences = self._tokenize_sentences(data)
        if len(sentences) > 0:
            sentences_list = [x.lower() for x in sentences]
            sentences_vectors = self.embeded_model(sentences_list)
        else:
            sentences_vectors = []

        for idx, sentence_vec in enumerate(sentences_vectors):
            for key in rules:
                best_score = data_rules_score.get(key, 0)

                if speaker == "advisor":
                    distances = scipy.spatial.distance.cdist(
                        [sentence_vec],
                        self.master_utterances_advisor_vec[key],
                        "cosine",
                    )[0]
                elif speaker == "client":
                    distances = scipy.spatial.distance.cdist(
                        [sentence_vec],
                        self.master_utterances_client_vec[key],
                        "cosine",
                    )[0]
                else:
                    raise RuntimeError("RuntimeError: Unsupported speaker: " + speaker)

                results = zip(range(len(distances)), distances)
                results = sorted(results, key=lambda x: x[1])

                # Compare with master utterances
                for distance in distances:
                    score = (1.0 - distance) * 100
                    if best_score < score:
                        best_score = score

                current_key_score = data_rules_score.get(key, 0)
                # If a new sentence increases the score then
                # data_rules_score needs to be updated.
                if best_score > current_key_score:
                    data_rules_score[key] = best_score


        return data_rules_score

    def filter_responses(self):
        threshold = self._get_threshold()

    def _get_threshold(self):
        return 55
