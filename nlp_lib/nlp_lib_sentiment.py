from os import path
import json
from nltk import sent_tokenize
import nltk
import flair


class NLP_lib_sentiment(object):
    def __init__(self):
        self.flair_sentiment = flair.models.TextClassifier.load("en-sentiment")

    def processMessage(self, requestData):
        """ Returns responses as rules along with score """
        sentimentScore = self._getSentiment(requestData)

        return sentimentScore

    def _getSentiment(self, requestData):
        sentences = self._tokenize_sentences(requestData)
        sentences = [x.strip() for x in sentences]

        total_sentiment = 0.0

        for sentence in sentences:
            s = flair.data.Sentence(sentence)
            self.flair_sentiment.predict(s)
            sentiment_sentence = s.labels
            if sentiment_sentence[0].value == "NEGATIVE":
                total_sentiment = total_sentiment - (sentiment_sentence[0].score)
            else:
                total_sentiment = total_sentiment + (sentiment_sentence[0].score)
            
        if len(sentences) > 0:
            avg_sentiment = total_sentiment / len(sentences)
            avg_sentiment = (avg_sentiment + 1.0)/2.0
        else:
            avg_sentiment = 0.5

        return avg_sentiment

    def _tokenize_sentences(self, sentences):
        return sent_tokenize(sentences)
