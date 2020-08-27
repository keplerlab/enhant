class MicCapture{
    constructor(config, socket_backend){
        this.transcription_ip = config.ip;
        this.transcription_port = config.port;
        this.socket_transcription = null;
        this.socket_obj = null;
        this.stream = null;
        this.stream_processor = null;
        this.EVENT_FLAC_ENCODER = "mic_encoder";
        this.encoder = new FlacEncoder(this.EVENT_FLAC_ENCODER);
        this.bufferSize = config.bufferSize;
        this.sampleRate = config.sampleRate;
        this.socket_backend = socket_backend;
        this.meeting_info = {};

        this.transcription_start_time = null;
        this.transcription_end_time = null;
    }

    reset(){
        this.encoder = null;
        this.socket_obj = null;
        this.socket_transcription = null;
        this.stream = null;
        this.stream_processor = null;
    }

    generateUnixTime(){
        var time = Math.round(new Date().getTime());
        return time;
    }

    sendFlacBufferData(buffer){
        // console.log(" socket connection before send : ", this.socket_transcription);
        if (!(this.socket_transcription == null)){
            this.socket_transcription.send(buffer);
        }
    }

    registerEventListner(){
        var _this = this;
        window.addEventListener(_this.EVENT_FLAC_ENCODER, function(event){
            var flac_buffer = event.detail
            // console.log("Buffer Data for mic : ", flac_buffer);

            if ((_this.socket_transcription !== null) && (_this.socket_transcription.readyState == WebSocket.OPEN)){
                _this.sendFlacBufferData(flac_buffer);
            }
            
        });
    }

    deregisterEventListner(){
        var _this = this;
        window.removeEventListener(_this.EVENT_FLAC_ENCODER, function(event){
            console.log(" Event listners removed ");
        });
    }

    socket_transcription_closed_cb(new_socket){
        this.socket_transcription = new_socket;
    }

    socket_transcription_data_cb(message){
        
        var transcription = message.data;
        // console.log("Transcription data ", message.data);

        // console.log(" meeting info :", this.meeting_info);

        // set transcription end time here
        this.transcription_end_time = this.generateUnixTime();

        // send data to backend over socket
        if (this.meeting_info){
            if (this.meeting_info.hasOwnProperty("meeting_number")){
                if (this.meeting_info.hasOwnProperty("conv_id")){

                    var meeting_number = this.meeting_info["meeting_number"];
                    var conv_id = this.meeting_info["conv_id"];
                    var d = this.socket_backend.createTranscriptionData("host", conv_id, 
                    meeting_number, transcription, this.transcription_start_time, this.transcription_end_time);
                    this.socket_backend.sendDataToBackend(d);
                }
            }
        }

        // set transcription end time
        this.transcription_start_time = this.transcription_end_time;
    }

    connectToTranscriptionService(){
        var _this = this;

        // set transcription start time
        _this.transcription_start_time = _this.generateUnixTime();
        this.socket_obj = new socketFactory(_this.transcription_ip, 
            _this.transcription_port, "transcription");

        this.socket_transcription = this.socket_obj.generateSocket(function(){

            _this.socket_transcription.send(JSON.stringify({
                "cmd": "start",
                "origin": "mic",
                "conversation_id": "test"
    
            }));
        },
            _this.socket_transcription_closed_cb.bind(_this));

        _this.socket_transcription.onmessage = _this.socket_transcription_data_cb.bind(this);

    }

    updateIP(ip){
        this.transcription_ip = ip;
    }

    initializeStream(stream){
        var _this = this;
        var audioContext = window.AudioContext;
        var context = new audioContext();
        var audioInput = context.createMediaStreamSource(stream);
        var bufferSize = _this.bufferSize;
        // create a javascript node
        var recorder = context.createScriptProcessor(bufferSize, 1, 1);

        _this.stream_processor = recorder;

        // specify the processing function
        recorder.onaudioprocess = function(e){

            // This is left channel (for mono this is sufficient)
            var left = e.inputBuffer.getChannelData(0);

            // encode to flac
            _this.encoder.encode(left);
        };
        // connect stream to our recorder
        audioInput.connect(recorder);
        // connect our recorder to the previous destination
        recorder.connect(context.destination);
    }

    captureStream(){

        var _this = this;

        var constraints = {
            audio : {
                sampleRate: this.sampleRate
            }
        }
        navigator.getUserMedia(constraints, function(stream) {
        
            _this.stream = stream;
            _this.initializeStream(stream);    
        },
        function(error){
            console.log(" Error with getusermedia ", error);
        })

    }

    stop(){

        // stop teh event listner 
        this.deregisterEventListner();

        // stop the encoder
        this.encoder.finish();

        // disconnect from the transcription service
        this.socket_obj.doReconnect(false);
        this.socket_transcription.close();

        // stop capturing the stream
        this.stream_processor.disconnect();
        delete this.stream_processor;

        this.reset();

        console.log("Mic capture stopped...");
    }

    start(){
        console.log("Starting the mic capture process ..");
        this.encoder.initialize();
        this.registerEventListner();
        this.connectToTranscriptionService();
        this.captureStream();
    }
}

function startClicked(){

    var config = {
        sampleRate: 44100,
        bufferSize: 4096,
        ip: CONFIG.transcription.ip,
        port: CONFIG.transcription.port
    }

    console.log(" Configuration for Mic: ", config);

    var _backend_socket_conn = new BackendHandler();
    _backend_socket_conn.connectToBackend();

    var mic_capture = new MicCapture(config, _backend_socket_conn);
    mic_capture.start();

    function updateMeetingData(message, sender, sendResponse){
        
        if (message.action == "meeting_number_updated"){

            // send message to backend
            var origin = "host";
            var create_meeting_data = _backend_socket_conn.createMeetingData(origin, message.data);

            // delay of 2 sec to enable socket connection
            setTimeout(function(){
                _backend_socket_conn.sendDataToBackend(create_meeting_data);
            }, 2000);

            // update meeting info
            mic_capture.meeting_info["meeting_number"] = message.data;
        }

        if (message.action == "update_conv_id"){
            mic_capture.meeting_info["conv_id"] = message.data;
        }

        sendResponse({status: true});
    }

    function stopClicked(message, sender, sendResponse){


        if (message.action == "capture_mic_stop"){

            console.log(" mic capture info ", mic_capture);
            if (mic_capture !== null){
                mic_capture.stop();
                delete mic_capture;
            }

            if (_backend_socket_conn !== null){
                _backend_socket_conn.socket_obj.doReconnect(false);
                _backend_socket_conn.socket_backend.close();
                delete _backend_socket_conn
                _backend_socket_conn = null;
            }

            // remove stop listner 
            chrome.runtime.onMessage.removeListener(stopClicked);
            chrome.runtime.onMessage.removeListener(updateMeetingData);
          
        }

        sendResponse({status: true});
        
    }

    chrome.runtime.onMessage.addListener(stopClicked);
    chrome.runtime.onMessage.addListener(updateMeetingData);
}



chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(" Received message from popup script : ", message);

    if (message.action == "capture_mic_start"){

        startClicked();

        sendResponse({status: true});
    }
})

console.log("Content Script Loaded from extension - [enhan(t)]");
