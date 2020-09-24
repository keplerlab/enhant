var enhant_local_storage_obj = new EnhantLocalStorage();
var backend_obj = new BackendHandler();

// TODO: connect to backend (should be moved to power mode);
// backend_obj.connectToBackend();

function isEmpty(obj){
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop)) {
            return false;
        }
    }

    return JSON.stringify(obj) === JSON.stringify({});
}

function getSettings(cb, data){
    enhant_local_storage_obj.read_multiple([STORAGE_KEYS.settings], function(result){

        var settings_data = result[STORAGE_KEYS.settings];
        cb(settings_data, data);
    });
}

window.addEventListener("inject-content-match-url", function(evt){
    var handler_cb = evt.detail.handler_cb;
    var url = evt.detail.url;
    var tabId = evt.detail.tabId;

    var data = {
        url: url,
        tabId: tabId
    }
    getSettings(handler_cb, data);
})

function transcriptionMessageHandler(transcription_data){
    var d_type = STORAGE_KEYS.transcription;

    enhant_local_storage_obj.save(d_type, transcription_data, function(){


        // TODO : should only happen when mode is power
        // var keys = [STORAGE_KEYS.meeting_number, STORAGE_KEYS.conv_id];

        // enhant_local_storage_obj.read_multiple(keys, function(results){


        //     var meeting_number = results[STORAGE_KEYS.meeting_number];
        //     var conv_id = results[STORAGE_KEYS.conv_id];

        //     console.log(" results for multiple keys ", meeting_number, conv_id);

        //     var json = backend_obj.createTranscriptionData(meeting_number, conv_id, transcription_data);
        //     backend_obj.sendDataToBackend(json);

        // })
        
        
    })
}

function convIDMessageHandler(conv_id){

    var obj = {};
    obj[STORAGE_KEYS.conv_id] = conv_id;
    enhant_local_storage_obj.save_basic(obj)
}

function saveMeetingNumber(meeting_number, cb){
    var obj = {
        "meeting_number": meeting_number
    }

    enhant_local_storage_obj.save_basic(obj, function(d){

        var conv_id = enhant_local_storage_obj.generateRandomConvId();
        convIDMessageHandler(conv_id);

        cb();
    });
}

function saveHostData(data){
    var obj = {};
    obj[STORAGE_KEYS.host] = {
        "lang": data.lang,
        "need_punctuation": data.need_punctuation
    };
    enhant_local_storage_obj.save_basic(obj);
}


