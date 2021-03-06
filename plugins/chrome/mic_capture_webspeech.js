class WebSpeechMicCapture{

    constructor(config){

        this.config = config;
        this.recognition = null;
        this.transcription_start_time = null;
        this.transcription_end_time = null;
        this.origin = "host";

        this.restart = true;
        
    }

    generateUnixTime(){
        var time = Math.round(new Date().getTime());
        return time;
    }

    reset(){
        this.recognition = null;
        this.config = {};
        this.transcription_start_time = null;
        this.transcription_end_time = null;
    }

    set_restart(state){
        this.restart = state;   
    }

    saveTranscription(transcription){

        // set transcription end time here
        this.transcription_end_time = this.generateUnixTime();

        var transcription_data = {
            "event_time": this.transcription_end_time,
            "transcription": transcription,
            "start_time": this.transcription_start_time,
            "end_time": this.transcription_end_time,
            "origin": this.origin
        }

        // send a message to background to save transcription
        chrome.runtime.sendMessage({msg: "save_transcription", data: transcription_data}, 
        function(response){
            console.log(response.status);
        })

        // set transcription start time
        this.transcription_start_time = this.transcription_end_time;
    }

    recognitionOnStart(){
        console.log("Recognition Started ...");
    }

    recognitionOnResults(event){

        var interim_transcript = '';

        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                var final_transcript = event.results[i][0].transcript;

                // send interim results to popup
                chrome.runtime.sendMessage({
                    "msg": "transcription_realtime",
                    "data": {
                        "is_final": true,
                        "transcription": final_transcript
                    }
                });

                 //save transcription
                this.saveTranscription(final_transcript);
            }
            else{
                interim_transcript += event.results[i][0].transcript;

                // send interim results to popup
                chrome.runtime.sendMessage({
                    "msg": "transcription_realtime",
                    "data": {
                        "is_final": false,
                        "transcription": interim_transcript
                    }
                });
            }
        }

    }

    restart_service(){
        if (this.restart){
            this.recognition.start();
        }
    }

    recognitionOnError(event){
        console.log("Got recognition error : ", event);

        this.restart_service();
        
    }

    recognitionOnEnd(){
        console.log("Recongition stopped.");

        this.restart_service();
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
        this.set_restart(false);
        this.recognition.stop();
        this.reset();
    }
}

function isEmpty(obj){
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop)) {
            return false;
        }
    }

    return JSON.stringify(obj) === JSON.stringify({});
}

function startClicked(settings_data){

    // send a message to fetch the settings

    if (isEmpty(settings_data)){
        settings_data["lang"] = CONFIG.transcription.lang_default;
    }

    var config = {
        lang : settings_data.lang,
        interimResults : true,
        continuous: true
    }

    console.log(" Configuration for Mic: ", config);

    var mic_capture = new WebSpeechMicCapture(config);
    mic_capture.start();

    function stopClicked(message, sender, sendResponse){


        if (message.action == "capture_mic_stop"){

            console.log(" mic capture info ", mic_capture);
            if (mic_capture !== null){
                mic_capture.stop();
                delete mic_capture;
            }

            // remove stop listner 
            chrome.runtime.onMessage.removeListener(stopClicked);

            sendResponse({status: true});
          
        }

        
    }

    chrome.runtime.onMessage.addListener(stopClicked);

    return config;
}



chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(" Received message from popup script : ", message);

    if (message.action == "capture_mic_start"){

        var config = startClicked(message.data);

        sendResponse({status: true, data: { lang: config.lang, need_punctuation: true}});
    }
})

console.log("Content Script Loaded from extension - [enhan(t)]");
