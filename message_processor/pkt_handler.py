
from os import path

def extract_data_from_msg(msg):
    return msg["data"]


def isRequestValid(pkt):
    if ("msg" in pkt) and ("context" in pkt):
        return True
    else:
        return False


def prepare_response(pkt , is_ok):
    if is_ok: 
        response_pkt = pkt
        response_pkt["response"] = {"name": pkt["msg"]["name"], "status": True}
        return response_pkt
    else:
        response_pkt = pkt
        response_pkt["response"] = {"name": pkt["msg"]["name"], "status": False}
        return response_pkt

