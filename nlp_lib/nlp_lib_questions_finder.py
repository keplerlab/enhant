from os import path
import json
from nltk import sent_tokenize
import nltk


class Questions_finder(object):
    def __init__(self):
        nltk.download("nps_chat")
        posts = nltk.corpus.nps_chat.xml_posts()[:10000]
        featuresets = [
            (self._dialogue_act_features(post.text), post.get("class"))
            for post in posts
        ]
        size = int(len(featuresets) * 0.1)
        train_set, test_set = featuresets[size:], featuresets[:size]

        self.classifier = nltk.NaiveBayesClassifier.train(train_set)
        print("Question Answer classifer model ready for inference")

    def _dialogue_act_features(self, post):
        features = {}
        for word in nltk.word_tokenize(post):
            features["contains({})".format(word.lower())] = True
        return features

    def processMessage(self, requestData):
        """ Returns responses as rules along with score """
        interrogativeSentences = self._extract_questions(requestData)

        return interrogativeSentences

    def _extract_questions(self, requestData):
        sentences = self._tokenize_sentences(requestData)
        sentences = [x.strip() for x in sentences]
        questions = []
        for sentence in sentences:
            sentenceClass = self.classifier.classify(
                self._dialogue_act_features(sentence)
            )
            if (
                sentence.endswith("?")
                or sentenceClass == "whQuestion"
                or sentenceClass == "ynQuestion"
            ):
                questions.append(sentence)
        return questions

    def _tokenize_sentences(self, sentences):
        return sent_tokenize(sentences)
