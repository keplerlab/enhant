
from os import path

def extract_data_from_msg(msg):
    return msg["data"]


def isRequestValid(pkt):
    if ("msg" in pkt) and ("context" in pkt):
        return True
    else:
        return False


def prepare_response(status=None, response=None):
    if status == 200:
        print(response)
        return json.dumps(response), status, {"ContentType": "application/json"}
    else:
        return json.dumps(response), status, {"ContentType": "application/json"}
