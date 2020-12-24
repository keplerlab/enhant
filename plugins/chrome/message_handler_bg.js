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
            var current_time = enhant_local_storage_obj.generateUnixTimestamp();

            var item = {
                origin: "None",
                content: request.data,
                time: current_time
            }
            obj_to_add = enhant_local_storage_obj.generate_data_obj([item], current_time);

            enhant_local_storage_obj.save(d_type, obj_to_add, function(r){
                console.log("Local storage updated with obj : ", r);

                // add to local storage
                sendResponse({data:obj_to_add, status: true});

            });
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

            //saves tab info
            var obj = {} 
            obj[STORAGE_KEYS.tab_info] = {
                tabId: request.data,
                meeting_in_progress: true
            };

            enhant_local_storage_obj.save_basic(obj);

            var meeting_start = {};
            meeting_start[STORAGE_KEYS.meeting_start_time] = enhant_local_storage_obj.generateUnixTimestamp();

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

            // update tabInfo
            enhant_local_storage_obj.read_multiple([STORAGE_KEYS.tab_info, STORAGE_KEYS.settings], function(result){

                var settings_data = result[STORAGE_KEYS.settings];
                var tab_info_data = result[STORAGE_KEYS.tab_info];
                var new_data = {};
                new_data[STORAGE_KEYS.tab_info] = {
                    tabId: tab_info_data.tabId,
                    meeting_in_progress: false
                }

                enhant_local_storage_obj.save_basic(new_data, function(){

                    // download the zip
                    downloadZip(function(){
                        enhant_local_storage_obj.deleteAll();
                    });

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

        if (request.msg == "transcription_realtime"){

            chrome.runtime.sendMessage({
                msg: "transcription_notes", 
                data: request.data
            });

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
            // console.log(" removing url ", url_to_remove);
            enhant_local_storage_obj.remove_url(url_to_remove, function(url, status, err){
                sendResponse({url_removed: url, status: status, error: err });
            });
        }

        if (request.msg == "save_enhant_position"){
            var obj = {};
            obj[STORAGE_KEYS.enhant_position] = request.data;
            enhant_local_storage_obj.save_basic(obj, function(){
                // console.log("storage updated in local storage"); 
                sendResponse({status:true, data: obj});
            });
        };

        if (request.msg == "get_enhant_position"){
            enhant_local_storage_obj.read_multiple([STORAGE_KEYS.enhant_position], function(result){

                var position_data = result[STORAGE_KEYS.enhant_position];
                sendResponse({
                    status: true,
                    data: position_data || {}
                });
            });
        }

        if (request.msg == "tab_info"){

            enhant_local_storage_obj.read_multiple([STORAGE_KEYS.tab_info], function(result){

                var tab_info = result[STORAGE_KEYS.tab_info];
                sendResponse({
                    status: true,
                    data: tab_info || {}
                });
            });
        }
        return true;
    }
);

chrome.tabs.onRemoved.addListener(function(tabId, info) {
    
    // chrome.runtime.sendMessage({msg: "download_zip", data: null}, function(response) {
    // });

    chrome.storage.local.get(["tab_info"], function(result){

        var tab_info = result.tab_info;

        if (!isEmpty(tab_info)){

            var stored_tab_id = tab_info.tabId;
            if (stored_tab_id == tabId){

                if (tab_info.meeting_in_progress){

                    // console.log("storage updated in local storage"); 
                    try{
                        downloadZip(function(){

                            //saves tab info
                            var obj = {} 
                            obj[STORAGE_KEYS.tab_info] = {
                                tabId: tab_info.tabId,
                                meeting_in_progress: false
                            };

                            enhant_local_storage_obj.save_basic(obj, function(){
                                
                                // clear all the data
                                enhant_local_storage_obj.deleteAll();
                            })
                    
                        });
                    }
                    catch(error){
                        console.log("Encountered error : ", error);

                        // clear all the data
                        //saves tab info
                        var obj = {} 
                        obj[STORAGE_KEYS.tab_info] = {
                            tabId: tab_info.tabId,
                            meeting_in_progress: false
                        };

                        enhant_local_storage_obj.save_basic(obj, function(){
                            
                            // clear all the data
                            enhant_local_storage_obj.deleteAll();
                        })

                    }
                }
                else{
                    // clear all the data
                    enhant_local_storage_obj.deleteAll();
                }
            }
        }
    });

});