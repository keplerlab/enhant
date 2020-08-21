"""
.. module:: Note
    :platform: Platform Independent
    :synopsis: This module is for handling all functions for notes 
"""


class Note(object):
    """[Client for handling notes]

    :param object: [description]
    :type object: [type]
    :return: [description]
    :rtype: [type]
    """    

    def __init__(self, mongo_client, pkt):
        """[init function]

        :param mongo_client: [description]
        :type mongo_client: [type]
        :param pkt: [description]
        :type pkt: [type]
        """
        self.collection = "notes"
        self.pkt = pkt
        self.mongo_client = mongo_client

    async def process_note(self):
        """[Save note in db]

        :return: [description]
        :rtype: [type]
        """
        if self.pkt["msg"]["name"] == "ADD":
            result = await self.mongo_client.insert_json(self.pkt, self.collection)
            print("inserted_id for record", result.inserted_id, flush=True)
            return result.inserted_id
        elif self.pkt["msg"]["name"] == "DELETE":
            id = self.pkt["msg"]["data"]["note"]["id"]
            result = await self.mongo_client.delete_json(id, self.collection)
            return result
