from pydantic import BaseSettings
from note import Note
from questions_finder import QuestionsFinder
from sentiment_finder import SentimentFinder
from engagment_finder import EngagmentFinder

class Settings(BaseSettings):

    def get_data_analyers():
        """
        Returns the list of analyzers.
        """
        # Add or remove analyzers here. All the analyzers will update the conversation JSON
        return [
            #Note(),
            QuestionsFinder(),
            SentimentFinder(),
            EngagmentFinder(),
        ]

    data_analyzers: list = get_data_analyers()


settings = Settings()
