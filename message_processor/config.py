"""
.. module:: Config
    :platform: Platform Independent
    :synopsis: This module has commonly used config parameters
"""

import os


class Config:
    def __init__(self):

        os.environ["PYTHONUNBUFFERED"] = "1"

        # mongo db parameters
        self.mongodb_hostname: str = "mongo"
        self.mongodb_port: int = 27018
        self.mongodb_dbname: str = "enhant_db"
