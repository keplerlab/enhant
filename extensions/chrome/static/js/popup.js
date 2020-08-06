let record_btn = document.getElementById('record');
let stop_btn = document.getElementById('stop');

record_btn.onclick = function(){
    
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {

        console.log(" tabs ", tabs[0]);

        // sends message to content script (main.js)
        chrome.tabs.sendMessage(tabs[0].id, {action: "start_local_recording"}, function(response){
            console.log("Local recording status : ", response.status);
        })
    })
}

stop_btn.onclick = function(){

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {

        // sends message to content script (main.js)
        chrome.tabs.sendMessage(tabs[0].id, {action: "stop_local_recording"}, function(response){
            console.log("Local recording status : ", response.status);
        })
    })
}
