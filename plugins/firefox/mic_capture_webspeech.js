class WebSpeechMicCapture{ 

    constructor(config){

        this.config = config;
        this.recognition = null;
        this.transcription_start_time = null;
        this.transcription_end_time = null;
        this.origin = "host";

        this.restart = true;

        this.error_msg = "SpeechRecognition not available. Make sure your browser support it. " +
        "Checkout the doc here for more info: <a target='_blank' href='https://wiki.mozilla.org/Web_Speech_API_-_Speech_Recognition#How_can_I_use_it.3F'>Browser Support</a>";

        
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
        if (!('SpeechRecognition' in window)){
            return false;
        }
        else{
            return true
        }
    }

    haveRecognitionSupport(){
        if (!this.checkWebSpeechAvailibilty()){
            return false;
        }
        else {
            return true;
        }
    }
    

    initialize(){
        this.recognition = new SpeechRecognition();

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

    var mic_capture = new WebSpeechMicCapture(config);

    if (mic_capture.checkWebSpeechAvailibilty()){

        console.log(" Configuration for Mic: ", config);
        mic_capture.start();

        function stopClicked(message, sender, sendResponse){

            if (message.action == "capture_mic_stop"){
    
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

        return {
            "error": null,
            "status": true,
            "config": config
        }
    }
    else {
        console.log("SpeechRecognition not supported by the browser.");

        function stopClicked(message, sender, sendResponse){

            if (message.action == "capture_mic_stop"){
    
                // remove stop listner 
                chrome.runtime.onMessage.removeListener(stopClicked);
    
                sendResponse({status: true});
              
            }
    
        }
    
        chrome.runtime.onMessage.addListener(stopClicked);

        return {
            "error": mic_capture.error_msg,
            "status": false,
            "config": config
        }
        

    }
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // console.log(" Received message from background for mic capturing script : ", message);

    if (message.action == "capture_mic_start"){
        
        var result = startClicked(message.data);
        var config = result["config"];

        sendResponse({
            status: result["status"], 
            data: { lang: config.lang, need_punctuation: true},
            error: result["error"]
        });
    }
})

// console.log("Content Script Loaded from extension - [enhan(t)]");
