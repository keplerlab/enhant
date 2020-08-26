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

    def __init__(self):
        """[init function]

        """
        self.processed_conversation_collection = "conversations_processed"
        self.collection = "notes"

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


        # print("\n***conversation_document: ", conversation_document)
        if conversation_document == None:
            print(f"No matching conversation for conv ID: {conv_id}")
            return

        listOfNotes = []
        for note_pkt in cursor:
            # print("note_pkt", note_pkt)
            note = self._transformNote(note_pkt)
            # print("note",note)
            listOfNotes.append(note)

        print("listOfNotes", listOfNotes)
        if len(listOfNotes) > 0:
            jsonPkt = {"notes": listOfNotes}

