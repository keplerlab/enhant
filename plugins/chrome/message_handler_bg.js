var enhant_local_storage_obj = new EnhantLocalStorage();
var backend_obj = new BackendHandler();

// TODO: connect to backend (should be moved to power mode);
// backend_obj.connectToBackend();

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
                    })

                    // add to local storage
                    sendResponse({data:obj_to_add});
                }
            );
        }

        if (request.msg == "save_bookmark"){
            var d_type = "bookmark";

            var obj_to_add = enhant_local_storage_obj.generate_data_obj(request.data);
            enhant_local_storage_obj.save(d_type, obj_to_add, function(data){
                console.log("Local storage updated with obj : ", obj_to_add);
                
                // add to local storage
                sendResponse({data:obj_to_add});
            });

        }

        if (request.msg == "save_notes"){
            var d_type = "notes";

            var obj_to_add = enhant_local_storage_obj.generate_data_obj(request.data);
            enhant_local_storage_obj.save(d_type, obj_to_add, function(data){
                console.log("Local storage updated with obj : ", obj_to_add);

                sendResponse({data:obj_to_add});
                
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
                chrome.tabs.sendMessage(tabs[0].id, {msg: "start"}, function(response) {
                  console.log(response.status);
                });
            });

           
            sendResponse({status:true});
        }

        if (request.msg == "stop"){
            downloadZip(function(){
                enhant_local_storage_obj.deleteAll();
            });

            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {msg: "stop"}, function(response) {
                  console.log(response.status);
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
        
                sendResponse({status:true});
            })
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

        }
        
        return true;
        
    }
);

chrome.tabs.onRemoved.addListener(function(tabId, info) {
    
    // chrome.runtime.sendMessage({msg: "download_zip", data: null}, function(response) {
    // });

    chrome.storage.local.get(["tab_id"], function(result){

        console.log(" tab id matching ", result["tab_id"], tabId);

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