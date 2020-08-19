from os import path
import bson


def extract_data_from_msg(pkt):
    return pkt["msg"]["data"]


def create_error_msg(error_msg):
    statusJson = {"code": "FAILURE", "message": error_msg}
    return statusJson


def create_success_msg():
    statusJson = {"code": "SUCCESS","message": "OK"}
    return statusJson


def isRequestValid(pkt):
    if ("msg" not in pkt):
        error_msg = "msg field missing"
        print(error_msg, flush=True)
        status_pkt = create_error_msg(error_msg)
        return False, status_pkt

    if ("context" not in pkt):
        error_msg = "context field missing"
        print(error_msg, flush=True)
        status_pkt = create_error_msg(error_msg)
        return False, status_pkt

    if ("origin" not in pkt["context"]):
        error_msg = "origin field missing"
        print(error_msg, flush=True)
        status_pkt = create_error_msg(error_msg)
        return False, status_pkt

    if ("meeting_id" not in pkt["context"]):
        error_msg = "meeting_id field missing"
        print(error_msg, flush=True)
        status_pkt = create_error_msg(error_msg)
        return False, status_pkt

    if ("event_time" not in pkt["context"]):
        error_msg = "event_time field missing"
        print(error_msg, flush=True)
        status_pkt = create_error_msg(error_msg)
        return False, status_pkt

    if ("name" not in pkt["msg"]):
        error_msg = "msg.name field missing"
        print(error_msg, flush=True)
        status_pkt = create_error_msg(error_msg)
        return False, status_pkt

    if ("type" not in pkt["msg"]):
        error_msg = "msg.type field missing"
        print(error_msg, flush=True)
        status_pkt = create_error_msg(error_msg)
        return False, status_pkt

    if ("desc" not in pkt["msg"]):
        error_msg = "desc field missing"
        print("desc field missing", flush=True)
        status_pkt = create_error_msg(error_msg)
        return False, status_pkt

    if ("data" not in pkt["msg"]):
        error_msg = "msg.data field missing"
        print(error_msg, flush=True)
        status_pkt = create_error_msg(error_msg)
        return False, status_pkt

    if ("version" not in pkt["msg"]):
        error_msg = "msg.version field missing"
        print(error_msg, flush=True)
        status_pkt = create_error_msg(error_msg)
        return False, status_pkt

    if (pkt["context"]["origin"] != "host" and pkt["context"]["origin"] != "guest"):
        error_msg = "context.origin is neither guest or host"
        print(error_msg, flush=True)
        status_pkt = create_error_msg(error_msg)
        return False, status_pkt

    if (pkt["msg"]["name"] != "INIT" and pkt["msg"]["name"] != "END" and pkt["msg"]["name"] != "ADD" and pkt["msg"]["name"] != "DELETE"):
        error_msg = "msg.name is not among values: INIT, ADD, END, DELETE"
        print(error_msg, flush=True)
        status_pkt = create_error_msg(error_msg)
        return False, status_pkt

    if pkt["msg"]["name"] != "INIT" and not bson.objectid.ObjectId.is_valid(pkt["context"]["conv_id"]):
        error_msg = "Invalid conv_id send valid conv_id field"
        print(error_msg, flush=True)
        status_pkt = create_error_msg(error_msg)
        return False, status_pkt

    status_pkt = create_success_msg()
    return True, status_pkt


def prepare_response(pkt, is_ok, statusPkt, inserted_record_id=0):
    print("statusPkt", statusPkt, flush=True)
    if is_ok:
        response_pkt = pkt
        response_pkt["response"] = {
            "name": pkt["msg"]["name"],
            "status": statusPkt,
            "id": str(inserted_record_id),
        }
        return response_pkt
    else:
        response_pkt = pkt
        response_pkt["response"] = {"name": pkt["msg"]["name"], "status": statusPkt}
        return response_pkt
