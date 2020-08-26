"""
.. module:: Conversation
    :platform: Platform Independent
    :synopsis: This module is for handling all functions for Conversation 
"""


class Conversation(object):
    """[Client for handling conversations]

    :param object: [description]
    :type object: [type]
    :return: [description]
    :rtype: [type]
    """    

    def __init__(self, mongo_client, pkt):
        """[init function for class]

        :param mongo_client: [description]
        :type mongo_client: [type]
        :param pkt: [description]
        :type pkt: [type]
        """        
        self.conversation_collection = "conversations"
        self.processed_conversation_collection = "conversations_processed"
        self.pkt = pkt
        self.mongo_client = mongo_client
        # Time window for checking whether two conversations with same meeting number
        # are part of same conversation or not in ms
        # Default value = 2 hours
        self.time_window = 120 * 60 * 1000
        # self.time_window = 1000

    def _process_init_json(self):
        """[internal function for generating result after
         receiving init request json]

        :return: [description]
        :rtype: [type]
        """
        result_json = {
            "meeting_id": self.pkt["context"]["meeting_id"],
            "start_time": self.pkt["context"]["event_time"],
        }
        return result_json

    def _process_end_json(self):
        """[internal function for generating result after
         receiving END request json]

        :return: [description]
        :rtype: [type]
        """
        result_json = {
            "meeting_id": self.pkt["context"]["meeting_id"],
            "end_time": self.pkt["context"]["event_time"],
        }
        return result_json

    async def _insert_new_conv(self):
        """[This function inserts new conversation into db]

        :return: [description]
        :rtype: [type]
        """
        result_json = self._process_init_json()
        result = await self.mongo_client.insert_json(
            result_json, self.processed_conversation_collection
        )
        inserted_conv_id = str(result.inserted_id)
        self.pkt["context"]["conv_id"] = inserted_conv_id
        result = await self.mongo_client.insert_json(
            self.pkt, self.conversation_collection
        )

        return inserted_conv_id

    async def _insert_old_conv(self, conv_id):
        """[This function updates older conversation into db]

        :param conv_id: [description]
        :type conv_id: [type]
        :return: [description]
        :rtype: [type]
        """
        inserted_conv_id = str(conv_id)
        self.pkt["context"]["conv_id"] = inserted_conv_id
        result = await self.mongo_client.insert_json(
            self.pkt, self.conversation_collection
        )

        return inserted_conv_id

    async def _update_end_conv(self, conv_id):
        """[This function updates end time for existing conversation into db]

        :param conv_id: [description]
        :type conv_id: [type]
        :return: [description]
        :rtype: [type]
        """
        result_json = self._process_end_json()

        result = await self.mongo_client.update_json(
            conv_id, result_json, self.processed_conversation_collection
        )

        self.pkt["context"]["conv_id"] = inserted_conv_id
        result = await self.mongo_client.insert_json(
            self.pkt, self.conversation_collection
        )

        return inserted_conv_id

    def _check_record_in_time_window(self, list_db_processed_conv):
        """[Check which conversations are inside time window]

        :param list_db_processed_conv: [description]
        :type list_db_processed_conv: [type]
        :return: [description]
        :rtype: [type]
        """
        packet_time = int(self.pkt["context"]["event_time"])
        nearest_conv_time = 0
        nearest_conv = None
        for processed_conv in list_db_processed_conv:
            if "end_time" in processed_conv:
                processed_conv_time = int(processed_conv["end_time"])
            else:
                processed_conv_time = int(processed_conv["start_time"])

            if (packet_time - nearest_conv_time) > (packet_time - processed_conv_time):
                nearest_conv_time = processed_conv_time
                nearest_conv = processed_conv

        if (packet_time - nearest_conv_time) <= self.time_window:
            print("Nearest conv", nearest_conv, " time:", nearest_conv_time, flush=True)
            return nearest_conv
        else:
            print("No nearby conv found", flush=True)
            return None

    async def save_conversation(self):
        """[Main public function for saving conversation]

        :return: [description]
        :rtype: [type]
        """
        if self.pkt["msg"]["name"] == "INIT":
            meeting_id = self.pkt["context"]["meeting_id"]

            query = {"meeting_id": str(meeting_id)}

            list_db_processed_conv = await self.mongo_client.findQueryProcessor(
                query, self.processed_conversation_collection
            )
            # Add new record in conversation if no result found
            if len(list_db_processed_conv) <= 0:
                print(
                    f"No matching conversation for meeting ID: {meeting_id} inserting new record",
                    flush=True,
                )
                inserted_conv_id = await self._insert_new_conv()
                return inserted_conv_id
            else:
                nearest_record = self._check_record_in_time_window(
                    list_db_processed_conv
                )
                if nearest_record is None:
                    print(
                        f"matching records not in window meeting ID: {meeting_id} inserting new record",
                        flush=True,
                    )
                    inserted_conv_id = await self._insert_new_conv()
                    return inserted_conv_id
                else:
                    conv_id = nearest_record.get("_id")
                    print(
                        f"matching conversation found with conv ID: {conv_id} reusing same record",
                        flush=True,
                    )
                    inserted_conv_id = await self._insert_old_conv(conv_id)
                    return inserted_conv_id

        elif self.pkt["msg"]["name"] == "END":
            conv_id = self.pkt["context"]["conv_id"]
            result_json = {}
            result_json["end_time"] = self.pkt["context"]["event_time"]
            result = await self.mongo_client.update_json(
                str(conv_id), result_json, self.processed_conversation_collection
            )
            print("result", result)
            result = await self.mongo_client.insert_json(
                self.pkt, self.conversation_collection
            )
            print("inserted_id for record", result.inserted_id, flush=True)
            return result.inserted_id

        elif self.pkt["msg"]["name"] == "DELETE":
            id = self.pkt["context"]["conv_id"]
            result = await self.mongo_client.delete_json(
                id, self.processed_conversation_collection
            )
            return result