"""
.. module:: Questions_finder
    :platform: Platform Independent
    :synopsis: This module is for extracting interrogative sentences (Questions) from given text 
"""

from os import path
import json
from nltk import sent_tokenize
import nltk

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import classification_report
import pickle
import os

class Questions_finder(object):
    """Class for extracting interrogative sentences (Questions) from given text

    :param object: [description]
    :type object: [type]
    """

    def __init__(self):
        """init class
        """
        # # Uncomment next line if nps_chat dataset already not downloaded
        # nltk.download("nps_chat")
        self.vectorizer, self.gb = self._load_model()
        self.gb.predict(self.vectorizer.transform(['new sentence here']))

    def _load_model(self):

        vectorizer_pickle_file = "/home/model/vectorizer.pickle.dat"
        gb_pickle_file = "/home/model/gb.pickle.dat"

        if not os.path.isfile(gb_pickle_file):
            #print("Did not find pre trained gradient model, generating new one")
            vectorizer, gb = self._train_model()
        else:
            #print("Load pre trained gradient model from Pickle")
            with open(gb_pickle_file, "rb") as handle:
                gb = pickle.load(handle)

            with open(vectorizer_pickle_file, "rb") as handle:
                vectorizer = pickle.load(handle)

        return vectorizer, gb
                

    def _train_model(self):
        posts = nltk.corpus.nps_chat.xml_posts()[:10000]
        posts_text = [post.text for post in posts]

        #divide train and test in 80 20
        train_text = posts_text[:int(len(posts_text)*0.8)]
        test_text = posts_text[int(len(posts_text)*0.2):]

        #Get TFIDF features
        vectorizer = TfidfVectorizer(ngram_range=(1,3),min_df=0.001,max_df=0.7,analyzer='word')

        X_train = vectorizer.fit_transform(train_text)
        X_test = vectorizer.transform(test_text)

        y = [post.get('class') for post in posts]

        y_train = y[:int(len(posts_text)*0.8)]
        y_test = y[int(len(posts_text)*0.2):]

        # Fitting Gradient Boosting classifier to the Training set
        gb = GradientBoostingClassifier(n_estimators = 400, random_state=0)
        #Can be improved with Cross Validation

        gb.fit(X_train, y_train)
        predictions_rf = gb.predict(X_test)

        print(classification_report(y_test, predictions_rf))
        pickle.dump(vectorizer, open("vectorizer.pickle.dat", "wb"))
        pickle.dump(gb, open("gb.pickle.dat", "wb"))
        return vectorizer, gb


    def _dialogue_act_features(self, post: list) -> dict:
        """tokenize and convert to lower case posts

        :param post: [description]
        :type post: list
        :return: [description]
        :rtype: dict
        """
        features = {}
        for word in nltk.word_tokenize(post):
            features["contains({})".format(word.lower())] = True
        return features

    def processMessage(self, requestData: dict) -> list:
        """Main public function, Returns responses as rules along with score

        :param requestData: [description]
        :type requestData: dict
        :return: [description]
        :rtype: list
        """
        interrogativeSentences = self._extract_questions(requestData)

        return interrogativeSentences

    def _extract_questions(self, requestData: dict) -> list:
        """Function for classifying data into question or not

        :param requestData: [description]
        :type requestData: dict
        :return: [description]
        :rtype: list
        """
        sentences = self._tokenize_sentences(requestData)
        sentences = [x.strip() for x in sentences]
        questions = []
        for sentence in sentences:
            sentenceClass = self.gb.predict(self.vectorizer.transform([sentence]))
            if sentence.endswith("?") or sentenceClass == "whQuestion" or sentenceClass == "ynQuestion" :
                questions.append(sentence)
        return questions

    def _tokenize_sentences(self, sentences: list) -> list:
        """Call nltk sentence tokenizer

        :param sentences: [description]
        :type sentences: list
        :return: [description]
        :rtype: list
        """
        return sent_tokenize(sentences)
