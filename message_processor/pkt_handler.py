from os import path


def extract_data_from_msg(pkt):
    return pkt["msg"]["data"]


def isRequestValid(pkt):
    if ("msg" not in pkt):
        print("msg field missing", flush=True)
        return False

    if ("context" not in pkt):
        print("context field missing", flush=True)
        return False

    if ("origin" not in pkt["context"]):
        print("origin field missing", flush=True)
        return False

    if ("meeting_id" not in pkt["context"]):
        print("meeting_id field missing", flush=True)
        return False

    if ("event_time" not in pkt["context"]):
        print("event_time field missing", flush=True)
        return False

    if ("name" not in pkt["msg"]):
        print("msg.name field missing", flush=True)
        return False

    if ("type" not in pkt["msg"]):
        print("msg.type field missing", flush=True)
        return False

    if ("desc" not in pkt["msg"]):
        print("desc field missing", flush=True)
        return False

    if ("data" not in pkt["msg"]):
        print("msg.data field missing", flush=True)
        return False

    if ("version" not in pkt["msg"]):
        print("msg.version field missing", flush=True)
        return False

    if (pkt["context"]["origin"] != "host" and pkt["context"]["origin"] != "guest"):
        print("context.origin is neither guest or host", flush=True)
        return False

    if (pkt["msg"]["name"] != "INIT" and pkt["msg"]["name"] != "END" and pkt["msg"]["name"] != "ADD" and pkt["msg"]["name"] != "DELETE"):
        print("msg.name is not among values: INIT, ADD, END, DELETE", flush=True)
        return False

    return True


def prepare_response(pkt, is_ok, inserted_record_id):
    if is_ok:
        response_pkt = pkt
        response_pkt["response"] = {
            "name": pkt["msg"]["name"],
            "status": True,
            "id": str(inserted_record_id),
        }
        return response_pkt
    else:
        response_pkt = pkt
        response_pkt["response"] = {"name": pkt["msg"]["name"], "status": False}
        return response_pkt
