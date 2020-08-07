
from os import path


def extract_data_from_msg(pkt):
    return pkt["msg"]["data"]


def isRequestValid(pkt):
    if ("msg" in pkt) and ("context" in pkt):
        return True
    else:
        return False


def prepare_response(pkt , is_ok, inserted_record_id):
    if is_ok: 
        response_pkt = pkt
        response_pkt["response"] = {"name": pkt["msg"]["name"], "status": True, "id": str(inserted_record_id)}
        return response_pkt
    else:
        response_pkt = pkt
        response_pkt["response"] = {"name": pkt["msg"]["name"], "status": False}
        return response_pkt

