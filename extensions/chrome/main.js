window.addEventListener("transcription", function(event){

    let transcription = event.detail;
    console.log(" TRANSCRIPTION : ", transcription);
});

function connectToBackend(){

    const backend_ip = "192.168.0.102";
    const backend_port = 8000
  
    var socket_backend = new socketFactory(backend_ip, backend_port, "backend").generateSocket(open_cb=null, close_cb=null);
    
    return socket_backend
  }
  
  
  function connectToTrancriptionService(){
    const transcription_ip = "192.168.0.102";
    const transcription_port = "5000"
  
    var socket_transcription = new socketFactory(transcription_ip, transcription_port, "transcription").generateSocket(open_cb=null, close_cb=socket_transcription_closed_cb);
  
    function socket_transcription_closed_cb(new_socket){
  
      socket_transcription = new_socket;
  
      var obj = new InternalStreamer(socket_transcription, transcription_ip);
      var streamer = obj.getStreamer();

      document.querySelector('body').click();
  
      // start the streamer again
      streamer.start();
      
    }
  
    return socket_transcription;
  
  }
  
  function captureLocalAudio(socket_transcription){
      var obj = new InternalStreamer(socket_transcription);
      var streamer = obj.getStreamer();
  
      streamer.start();
  
      return streamer;
  }
  

class Enhant{

    constructor(){
        this.socket_backend = connectToBackend();
        this.socket_transcription = connectToTrancriptionService();
        this.local_streamer = captureLocalAudio(this.socket_transcription);
    }

}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(" Received message from popup script : ", message);

    // if (message.action == "start_local_recording"){
    //     const enhant_obj = new Enhant();

    //     // create a click on body
    //     document.querySelector('body').click();

    //     sendResponse({status: true});
    // }
    // else {
    //     sendResponse({status: false});
    // }
})

console.log("Content Script Loaded from extension - [enhan(t)]");
