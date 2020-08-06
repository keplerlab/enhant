const transcription_ip = "192.168.0.102";
const transcription_port = "5000";


let socket = null;
let stream = null;

function connectToTrancriptionService(stream){
  
    var socket_transcription = new socketFactory(transcription_ip, transcription_port, "transcription").generateSocket(open_cb=null, close_cb=socket_transcription_closed_cb);
  
    function socket_transcription_closed_cb(new_socket){
  
      socket_transcription = new_socket;
  
      var obj = new TabStreamer(socket_transcription, transcription_ip, transcription_port ,stream);
      var streamer = obj.getStreamer();

      document.querySelector('body').click();
  
      // start the streamer again
      streamer.start();
      
    }
  
    return socket_transcription;
  
}
  
function captureTabAudio(socket_transcription, stream){
    var obj = new TabStreamer(socket_transcription, transcription_ip, transcription_port, stream);
    var streamer = obj.getStreamer();

    document.querySelector('body').click();

    streamer.start();

    return streamer;
}

function audioCapture(){
    chrome.tabCapture.capture({audio: true}, (stream) => { // sets up stream for capture
        let startTabId; //tab when the capture is started
        let completeTabID; //tab when the capture is stopped
        chrome.tabs.query({active:true, currentWindow: true}, (tabs) => startTabId = tabs[0].id) //saves start tab
        const liveStream = stream;
        
        var socket_transcription = connectToTrancriptionService(stream);
        var tabaudio_stream = captureTabAudio(socket_transcription, stream);

        socket = socket_transcription;
        stream = tabaudio_stream;

        // To playback tab audio while chrome.tabCapture is running,
        // the audio stream needs to be played back
        let audio = new Audio();
        audio.srcObject = liveStream;
        audio.play();

    });
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => { 

    if (message.action == "start_tab_recording"){

        // start the audio recording for tab and stream it for transcription service
        audioCapture();
        sendResponse({status: true});
        
    }
    else if (message.action == "stop_tab_recording"){
        stream.stop();
        socket.close();
    }
});

window.addEventListener("transcription_tab", function(event){

    let transcription = event.detail;
    console.log(" TRANSCRIPTION FROM TAB : ", transcription);
});