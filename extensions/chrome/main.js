const transcription_ip = CONFIG.transcription.ip;
const transcription_port = CONFIG.transcription.port;

var socket_transcription = new socketFactory(transcription_ip, transcription_port, "transcription").generateSocket(open_cb=null, close_cb=socket_transcription_closed_cb);

function socket_transcription_closed_cb(new_socket){
    socket_transcription = new_socket;
}

var flac_encoder,
	BUFSIZE = 4096,
	CHANNELS = 1,
	SAMPLERATE = 44100,
	COMPRESSION = 5,
	BPS = 16,
	flac_ok = 1,
	flacLength = 0,
	flacBuffers = [],
	WAVFILE = false,
	INIT = false,
	wavLength = 0,
    wavBuffers = [];

function write_callback_fn(buffer, bytes){
    flacBuffers.push(buffer);
    flacLength += buffer.byteLength;

    // send flac buffer over socket
    socket_transcription.send(buffer);
}
    
//HELPER: handle initialization of flac encoder
function initFlac(){
	
	flac_encoder = Flac.create_libflac_encoder(SAMPLERATE, CHANNELS, BPS, COMPRESSION, 0);
	////
	if (flac_encoder != 0){
		var status_encoder = Flac.init_encoder_stream(flac_encoder, write_callback_fn);
		flac_ok &= (status_encoder == 0);
		
		console.log("flac init     : " + flac_ok);//DEBUG
		console.log("status encoder: " + status_encoder);//DEBUG
		
		INIT = true;
	} else {
		console.error("Error initializing the encoder.");
	}
}

function convertFloat32ToInt16(buffer) {
    l = buffer.length;
    buf = new Int16Array(l);
    while (l--) {
        buf[l] = Math.min(1, buffer[l])*0x7FFF;
    }
    return buf.buffer;
}

function recorderProcess(e) {
    // This is left channel (for mono this is sufficient)
    var left = e.inputBuffer.getChannelData(0);

    // encode to flac
    encodeFlac(left);
}

function initializeRecorder(stream) {
    var audioContext = window.AudioContext;
    var context = new audioContext();
    var audioInput = context.createMediaStreamSource(stream);
    var bufferSize = BUFSIZE;
    // create a javascript node
    var recorder = context.createScriptProcessor(bufferSize, 1, 1);
    // specify the processing function
    recorder.onaudioprocess = recorderProcess;
    // connect stream to our recorder
    audioInput.connect(recorder);
    // connect our recorder to the previous destination
    recorder.connect(context.destination);
}

function captureStream(){

    var constraints = {
        audio : {
            sampleRate: 44100
        }
    }
    navigator.getUserMedia(constraints, function(stream) {
    
        initializeRecorder(stream);    
    },
    function(error){
        console.log(" Error with getusermedia ", error);
    })
                
}

//HELPER: actually encode PCM data to Flac
function doEncodeFlac(audioData){
	
	var buf_length = audioData.length;
	var buffer_i32 = new Uint32Array(buf_length);
	var view = new DataView(buffer_i32.buffer);
	var volume = 1;
	var index = 0;
	for (var i = 0; i < buf_length; i++){
		view.setInt32(index, (audioData[i] * (0x7FFF * volume)), true);
		index += 4;
	}

	var flac_return = Flac.FLAC__stream_encoder_process_interleaved(flac_encoder, buffer_i32, buffer_i32.length / CHANNELS);
	if (flac_return != true){
		console.log("Error: encode_buffer_pcm_as_flac returned false. " + flac_return);
    }

}

//HELPER: handle incoming PCM audio data for Flac encoding:
function encodeFlac(audioData){
	
	if(!Flac.isReady()){
		
		//if Flac is not ready yet: buffer the audio
		wavBuffers.push(audioData);
		console.info('buffered audio data for Flac encdoing')
		
	} else {
	
		if(wavBuffers.length > 0){
			//if there is buffered audio: encode buffered first (and clear buffer)
			
			var len = wavBuffers.length;
			var buffered = wavBuffers.splice(0, len);
			for(var i=0; i < len; ++i){
				doEncodeFlac(buffered[i]);
			}
		}
	
		doEncodeFlac(audioData);
	}
}



chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(" Received message from popup script : ", message);

    if (message.action == "start_local_recording"){

        if(!Flac.isReady()){
            Flac.onready = function(){
                
                setTimeout(function(){
                    initFlac();
                },0);
            }
        } else {
            initFlac();
        }
        
        captureStream();

        sendResponse({status: true});
    }

    if (message.action == "stop_local_recording"){
        sendResponse({status: true});

    }
})

console.log("Content Script Loaded from extension - [enhan(t)]");
