class TabStreamer{

    constructor(socket_transcription, transcription_ip, transcription_port ,stream){

        this.streamer = new WSAudioAPI.Streamer({
            server : {
                host: transcription_ip,
                port: transcription_port,
                event: "transcription_tab",
                elClass: ""
            }
        }, socket_transcription, stream);

        // start the streamer
        this.streamer.start();
    }

    getStreamer(){
        return this.streamer
    }
    
}