function saveGuestData(data){
    var obj = {};
    obj[STORAGE_KEYS.guest] = {
        "lang": data.lang,
        "need_punctuation": data.need_punctuation
    };
    enhant_local_storage_obj.save_basic(obj);

}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        
        if (request.msg == "capture_tab"){
            
            chrome.tabs.captureVisibleTab(
                null,
                {},
                function(dataUrl)
                {
                    var d_type = "image";

                    // save message to local storage 
                    var obj_to_add = enhant_local_storage_obj.generate_data_obj(dataUrl);
                    enhant_local_storage_obj.save(d_type, obj_to_add, function(data){
                        console.log("Local storage updated with obj : ", obj_to_add);
                    });

                    // add to local storage
                    sendResponse({data:obj_to_add, status: true});
                }
            );
        }

        if (request.msg == "save_bookmark"){
            var d_type = "bookmark";

            var obj_to_add = {};

            // get the last transcription from local storage
            enhant_local_storage_obj.read_multiple(["transcription"], function(results){
                var arr_transcription = results.transcription || [];

                var current_time = enhant_local_storage_obj.generateUnixTimestamp();
                var time_threshold_in_ms = CONFIG.bookmark.transcription_time_in_sec * 1000;

                var time_filtered_transcription = arr_transcription.filter(function(obj){ 
                    return obj["event_time"] > (current_time - time_threshold_in_ms);
                });
                
                var host_transcription = time_filtered_transcription.filter(function(obj){ 
                    return obj["origin"] == "host";
                });
                var guest_transcription = time_filtered_transcription.filter(function(obj){ 
                    return obj["origin"] == "guest";
                });

                if ((!host_transcription.length) && (!guest_transcription.length)){ 
                    var item = {
                        origin: "None",
                        content: request.data,
                        time: current_time
                    }
                    obj_to_add = enhant_local_storage_obj.generate_data_obj([item], current_time);
                }

                else {
                    
                    var bookmark_data = [];

                    if (host_transcription.length){

                        host_transcription.forEach(data => {
                            var obj = {
                                origin: "host", 
                                content: data["transcription"],
                                time: data["event_time"]
            
                            }
                            bookmark_data.push(obj);
                        });
                    }

                    if (guest_transcription.length){

                        guest_transcription.forEach(data => {
                            var obj = {
                                origin: "guest", 
                                content: data["transcription"],
                                time: data["event_time"]
            
                            }
                            bookmark_data.push(obj);
                        });
                    }

                    obj_to_add = enhant_local_storage_obj.generate_data_obj(bookmark_data, current_time);

                }

                enhant_local_storage_obj.save(d_type, obj_to_add, function(r){
                    console.log("Local storage updated with obj : ", r);

                    // add to local storage
                    sendResponse({data:obj_to_add, status: true});

                });

                
            })
        }

        if (request.msg == "save_notes"){
            var d_type = "notes";

            var obj_to_add = enhant_local_storage_obj.generate_data_obj(request.data);
            enhant_local_storage_obj.save(d_type, obj_to_add, function(data){
                console.log("Local storage updated with obj : ", obj_to_add);

                var response = {data:obj_to_add, status: true}

                sendResponse(response);
                
            });

           
        
        }

        if (request.msg == "start"){

            obj = {} 
            obj[STORAGE_KEYS.tab_id] = request.data;

            var meeting_start = {};
            meeting_start[STORAGE_KEYS.meeting_start_time] = enhant_local_storage_obj.generateUnixTimestamp();

            enhant_local_storage_obj.save_basic(obj);
            enhant_local_storage_obj.save_basic(meeting_start)

            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {msg: "capture-meeting-info"}, function(response) {
                  console.log(response.status);

                  saveMeetingNumber(response.data, function(){
                        // checkthe settings
                        enhant_local_storage_obj.read_multiple([STORAGE_KEYS.settings], function(result){

                            var settings_data = result[STORAGE_KEYS.settings];
                            if (settings_data){
                            sendResponse({
                                status: true,
                                settings: settings_data
                            });
                            }
                            else{
                                sendResponse({
                                    status: true,
                                    settings: {}
                                });
                            }
                            
                        });
                    });
                });
            });

        }

        if (request.msg == "stop"){
            downloadZip(function(){
                enhant_local_storage_obj.deleteAll();
            });

            // checkthe settings
            enhant_local_storage_obj.read_multiple([STORAGE_KEYS.settings], function(result){

                var settings_data = result[STORAGE_KEYS.settings];
                if (settings_data){
                   sendResponse({
                       status: true,
                       settings: settings_data
                   });
                }
                else{
                    sendResponse({
                        status: true,
                        settings: {}
                    });
                }
                
            });
        }

        if (request.msg == "meeting_number_info"){
            var meeting_number = request.data;
            var obj = {
                "meeting_number": meeting_number
            }

            enhant_local_storage_obj.save_basic(obj, function(d){

                var conv_id = enhant_local_storage_obj.generateRandomConvId();
                convIDMessageHandler(conv_id);

                // send meeting number to backend after a second so 
                // var json = backend_obj.createMeetingData(d.meeting_number);
                // backend_obj.sendDataToBackend(json);
            });

            sendResponse({status:true});
        }

        if (request.msg == "save_transcription"){

            /* of the format 
            {   transcription : text,
                event_time : unixtime,
                start_time : unixtime,
                end_time : unixtime,
                "origin" : host / guest
            }
            */
            var transcription_data = request.data;
            transcriptionMessageHandler(transcription_data);
            sendResponse({status:true});

        }

        if (request.msg == "settings_updated"){

            var changed_data = request.data;

            getSettings(function(storage_settings_data, passed_data){
                var obj = {};

                obj[STORAGE_KEYS.settings] = {
                    "power_mode": passed_data["power_mode"],
                    "server_url": passed_data["server_url"],
                    "lang": passed_data["lang"],
                    "urls": storage_settings_data["urls"]
                }

                enhant_local_storage_obj.save_basic(obj, function(){
                    // console.log("storage updated in local storage"); 
                    sendResponse({status:true, data: obj});
    
                });

            }, changed_data);
            
        }

        if (request.msg == "save-host-data"){
            var obj = request.data;
            saveHostData(obj);
            sendResponse({
                status: true
            });
        }

        if (request.msg == "get-settings"){

            getSettings(function(settings_data){
                sendResponse({
                    status: true,
                    settings: settings_data
                });
            });
        }

        if (request.msg == "add-url"){
            var url_to_add = request.data;
            enhant_local_storage_obj.add_url(url_to_add, function(url, status, err){
                sendResponse({url_added: url, status: status, error: err });
            });
            
        }

        if (request.msg == "remove-url"){
            var url_to_remove = request.data;
            console.log(" removing url ", url_to_remove);
            enhant_local_storage_obj.remove_url(url_to_remove, function(url, status, err){
                sendResponse({url_removed: url, status: status, error: err });
            });
            
        }

        return true;
        
    }
);

chrome.tabs.onRemoved.addListener(function(tabId, info) {
    
    // chrome.runtime.sendMessage({msg: "download_zip", data: null}, function(response) {
    // });

    chrome.storage.local.get(["tab_id"], function(result){

        if (result["tab_id"]){

            if (result["tab_id"] == tabId){

                try{
                    downloadZip(function(){
                
                        // clear all the data
                        enhant_local_storage_obj.deleteAll();
                    });
                }
                catch(error){
                    console.log("Encountered error : ", error);

                    // clear all the data
                    enhant_local_storage_obj.deleteAll();

                }
               
            }

        }
        else {
            // clear all the data
            enhant_local_storage_obj.deleteAll();
        }

    })

});