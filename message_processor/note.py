"""
.. module:: Note
    :platform: Platform Independent
    :synopsis: This module is for handling all functions for notes 
"""

class Note(object):
    """Client for handling notes"""

    def __init__(self, mongo_client, pkt):
        self.collection = "notes"
        self.data = pkt
        self.mongo_client = mongo_client 
        
    async def process_note(self):
        print('Data saving in db', self.data, flush=True)
        result = await self.mongo_client.insert_json(self.data, self.collection)
        print('inserted_id for record', result.inserted_id, flush=True)
        return result.inserted_id

