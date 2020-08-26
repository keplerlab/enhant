class WebSpeechMicCapture{

    constructor(config, socket_backend){

        this.config = config;
        this.recognition = null;
        this.socket_backend = socket_backend;
        this.meeting_info = {};
        this.transcription_start_time = null;
        this.transcription_end_time = null;
        
    }

    generateUnixTime(){
        var time = Math.round(new Date().getTime());
        return time;
    }

    reset(){
        this.recognition = null;
        this.socket_backend = null;
        this.meeting_info = {};
        this.config = {};
        this.transcription_start_time = null;
        this.transcription_end_time = null;
    }

    sendTranscriptionDataToBackend(transcription){

        // set transcription end time here
        this.transcription_end_time = this.generateUnixTime();

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

    recognitionOnStart(){
        console.log("Recognition Started ...");
    }

    recognitionOnResults(event){

        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                var final_transcript = event.results[i][0].transcript;

                console.log("Final transcription : ", final_transcript);

                 //send transcription to backend
                this.sendTranscriptionDataToBackend(final_transcript);
            }
        }

    }

    recognitionOnError(event){
        console.log("Got recognition error : ", event);
    }

    recognitionOnEnd(){
        console.log("Recongition stopped.")
    }

    checkWebSpeechAvailibilty(){
        if (!('webkitSpeechRecognition' in window)){
            return false;
        }
        else{
            return true
        }
    }

    initialize(){
        if (!this.checkWebSpeechAvailibilty()){
            console.log("WebspeechRecognition not supported by the browser.")
        }
        else {
            this.recognition = new webkitSpeechRecognition();
        }

        this.recognition.continuous = this.config.continuous;
        this.recognition.lang = this.config.lang;
        this.recognition.interimResults = this.config.interimResults;

        this.recognition.onstart = this.recognitionOnStart.bind(this);
        this.recognition.onresult = this.recognitionOnResults.bind(this);
        this.recognition.onerror = this.recognitionOnError.bind(this);
        this.recognition.onend = this.recognitionOnEnd.bind(this);

        // set transcription start time
        this.transcription_start_time = this.generateUnixTime();
    }
    
    start(){
        this.initialize();
        this.recognition.start();
    }

    stop(){
        this.recognition.stop();
        this.reset();
    }
}

function startClicked(){

    var config = {
        lang : "en-IN",
        interimResults : true,
        continuous: true
    }

    console.log(" Configuration for Mic: ", config);

    var _backend_socket_conn = new BackendHandler();
    _backend_socket_conn.connectToBackend();

    var mic_capture = new WebSpeechMicCapture(config, _backend_socket_conn);
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
