function convertFloat32ToInt16(buffer) {
    l = buffer.length;
    buf = new Int16Array(l);
    while (l--) {
        buf[l] = Math.min(1, buffer[l])*0x7FFF;
    }
    return buf.buffer;
}

class TabRecorded{
    constructor(){
        this.transcription_ip = CONFIG.transcription.ip;
        this.transcription_port = CONFIG.transcription.port;

        this.context = null;
        this.socket = null;
        this.stream = null;
    }

    socketConnect(){
        var _this = this;
        function socket_transcription_closed_cb(new_socket){
  
            _this.socket = new_socket;
            
        }

        _this.socket = new socketFactory(_this.transcription_ip, _this.transcription_port, "transcription").generateSocket(null, socket_transcription_closed_cb);
    }

    initalizeRecorder(stream){
        var audioContext = window.AudioContext;
        this.context = new audioContext();
        var audioInput = this.context.createMediaStreamSource(stream);
        var bufferSize = 2048;
        // create a javascript node
        var recorder = this.context.createScriptProcessor(bufferSize, 1, 1);

        var _this = this;

        // specify the processing function
        recorder.onaudioprocess = function(e){
            var left = e.inputBuffer.getChannelData(0);
            _this.socket.send(convertFloat32ToInt16(left));
        }
        // connect stream to our recorder
        audioInput.connect(recorder);
        // connect our recorder to the previous destination
        recorder.connect(this.context.destination);
    }

    playAudio(stream){
        // To playback tab audio while chrome.tabCapture is running,
        // the audio stream needs to be played back
        let audio = new Audio();
        audio.srcObject = stream;
        audio.play();
    }

    startCapture(){
        var _this = this;
        chrome.tabCapture.capture({audio: true}, (stream) => { // sets up stream for capture

            this.stream = stream;

            if (_this.socket == null){
                _this.socketConnect();
            }
            
            _this.initalizeRecorder(stream);
            _this.playAudio(stream);
        });
    }

    stopCapture(){
        this.audioContext.stop();
        liveStream.getAudioTracks()[0].stop();
    }
}

var tabAudioCapture = null;

window.addEventListener("transcription", function(event){

    let transcription = event.detail;
    console.log(" TRANSCRIPTION : ", transcription);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => { 

    if (message.action == "start_tab_recording"){
        setTimeout(function(){
            tabAudioCapture = new TabRecorded();
            tabAudioCapture.startCapture();
        }, 1000);
    }
    else if (message.action == "stop_tab_recording"){
        tabAudioCapture.stopCapture();
        tabAudioCapture = null;
    }
});

window.addEventListener("transcription_tab", function(event){

    let transcription = event.detail;
    console.log(" TRANSCRIPTION FROM TAB : ", transcription);
});