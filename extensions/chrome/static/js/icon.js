class Icon{
    constructor(){
        this.state = "inactive";
        this.data_container_id = "data-container";
        this.container_id = null;
    }

    toggleState(){
        if (this.state == "inactive"){
            this.state = "active";
        }
        else {
            this.state = "inactive";
        }

        this.setLocalStorage();

    }

    hideContainer(){
        var _this = this;
        if (!(_this.container_id == null)){
            $('#' + _this.container_id).hide();
        }
    }

    setLocalStorage(){
        var className = this.constructor.name;
        var state = this.state;
        var local_storage_data = {};
        local_storage_data[className] = state;

        chrome.storage.local.set(local_storage_data, function() {
            console.log("State value set for : ", local_storage_data);
        });
    }

    getLocalStorage(key, cb){
        chrome.storage.local.get([key], function(result) {
            cb(result[key]);
        });
    }

    toggleContainer(){

        var _this = this;
        
        if (!(_this.container_id == null)){
            if (_this.state == "active"){
                $('#' + _this.container_id).show();
                
            }
            if (_this.state == "inactive"){
                $('#' + _this.container_id).hide();
            }
        }
    }

    handleClick(){
        this.toggleState();
        this.toggleContainer();
    }

    getCurrentTime(unix_timestamp){
        var date = new Date(unix_timestamp * 1000);
        return date.getHours() + " : " + date.getMinutes();
    }

    sendMessageToBackground(request, cb){
        chrome.runtime.sendMessage({msg: request.msg, data: request.data}, function(response) {
            cb(response);
        });
    }

    registerEvents(){}
}

class NotesIcon extends Icon{
    constructor(){
        super();
        this.container_id = "notes-container";

        this.submit_btn_id = "notes-submit";
    }

    registerEvents(){
        var _this = this;
        $('#' + _this.submit_btn_id).click(function(){
            _this.addNotes();
        });
    }

    generateNote(obj){

        return "<div class='parent-data row' style='margin-left:10%;padding-top:2%;padding-bottom:2%;align-items:center;display:flex;'>" + 
        "<div class='col-xs-1'><img src='static/images/notes.svg'></div>" +
        "<div class='col-xs-7'><p style='margin-top:auto;margin-bottom:auto;'>" + obj.content + "</p>" + "</div>" +
        "<div class='col-xs-3 align-self-center' style='color:#808080b5;'>" + this.getCurrentTime(obj.time) + "</div>" +
        "<div>";
    }

    addNotes(){
        var _this = this;
        // get the notes here

        var note = $('textarea').val();

        _this.sendMessageToBackground({"msg": "save_notes", "data": note}, function(response){
            // add it to the data container
            $('#'+_this.data_container_id).prepend(_this.generateNote(response.data));
        });
    }
}

class BookmarkIcon extends Icon{

    generateBookmark(obj){
        return "<div class='parent-data row' style='margin-left:10%;padding-top:2%;padding-bottom:2%;align-items:center;display:flex;'>" + 
        "<div class='col-xs-1'><img src='static/images/bookmark.svg'></div>" +
        "<div class='col-xs-7'><p style='margin-top:auto;margin-bottom:auto;'>Moment Bookmarked</p>" + "</div>" +
        "<div class='col-xs-3 align-self-center' style='color:#808080b5;'>" + this.getCurrentTime(obj.time) + "</div>" +
        "<div>";
    }

    addBookMark(){
        var _this = this;

        _this.sendMessageToBackground({"msg": "save_bookmark", "data": "Bookmarked Moment"}, function(response){

            // add it to the data container
            $('#'+_this.data_container_id).prepend(_this.generateBookmark(response.data));
        });
        
    }

    handleClick(){
        this.addBookMark();
    }
}

class CaptureTab extends Icon{

    capture(){
        var _this = this;
        this.sendMessageToBackground({"msg": "capture_tab", "data": null}, function(response){

            // response.url has the base64 image
            var html = _this.generateCapture(response.data);
            _this.addTabCapture(html);

        })
    }

    // use chrome tabcapture here
    generateCapture(obj){
        
        return "<div class='parent-data row' style='margin-left:10%;padding-top:2%;padding-bottom:2%;align-items:center;display:flex;'>" + 
        "<div class='col-xs-1'><img src='static/images/capture.svg'></div>" +
        "<div class='col-xs-7'><img width=200px src='" + obj.content + "'></div>" +
        "<div class='col-xs-3 align-self-center' style='color:#808080b5;'>" + this.getCurrentTime(obj.time) + "</div>" +
        "<div>";
    }
    
    addTabCapture(html){
        var _this = this;
        $('#'+_this.data_container_id).prepend(html);
    }

    handleClick(){
        this.capture();
    }
}

/* Expand the data container view */
class ExpandIcon extends Icon{
    constructor(){
        super();
        this.container_id = "data-container";
        this.valid_data_types = ["notes", "bookmark", "image"]
    }

    reset(){
        $('#' +this.data_container_id).html("");
    }

