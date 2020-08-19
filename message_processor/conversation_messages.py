"""
.. module:: Conversation
    :platform: Platform Independent
    :synopsis: This module is for handling all functions for Conversation 
"""

class Conversation(object):
    """Client for handling notes"""

    def __init__(self, mongo_client, pkt):
        self.conversation_collection = "conversations"
        self.processed_conversation_collection = "conversations_processed"
        self.pkt = pkt
        self.mongo_client = mongo_client

    
    def _process_init_json(self):
        result_json = {
                         "meeting_id": self.pkt["context"]["meeting_id"],
                         "start_time": self.pkt["context"]["event_time"]
                      }
        return result_json

       
    async def _insert_new_conv(self):
        result_json = self._process_init_json()
        print("result_json",result_json,flush=True)
        result = await self.mongo_client.insert_json(result_json, self.processed_conversation_collection)
        inserted_conv_id = str(result.inserted_id)
        print("_id",result)
        print('inserted_id for record', inserted_conv_id, flush=True)
        self.pkt["context"]["conv_id"] = inserted_conv_id
        print("self.pkt", self.pkt, flush=True)
        result = await self.mongo_client.insert_json(self.pkt, self.conversation_collection)

        return inserted_conv_id

        
    async def save_conversation(self):
        if self.pkt["msg"]["name"] == "INIT":
            meeting_id = self.pkt["context"]["meeting_id"]

            query = {"meeting_id": str(meeting_id)}

            list_conversation_documents = await self.mongo_client.findQueryProcessor(query, self.processed_conversation_collection)
            print("conversation_document", list_conversation_documents,  flush=True)
            # Add new record in conversation if no result found  
            if len(list_conversation_documents) <= 0:
                print(f"No matching conversation for meeting ID: {meeting_id} inserting new record",  flush=True)
                inserted_conv_id = await self._insert_new_conv()
                return inserted_conv_id
            else:
                pass
            
        if self.pkt["msg"]["name"] == "END":
            conv_id = self.pkt["context"]["conv_id"]
            query = {"conv_id": str(conv_id)}
            processed_conversation_document = self.mongo_client.findOneQueryProcessor(query, self.processed_conversation_collection)
            processed_conversation_document["end_time"] = self.pkt["context"]["event_time"]
            self.mongo_client.update_json(str(convid), processed_conversation_document, self.processed_conversation_collection)
            result = await self.mongo_client.insert_json(self.pkt, self.collection)
            print('inserted_id for record', result.inserted_id, flush=True)
            return result.inserted_id
        elif self.pkt["msg"]["name"] == "DELETE":
            id = self.pkt["msg"]["data"]["conversation"]["id"]
            result = await self.mongo_client.delete_json(id, self.collection)
            return result
