class ScreenCapture{
    constructor(config){
        this.transcription_ip = config.ip;
        this.transcription_port = config.port;
        this.socket_transcription = null;
        this.socket_obj = null;
        this.stream = null;
        this.stream_processor = null;
        this.EVENT_FLAC_ENCODER = "screen_encoder";

        if (config.use_flac_encoder){
            this.encoder = new FlacEncoder(this.EVENT_FLAC_ENCODER);
        }
        else{
            this.encoder = null;
        }
        
        this.bufferSize = config.bufferSize;
        this.sampleRate = config.sampleRate;
        
    }

    reset(){
        this.encoder = null;
        this.socket_obj = null;
        this.socket_transcription = null;
        this.stream = null;
        this.stream_processor = null;
    }

    initializeEncoder(){
        if (!(this.encoder == null)){
            this.encoder.initialize();
            this.registerEventListner();
        }
    }

    convertFloat32ToInt16(buffer) {
        var l = buffer.length
        buf = new Int16Array(l)
        while (l--) {
          buf[l] = Math.min(1, buffer[l]) * 0x7fff
        }
        return buf.buffer
      }

    Float32BufferHandler(left){
        var _this  = this;
        if (!(this.encoder == null)){

           // encode to flac
           _this.encoder.encode(left);
        }

        // send linear 16 if encoder is null;
        else{
            var linear16 = _this.convertFloat32ToInt16(left);
            if ((_this.socket_transcription !== null) && (_this.socket_transcription.readyState == WebSocket.OPEN)){
                _this.sendBufferData(linear16);
            }

        }
    }

    sendBufferData(buffer){
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
                _this.sendBufferData(flac_buffer);
            }
            
        });
    }

    playAudio(){
        let audio = new Audio();
        audio.srcObject = this.stream;
        audio.play();
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

    connectToTranscriptionService(){
        var _this = this;
        this.socket_obj = new socketFactory(_this.transcription_ip, 
            _this.transcription_port, "transcription");

        this.socket_transcription = this.socket_obj.generateSocket(function(){
            _this.socket_transcription.send(JSON.stringify({
                "cmd": "start",
                "origin": "speaker",
                "conversation_id": "test"
    
            }));
        },
            _this.socket_transcription_closed_cb);

    }

    updateIP(ip){
        this.transcription_ip = ip;
    }

    initializeStream(stream){
        var _this = this;
        var audioContext = window.AudioContext;
        var context = new audioContext();
        var source = context.createMediaStreamSource(stream);
        var input = context.createGain();
        source.connect(input);

        var bufferSize = _this.bufferSize;
        // create a javascript node
        var recorder = context.createScriptProcessor(bufferSize, 1, 1);

        _this.stream_processor = recorder;

        // specify the processing function
        recorder.onaudioprocess = function(e){

            // This is left channel (for mono this is sufficient)
            var left = e.inputBuffer.getChannelData(0);

            // encode
            _this.Float32BufferHandler(left);
        };
        // connect stream to our recorder
        input.connect(recorder);
        // connect our recorder to the previous destination
        recorder.connect(context.destination);
    }

    captureStream(){

        var _this = this;

        chrome.tabCapture.capture({audio: true}, (stream) => {
            _this.stream = stream;
            _this.initializeStream(stream);
            _this.playAudio();
        })

    }

    finishEncoding(){

        if (!(this.encoder == null)){

            // stop the event listner 
            this.deregisterEventListner();

            // stop the encoder
            this.encoder.finish();
        }
        
         // stop capturing the stream
         this.stream_processor.disconnect();
         delete this.stream_processor;

    }

    disconnectFromTranscriptionService(){
        // disconnect from the transcription service
        this.socket_obj.doReconnect(false);
        this.socket_transcription.close();
    }

    stop(){

        this.finishEncoding();
        this.disconnectFromTranscriptionService();
        this.reset();
        console.log("Screen capture stopped...");
    }

    start(){
        console.log("Starting the screen capture process ..");
        this.initializeEncoder();
        this.connectToTranscriptionService();
        this.captureStream();
    }
}

function startClicked(){

    var config = {
        sampleRate: 44100,
        bufferSize: 4096,
        ip: CONFIG.transcription.ip,
        port: CONFIG.transcription.port,
        use_flac_encoder: false
    }

    console.log(" Configuration for Screen: ", config);

    var screen_capture = new ScreenCapture(config);
    screen_capture.start();

    function stopClicked(message, sender, sendResponse){

        if (message.action == "capture_screen_stop"){

            if (!(screen_capture == null)){
                screen_capture.stop();
                delete screen_capture;
            }
          
        }

        // remove stop listner 
        chrome.runtime.onMessage.removeListener(stopClicked);

        sendResponse({status: true});
        
    }

    chrome.runtime.onMessage.addListener(stopClicked);
}



chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(" Received message from popup script : ", message);

    if (message.action == "capture_screen_start"){

        startClicked();

        sendResponse({status: true});
    }
})

console.log("Backround Script Loaded from extension - [enhan(t)]");
