"""
.. module:: Note
    :platform: Platform Independent
    :synopsis: This module is for handling all functions for notes 
"""

class Note(object):
    """Client for handling notes"""

    def __init__(self, mongo_client):
        self.collection = "notes"
        self.mongo_client = mongo_client

    def save_note(self):
        if self.pkt["msg"]["name"] == "UPDATE":
            result = self.mongo_client.insert_json(self.pkt, self.collection)
            print('inserted_id for record', result.inserted_id, flush=True)
            return result.inserted_id
        elif self.pkt["msg"]["name"] == "DELETE":
            id = self.pkt["msg"]["data"]["note"]["id"]
            result = self.mongo_client.delete_json(id, self.collection)
            return result

    def process(self):
        print("inside notes processing code")
        query = {}
        self.mongo_client.connect()
        cursor = self.mongo_client.findQueryProcessor(query, self.collection)
        for document in cursor:
            print(document)