    generateHTMLContainerData(data){

        var d_type = data["type"];
        var icon_html = "";
        var content_html = "";

        if (d_type == this.valid_data_types[0]){
            icon_html = "<div class='col-xs-1'><img src='static/images/notes.svg'></div>";
            content_html = "<div class='col-xs-7'><p style='margin-top:auto;margin-bottom:auto;'>" + data.content + "</p>" + "</div>"
        }
        else if (d_type == this.valid_data_types[1]){
            icon_html = "<div class='col-xs-1'><img src='static/images/bookmark.svg'></div>";
            content_html = "<div class='col-xs-7'><p style='margin-top:auto;margin-bottom:auto;'>Moment Bookmarked</p>" + "</div>";
        }
        else{
            icon_html = "<div class='col-xs-1'><img src='static/images/capture.svg'></div>";
            content_html =  "<div class='col-xs-7'><img width=200px src='" + data.content + "'></div>";
        }
        
        return "<div class='parent-data row' style='margin-left:10%;padding-top:2%;padding-bottom:2%;align-items:center;display:flex;'>" + 
        icon_html +
        content_html +
        "<div class='col-xs-3 align-self-center' style='color:#808080b5;'>" + this.getCurrentTime(data.time) + "</div>" +
        "<div>";
    }

    populateDataContainer(){
        var _this = this;

        _this.reset();

        chrome.storage.local.get(_this.valid_data_types, function(result){

            var combined_data_arr = [];

            var arr_notes = result[_this.valid_data_types[0]] || [];
            arr_notes.forEach(function(obj){
                obj["type"] = _this.valid_data_types[0];
                combined_data_arr.push(obj);
            })

            var arr_bookmark =  result[_this.valid_data_types[1]] || [];
            arr_bookmark.forEach(function(obj){
                obj["type"] = _this.valid_data_types[1];
                combined_data_arr.push(obj);
            })

            var arr_images = result[_this.valid_data_types[2]] || [];
            arr_images.forEach(function(obj){
                obj["type"] = _this.valid_data_types[2];
                combined_data_arr.push(obj);
            })

            // sort combined array in descending order
            combined_data_arr.sort(function(a, b){
                var keyA = new Date(a.time*1000);
                var keyB = new Date(b.time*1000);
                if (keyA < keyB) return -1;
                if (keyA > keyB) return 1;
                return 0;
            })

            combined_data_arr.forEach(function(data){
                $('#'+_this.data_container_id).prepend(_this.generateHTMLContainerData(data));
            })

            
        })
    }

    handleClick(){
        this.toggleState();
        this.toggleContainer();
        this.populateDataContainer();
    }
}

class SettingsIcon extends Icon{
    constructor(){
        super();
        this.server = "https://12.0.0.1";
        this.enable_transcription_view_for_debug = false;
        this.power_mode = false;
        this.apply_btn_id = "settings-apply-btn";
        this.container_id = "settings-container";

        this.input_powermode_setting_id = "setting-enable-powermode";
        this.input_transcription_setting_id = "setting-show-trasncription";
        this.input_server_setting_id = "setting-server-url";
    }

    getTranscriptionSetting(){
        var _this = this;
        var input_status = $('#'+ _this.input_transcription_setting_id + ":checkbox:checked").length > 0;
        return input_status;
    }

    getServerURL(){
        var _this = this;
        var server_url = $('#'+ _this.input_server_setting_id).val();
        return server_url;
    }

    getPowerModeSetting(){
        var _this = this;
        var input_status = $('#'+ _this.input_powermode_setting_id + ":checkbox:checked").length > 0;
        return input_status;
    }

    registerEvents(){
        var _this = this;
        $('#' + _this.apply_btn_id).click(function(){

            _this.power_mode = _this.getPowerModeSetting();
            _this.enable_transcription_view_for_debug = _this.getTranscriptionSetting();
            _this.server = _this.getServerURL();

            console.log(" setting applied : ", _this.power_mode, _this.enable_transcription_view_for_debug,
            _this.server);
            
        });
    }


}

class RecordIcon extends Icon{

    constructor(){
        super();
        this.recording = false;
    }

    reset(){
        this.recording = false;
    }

    startCapturingMicAudio(){

        //sends a message to the content page to capture the mic audio
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    
            // sends message to content script (main.js)
            chrome.tabs.sendMessage(tabs[0].id, {action: "capture_mic_start"}, function(response){
                console.log("Mic recording status : ", response.status);
            });
    
        });

    }

    stopCapturingMicAudio(){
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {

            // sends message to content script (main.js)
            chrome.tabs.sendMessage(tabs[0].id, {action: "capture_mic_stop"}, function(response){
                console.log("Local recording status : ", response.status);
            })
        })
    }

    startCapturingTabAudio(){
        chrome.runtime.sendMessage({action: "capture_screen_start"}, function(response){
            console.log("Tab recording status : ", response.status);
        })
    }

    stopCapturingTabAudio(){

        // stop the tab recording
        // chrome.runtime.sendMessage({action: "capture_screen_stop"}, function(response){
        //     console.log("Local recording status : ", response.status);
        // })
    }

    meeting_started(){
        chrome.storage.local.set({"start": true}, function(){
            console.log("meeting started flag set in storage .");

            showIcons();

            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                var currTab = tabs[0];
                if (currTab) { 

                    chrome.runtime.sendMessage({msg: "start", data: currTab.id}, function(response){
                        // console.log(response.status);
                    })

                }
            });

            
        })
    }

    meeting_stopped(){
        chrome.storage.local.set({"stop": true}, function(){
            console.log("meeting stopped flag set in storage .");

            hideIcons();

            chrome.runtime.sendMessage({msg: "stop"}, function(response){
                // console.log(response.status);
            })
        })
    }


    start(){
        this.meeting_started();
        // this.startCapturingMicAudio();
        // this.startCapturingTabAudio();
    }

    stop(){
        this.meeting_stopped();
        // this.stopCapturingMicAudio();
        // this.stopCapturingTabAudio();
    }

    handleClick(){
        this.toggleState();

        // set the recording state based on icon state
        if (this.state == "active"){
            this.recording = true;
            this.start();
        }
        else{
            this.recording = false;
            this.stop()
        }

    }


}


