{
    "context": {
        "id": "",
        "origin": "client1 / client2",
        "conversation_id": ""
    },
    "msg": {
        "name": "INIT",
        "desc": "ADD new record",
        "data": {
            "conversation":{ 
                "Start_time": "DDMMYYY",
                "End_time": "DDMMYY"
            }
            
        },
        "version": ""
    },
    "response": [
        {
            "name": "INIT",
            "status": true
        }
    ]
}
    

{
    "context": {
        "id": "",
        "origin": "client1",
        "conversation_id": "111"
    },
    "msg": {
        "name": "UPDATE",
        "desc": "ADD new record",
        "data": {
            "conversation":{ 
                "End_time": "DDMMYYY"
            }
            
        },
        "version": ""
    },
    "response": [
        {
            "name": "INIT",
            "status": true
        }
    ]
}




{
    "context": {
        "id": "",
        "origin": "client1 / client2",
        "conversation_id": ""
    },
    "msg": {
        "name": "DELETE",
        "desc": "Delete record",
        "data": {
            "transcription":{
                "id": 111
            }
        },
        "version": ""
    },
    "response": [
        {
            "name": "DELETE",
            "status": true
        }
    ]
}


{
    "context": {
        "id": "",
        "origin": "client1 / client2",
        "conversation_id": ""
    },
    "msg": {
        "name": "DELETE",
        "desc": "Delete record",
        "data": {
            "conversation":{
                "id": "5f30edf5ba81e8b34e6ad2cb"
            }
        },
        "version": ""
    },
    "response": [
        {
            "name": "DELETE",
            "status": true
        }
    ]
}


