class BackendHandler{
    constructor(){
        this.ip = "127.0.0.1";
        this.port = 8000;
        this.socket_backend = null;
        this.socket_onopen_cb = null;
        this.socket_obj = null;
    }

    updateIP(ip){
        this.ip = ip;
    }

    socket_backend_closed_cb(new_socket){
        this.socket_backend = new_socket;
    }

    set_socket_onopen_handler(cb){
        this.socket_onopen_cb = cb;
    }

    socket_backend_data_cb(message){
        console.log(" Message received from backend :", message);
        var json_data = JSON.parse(message.data);

        // create a custom event to dispose backend event
        if (json_data["response"]["name"] == "INIT"){
            
            // sends a message to update conv id
            chrome.runtime.sendMessage({msg: "conv_id_info", data: json_data["response"]["id"]}, 
            function(response){
                console.log(response.status);
            })
        }
    }

    connectToBackend(){
        var _this = this;
        this.socket_obj = new socketFactory(_this.ip, 
            _this.port, "backend");

        this.socket_backend = this.socket_obj.generateSocket(_this.socket_onopen_cb,
            _this.socket_backend_closed_cb.bind(this));

        _this.socket_backend.onmessage = _this.socket_backend_data_cb.bind(this);
    }

    sendDataToBackend(message){
        console.log(" backend socket state ", this.socket_backend.readyState == WebSocket.OPEN);
        if (this.socket_backend.readyState == WebSocket.OPEN){
            this.socket_backend.send(JSON.stringify(message));
        }
    }

    generateEventTime(){
        var event_time = Math.round(new Date().getTime());
        return event_time;
    }

    createMeetingData(origin, meeting_number){

       
        var event_time = this.generateEventTime();

        var json = {
            "context": {
                "conv_id": "",
                "origin": origin,
                "meeting_id": meeting_number,
                "event_time": event_time
            },
            "msg": {
                "name": "INIT",
                "type": "MEETING",
                "desc": "ADD new meeting",
                "data": {
                    "conversation":"",  
                }, 
                "version": ""
            }
        }

        return json
    }

    createNotesData(){
        var event_time = this.generateEventTime();

    }

    createTranscriptionData(origin, conv_id , meeting_number , transcription, transcription_start_time,
        transcription_end_time){

        var event_time = this.generateEventTime();

        // get the conv id from the local storage
        var json = {
            "context": {
                "conv_id": conv_id,
                "origin": origin,
                "meeting_id": meeting_number,
                "event_time": event_time
            },
            "msg": {
                "name": "ADD",
                "type": "TRANSCRIPTION",
                "desc": "ADD record",
                "data": {
                    "transcription":{
                        "content": transcription,
                        "type": "text",
                        "start_time": transcription_start_time,
                        "end_time": transcription_end_time
        
                    }
                },
                "version": ""
            }
        }

        return json;

    }
    
}


console.log("Backend script loaded ... ");
