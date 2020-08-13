class InternalStreamer{

    constructor(socket_transcription, transcription_ip, transcription_port){

        this.streamer = new WSAudioAPI.Streamer({
            server : {
                host: transcription_ip,
                port: transcription_port,
                event: "transcription",
                elClass: ""
            }
        }, socket_transcription);

        // start the streamer
        this.streamer.start(function(error){
            console.log(" Error in WS Capture stream : ", error);
        });
    }

    getStreamer(){
        return this.streamer
    }
    
}


