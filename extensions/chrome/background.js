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

    initalizeRecorder(stream, encoder){
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
            encoder.encode(left);
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

    startCapture(encoder){
        var _this = this;
        chrome.tabCapture.capture({audio: true}, (stream) => { // sets up stream for capture

            this.stream = stream;
            
            _this.initalizeRecorder(stream, encoder);
            _this.playAudio(stream);
        });
    }

    stopCapture(){
        this.audioContext.stop();
        liveStream.getAudioTracks()[0].stop();
    }
}

window.addEventListener("transcription", function(event){

    let transcription = event.detail;
    console.log(" TRANSCRIPTION : ", transcription);
});


function registerEventListners(socket){
    window.addEventListener("encoder_tab", function(event){
        console.log(" received buffer ", event.detail);
        var buffer = event.detail;
        socket.send(buffer);
    })

    window.addEventListener("transcription_tab", function(event){

        let transcription = event.detail;
        console.log(" TRANSCRIPTION FROM TAB : ", transcription);
    });
}

function unregisterEventListners(socket){
    window.removeEventListener("encoder_tab", function(event){
        console.log(" Encoder (Tab) event listner removed ");
    });

    window.removeEventListener("transcription_tab", function(event){
        console.log(" Transcription (Tab) event listner removed ");
    })
}


var tabAudioCapture = null;
var encoder = null;

chrome.browserAction.onClicked.addListener(function(request) {
    console.log("Browser action ")
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => { 

    if (message.action == "start_tab_recording"){

        encoder = new FlacEncoder("encoder_tab");
        encoder.initialize();
        tabAudioCapture = new TabRecorded();
        tabAudioCapture.socketConnect();
        registerEventListners(tabAudioCapture.socket);

        if (tabAudioCapture.socket.readyState == WebSocket.OPEN) {
			tabAudioCapture.socket.send("start_tab");
            tabAudioCapture.startCapture(encoder);
		} else if (tabAudioCapture.socket.readyState == WebSocket.CONNECTING) {
			
            setTimeout(function(){
                tabAudioCapture.socket.send("start_tab");
                tabAudioCapture.startCapture(encoder);
            }, 3000);
				
		} else {
			console.error('Socket is in CLOSED state');
        }

        sendResponse({status: true})
    
    }
    else if (message.action == "stop_tab_recording"){
        unregisterEventListners()
        tabAudioCapture.socket.send("stop_tab");
        tabAudioCapture.stopCapture();
        tabAudioCapture = null;
        encoder = null;

        sendResponse({status: true})
    }
});