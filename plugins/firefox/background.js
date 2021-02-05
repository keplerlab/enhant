chrome.browserAction.onClicked.addListener(function(tab) {

    var obj = {
        "plugin_activated": true
    }

    chrome.storage.local.set(obj, function(){
        console.log("Object saved into local storage: ", obj);

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            // add to storage that plugin is activated
            chrome.tabs.sendMessage(tabs[0].id, {cmd: "activate_plugin"}, function(result) {
                console.log("Plugin activated : ", result.status);
            });
        });       
    });
});

chrome.commands.onCommand.addListener((command) => {
    if (command === "take-note") {

        // add to storage that plugin is activated
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {

            // add to storage that plugin is activated
            chrome.tabs.sendMessage(tabs[0].id, {cmd: "take-note"}, function(result) {
                console.log("Plugin activated : ", result.status);
            });
    
        });
    }
});

console.log("Backround Script Loaded from extension - [enhan(t)]");
