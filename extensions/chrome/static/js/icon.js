class Icon{
    constructor(){
        this.state = "inactive";
        this.data_container_id = "data-container";
        this.container_id = null
    }

    toggleState(){
        if (this.state == "inactive"){
            this.state = "active";
        }
        else {
            this.state = "inactive";
        }
    }

    hideContainer(){
        var _this = this;
        if (!(_this.container_id == null)){
            $('#' + _this.container_id).hide();
        }
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

    getCurrentTime(){
        var date = new Date();
        return date.getHours() + " : " + date.getMinutes();
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

    generateNote(){
        var note = $('textarea').val();

        return "<div class='parent-data row' style='margin-left:10%;padding-top:2%;padding-bottom:2%;align-items:center;display:flex;'>" + 
        "<div class='col-xs-1'><img src='static/images/notes.svg'></div>" +
        "<div class='col-xs-7'><p style='margin-top:auto;margin-bottom:auto;'>" + note + "</p>" + "</div>" +
        "<div class='col-xs-3 align-self-center' style='color:#808080b5;'>" + this.getCurrentTime() + "</div>" +
        "<div>";
    }

    addNotes(){
        var _this = this;
        // get the notes here

        // add it to the data container
        $('#'+_this.data_container_id).prepend(_this.generateNote());
    }
}

class BookmarkIcon extends Icon{

    generateBookmark(){
        return "<div class='parent-data row' style='margin-left:10%;padding-top:2%;padding-bottom:2%;align-items:center;display:flex;'>" + 
        "<div class='col-xs-1'><img src='static/images/bookmark.svg'></div>" +
        "<div class='col-xs-7'><p style='margin-top:auto;margin-bottom:auto;'>Moment Bookmarked</p>" + "</div>" +
        "<div class='col-xs-3 align-self-center' style='color:#808080b5;'>" + this.getCurrentTime() + "</div>" +
        "<div>";
    }

    addBookMark(){
        var _this = this;
        $('#'+_this.data_container_id).prepend(_this.generateBookmark());
    }

    handleClick(){
        this.addBookMark();
    }
}

class CaptureTab extends Icon{

    generateCapture(){
        return "<div class='parent-data row' style='margin-left:10%;padding-top:2%;padding-bottom:2%;align-items:center;display:flex;'>" + 
        "<div class='col-xs-1'><img src='static/images/capture.svg'></div>" +
        "<div class='col-xs-7'><img src='static/images/icon.png'></div>" +
        "<div class='col-xs-3 align-self-center' style='color:#808080b5;'>" + this.getCurrentTime() + "</div>" +
        "<div>";
    }
    
    addTabCapture(){
        var _this = this;
        $('#'+_this.data_container_id).prepend(_this.generateCapture());
    }

    handleClick(){
        this.addTabCapture();
    }
}

/* Expand the data container view */
class ExpandIcon extends Icon{
    constructor(){
        super();
        this.container_id = "data-container";
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
        chrome.runtime.sendMessage({action: "capture_screen_stop"}, function(response){
            console.log("Local recording status : ", response.status);
        })
    }


    start(){
        this.startCapturingMicAudio();
        this.startCapturingTabAudio();
    }

    stop(){
        this.stopCapturingMicAudio();
        this.stopCapturingTabAudio();
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



