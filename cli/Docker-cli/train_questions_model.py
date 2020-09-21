
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

def train_model():
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
    pickle.dump(vectorizer, open("/home/model/vectorizer.pickle.dat", "wb"))
    pickle.dump(gb, open("/home/model/gb.pickle.dat", "wb"))
    return vectorizer, gb


train_model()