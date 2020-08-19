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

    def _transformNote(self, note_pkt):
        return note_pkt["msg"]["data"]["note"]


    def process(self, convid):
        #print("inside notes processing code with conversationo id: ", convid)

        # Connecct to db
        self.mongo_client.connect()
        query = {"conv_id": str(convid)} 
        conversation_document = self.mongo_client.findOneQueryProcessor(query, "conversations")
        #print("\n***conversation_document: ", conversation_document)
        if conversation_document == None:
            print(f"No matching conversation for conv ID: {convid}")
            return
        query = {"context.conv_id": str(convid)}
        cursor = self.mongo_client.findQueryProcessor(query, self.collection)

        listOfNotes = []
        for note_pkt in cursor:
            #print("note_pkt", note_pkt)
            note = self._transformNote(note_pkt)
            #print("note",note)
            listOfNotes.append(note)

        print("listOfNotes",listOfNotes)
        if len(listOfNotes) > 0:
            jsonPkt = {"notes": listOfNotes}
            self.mongo_client.update_json(str(convid), jsonPkt, "conversations")

