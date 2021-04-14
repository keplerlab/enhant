console.log("Loaded script to dynamically load content script");

// Function to extract the hostname from an URL.
function getHostname(url) {
    return url.match(/^(.*:)\/\/([A-Za-z0-9\-\.]+)/)[2];
}

function loadAllScripts(tabId){
    chrome.tabs.executeScript(tabId, {file: 'config.js'});
    chrome.tabs.executeScript(tabId, {file: "static/js/jquery.min.js"});
    chrome.tabs.executeScript(tabId, {file: "static/css/jquery-ui.css"});
    chrome.tabs.executeScript(tabId, {file: "static/js/jquery-ui.min.js"});
    chrome.tabs.executeScript(tabId, {file: "static/js/iframeResizer.js"});
    chrome.tabs.executeScript(tabId, {file: 'contentscript.js'});
    chrome.tabs.executeScript(tabId, {file: 'capture_meeting_id.js'});
    chrome.tabs.executeScript(tabId, {file: 'mic_capture_webspeech.js'});
}

function urlMatchHandler(settings, data){

    var url = data.url;
    var tabId = data.tabId;

    // console.log(" received data : ", tabId, settings, url);
    var urls = settings["urls"];

    var has_valid_urls = urls.filter(function(obj) {

        if (url.length >= obj.url.length){
            return getHostname(url).includes(getHostname(obj.url));
        }
        else{
            return getHostname(obj.url).includes(getHostname(url));
        }
       
    });

    if (has_valid_urls.length > 0){
        loadAllScripts(tabId);
    }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    
    if (request.msg == "page-loaded"){

        console.log("sent from tab.id=", sender.tab.id, sender.tab.url);

        var event = new CustomEvent("inject-content-match-url", {
            detail: {
                url : sender.tab.url,
                tabId: sender.tab.id,
                handler_cb : urlMatchHandler
            }
        });
        window.dispatchEvent(event);

        sendResponse({
            status: true
        });
    }

    if (request.msg == "get-current-tabid"){

        sendResponse({
            status: true,
            id: sender.tab.id
        });
    }

    return true;
});