class FlacEncoder{
    
    // takes the eventName on which the buffer data is released / exposed
    constructor(eventName){
        this.flac_encoder = null;
	    this.BUFSIZE = 4096;
	    this.CHANNELS = 1;
	    this.SAMPLERATE = 44100;
	    this.COMPRESSION = 5;
	    this.BPS = 16;
	    this.flac_ok = 1;
	    this.flacLength = 0;
	    this.flacBuffers = [];
	    this.WAVFILE = false;
        this.INIT = false;
        this.wavLength = 0;
        this.wavBuffers = [];
        this.eventName = eventName;
    }

    reset(){
        this.flac_encoder = null;
	    this.BUFSIZE = 4096;
	    this.CHANNELS = 1;
	    this.SAMPLERATE = 44100;
	    this.COMPRESSION = 5;
	    this.BPS = 16;
	    this.flac_ok = 1;
	    this.flacLength = 0;
	    this.flacBuffers = [];
	    this.WAVFILE = false,
        this.INIT = false;
        this.wavLength = 0;
        this.wavBuffers = [];
        this.eventName = null;
    }

    finish(){
        var _this = this;
        if(!Flac.isReady()){
				
            console.error('Flac was not initialized: could not encode data!');
            
        } else {
            
            _this.flac_ok &= Flac.FLAC__stream_encoder_finish(_this.flac_encoder);
            console.log("flac finish: " + _this.flac_ok);//DEBUG
            
            Flac.FLAC__stream_encoder_delete(_this.flac_encoder);
        }

        _this.reset();
    }

    // fires custom event with encoded flac data
    sendEncodedBuffer(buffer){
        var _this = this;
        var event = new CustomEvent(_this.eventName, {
            detail: buffer
        });
        
        // console.log(" Encoder : Dispatching buffer on Event :- ", _this.eventName);
        // console.log(buffer);

        window.dispatchEvent(event);
    }

    // The callback function when the data is encoded
    // writes buffer data to flac buffer (in case of local recording)
    // sends bufer over this.eventName custom event
    write_callback_fn(buffer, bytes){
        this.flacBuffers.push(buffer);
        this.flacLength += buffer.byteLength;
    
        // send flac buffer over socket
        this.sendEncodedBuffer(buffer);
        // this.socket.send(buffer);
    }

    doInitialization(){
        var _this = this;
        _this.flac_encoder = Flac.create_libflac_encoder(_this.SAMPLERATE, _this.CHANNELS, _this.BPS, _this.COMPRESSION, 0);
        if (_this.flac_encoder != 0){
            var status_encoder = Flac.init_encoder_stream(_this.flac_encoder, function(buffer, bytes){
                _this.flacBuffers.push(buffer);
                _this.flacLength += buffer.byteLength;

                _this.sendEncodedBuffer(buffer);
            });
            _this.flac_ok &= (status_encoder == 0);
            
            console.log("flac init     : " + _this.flac_ok);//DEBUG
            console.log("status encoder: " + status_encoder);//DEBUG
            
            _this.INIT = true;
        } else {
            console.error("Error initializing the encoder.");
        }
    }

    initialize(){
        var _this = this;
        if(!Flac.isReady()){
            Flac.onready = function(){
                
                setTimeout(function(){
                    _this.doInitialization();
                },0);
            }
        } else {
            _this.doInitialization();
        }
    }

    doEncodeFlac(audioData){
        var _this = this;
        var buf_length = audioData.length;
        var buffer_i32 = new Uint32Array(buf_length);
        var view = new DataView(buffer_i32.buffer);
        var volume = 1;
        var index = 0;
        for (var i = 0; i < buf_length; i++){
            view.setInt32(index, (audioData[i] * (0x7FFF * volume)), true);
            index += 4;
        }

        var flac_return = Flac.FLAC__stream_encoder_process_interleaved(_this.flac_encoder, buffer_i32, buffer_i32.length / _this.CHANNELS);
        if (flac_return != true){
            console.log("Error: encode_buffer_pcm_as_flac returned false. " + flac_return);
        }
    }

    encode(audioData){

        var _this = this;
        if(!Flac.isReady()){
		
            //if Flac is not ready yet: buffer the audio
            _this.wavBuffers.push(audioData);
            console.info('buffered audio data for Flac encdoing')
            
        } else {
        
            if(_this.wavBuffers.length > 0){
                //if there is buffered audio: encode buffered first (and clear buffer)
                
                var len = _this.wavBuffers.length;
                var buffered = _this.wavBuffers.splice(0, len);
                for(var i=0; i < len; ++i){
                    _this.doEncodeFlac(buffered[i]);
                }
            }
        
            _this.doEncodeFlac(audioData);
        }
    }
}