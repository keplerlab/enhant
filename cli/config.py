from pydantic import BaseSettings
from questions_finder import QuestionsFinder
from sentiment_finder import SentimentFinder
from engagment_finder import EngagmentFinder


class Settings(BaseSettings):
    def get_data_analyzers() -> list:
        """
        Returns the list of analyzers.
        """
        # Add or remove analyzers here. All the analyzers will update the conversation JSON
        return [
            QuestionsFinder(),
            SentimentFinder(),
            EngagmentFinder(),
        ]

    data_analyzers: list = get_data_analyzers()
    punct_correction_tool: str = "fastpunct"
    # punct_correction_tool: str = "punctuator"


settings = Settings()
