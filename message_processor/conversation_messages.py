"""
.. module:: Conversation
    :platform: Platform Independent
    :synopsis: This module is for handling all functions for Conversation 
"""

class Conversation(object):
    """Client for handling conversations"""

    def __init__(self, mongo_client, pkt):
        self.conversation_collection = "conversations"
        self.processed_conversation_collection = "conversations_processed"
        self.pkt = pkt
        self.mongo_client = mongo_client
        # Time window for checking whether two conversations with same meeting number 
        # are part of same conversation or not in ms 
        #self.time_window = 120*60*1000 
        self.time_window = 1000

    
    def _process_init_json(self):
        result_json = {
                         "meeting_id": self.pkt["context"]["meeting_id"],
                         "start_time": self.pkt["context"]["event_time"]
                      }
        return result_json


    async def _insert_new_conv(self):
        result_json = self._process_init_json()
        result = await self.mongo_client.insert_json(result_json, self.processed_conversation_collection)
        inserted_conv_id = str(result.inserted_id)
        self.pkt["context"]["conv_id"] = inserted_conv_id
        result = await self.mongo_client.insert_json(self.pkt, self.conversation_collection)

        return inserted_conv_id

    async def _insert_old_conv(self, conv_id):
        inserted_conv_id = str(conv_id)
        self.pkt["context"]["conv_id"] = inserted_conv_id
        result = await self.mongo_client.insert_json(self.pkt, self.conversation_collection)

        return inserted_conv_id

    def _check_record_in_time_window(self, list_db_processed_conv):
        print("inside _check_record_in_time_window list_db_processed_conv:", list_db_processed_conv, flush=True)
        print("Len list_db_processed_conv:", len(list_db_processed_conv), flush=True)
        packet_time = int(self.pkt["context"]["event_time"])

        nearest_conv_time = 0
        nearest_conv = None
        for processed_conv in list_db_processed_conv:
            print("result_conv", processed_conv, flush=True)
            if "end_time" in processed_conv:
                processed_conv_time = int(processed_conv["end_time"])
            else:
                processed_conv_time = int(processed_conv["start_time"])
    
            if (packet_time - nearest_conv_time) > (packet_time - processed_conv_time):
                nearest_conv_time = processed_conv_time
                nearest_conv = processed_conv
            
        #print("nearest_conv_time", nearest_conv_time, flush=True)
        #print("processed_conv_time", processed_conv_time, flush=True)


        
        if (packet_time - nearest_conv_time) <= self.time_window:
            print("Nearest conv", nearest_conv, flush=True)
            print("Nearest conv time", nearest_conv_time, flush=True)
            return nearest_conv
        else:
            print("No nearby conv found", flush=True)
            return None


    async def save_conversation(self):
        if self.pkt["msg"]["name"] == "INIT":
            meeting_id = self.pkt["context"]["meeting_id"]

            query = {"meeting_id": str(meeting_id)}

            list_db_processed_conv = await self.mongo_client.findQueryProcessor(query, self.processed_conversation_collection)
            print("conversation_document", list_db_processed_conv,  flush=True)
            # Add new record in conversation if no result found  
            if len(list_db_processed_conv) <= 0:
                print(f"No matching conversation for meeting ID: {meeting_id} inserting new record",  flush=True)
                inserted_conv_id = await self._insert_new_conv()
                return inserted_conv_id
            else:
                nearest_record = self._check_record_in_time_window(list_db_processed_conv)
                if nearest_record is None:
                    inserted_conv_id = await self._insert_new_conv()
                    return inserted_conv_id
                else:
                    conv_id = nearest_record.get('_id')
                    inserted_conv_id = await self._insert_old_conv(conv_id)
                    return inserted_conv_id

            
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
