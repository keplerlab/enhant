"""
.. module:: Transcription
    :platform: Platform Independent
    :synopsis: This module is for handling all functions for a transcription 
"""

class Transcription(object):
    """Client for handling notes"""

    def __init__(self, mongo_client, pkt):
        self.collection = "transcriptions"
        self.pkt = pkt
        self.mongo_client = mongo_client 
        
    async def process_transcription(self):
        if self.pkt["msg"]["name"] == "UPDATE":
            result = await self.mongo_client.insert_json(self.pkt, self.collection)
            print('inserted_id for record', result.inserted_id, flush=True)
            return result.inserted_id
        elif self.pkt["msg"]["name"] == "DELETE":
            id = self.pkt["msg"]["data"]["transcription"]["id"]
            result = await self.mongo_client.delete_json(id, self.collection)
            return result