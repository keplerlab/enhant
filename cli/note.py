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

    def __init__(self, mongo_client):
        """[init function]

        :param mongo_client: [description]
        :type mongo_client: [type]
        """
        self.processed_conversation_collection = "conversations_processed"
        self.collection = "notes"
        self.mongo_client = mongo_client

    def _transformNote(self, note_pkt):
        """[transform Note packet]

        :param note_pkt: [description]
        :type note_pkt: [type]
        :return: [description]
        :rtype: [type]
        """
        saved_note = note_pkt["msg"]["data"]["note"]
        saved_note["event_time"] = note_pkt["context"]["event_time"]
        return saved_note

    def process(self, conv_id):
        """[Public function for saving note]

        :param conv_id: [description]
        :type conv_id: [type]
        """
        # print("inside notes processing code with conversationo id: ", conv_id)

        # Connecct to db
        self.mongo_client.connect()
        conversation_document = self.mongo_client.findOneQueryProcessor(
            self.mongo_client.get_search_by_id_query(conv_id),
            self.processed_conversation_collection,
        )
        # print("\n***conversation_document: ", conversation_document)
        if conversation_document == None:
            print(f"No matching conversation for conv ID: {conv_id}")
            return

        cursor = self.mongo_client.findQueryProcessor(
            self.mongo_client.get_search_query_context_conv_id(conv_id), self.collection
        )

        listOfNotes = []
        for note_pkt in cursor:
            # print("note_pkt", note_pkt)
            note = self._transformNote(note_pkt)
            # print("note",note)
            listOfNotes.append(note)

        print("listOfNotes", listOfNotes)
        if len(listOfNotes) > 0:
            jsonPkt = {"notes": listOfNotes}
            self.mongo_client.update_json(
                str(conv_id), jsonPkt, self.processed_conversation_collection
            )
