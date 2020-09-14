const ICONSTATE = {
    ACTIVE : "active",
    INACTIVE : "inactive"
}

class Icon{

    constructor(){

        this.clickable = true;
        this.state = ICONSTATE.INACTIVE;
        this.data_container_id = "data-container";
        this.container_id = null;

        this.active_color = "#1E90FF";
        this.inactive_color = "white";

        this.active_icon_path = null;
        this.inactive_icon_path = null;

        this.icon_disable_path = null;

        this.info_svg_path = "static/images/info.svg";

        this.hover_message_disabled = null;

        this.disabled = true;
        
    }

    disableIcon(){
        var icon_type = this.constructor.name;
        var icon = $('icon[type="' + icon_type +'"]');
        var icon_img = $('icon[type="' + icon_type +'"] img');

        icon_img.attr("src", this.icon_disable_path);

        icon.removeAttr("clickable");
        this.disabled = true;

    }

    changeTooltipText(text){
        var icon_type = this.constructor.name;
        var icon_img = $('icon[type="' + icon_type +'"] img');

        icon_img.attr("title", text);
    }

    enableIcon(){
        var icon_type = this.constructor.name;
        var icon = $('icon[type="' + icon_type +'"]');
        var icon_img = $('icon[type="' + icon_type +'"] img');

        icon_img.attr("src", this.active_icon_path);

        if (this.clickable){
            icon.attr("clickable", true);
        }

        this.disabled = false;
        
    }

    toggleIcon(){
        
        if ((this.active_icon_path !== null) && (this.inactive_icon_path !== null)){
            var icon_type = this.constructor.name;
            var icon = $('icon[type="' + icon_type +'"]');
            var icon_img = $('icon[type="' + icon_type +'"] img');
            var icon_background = icon.parent();

            if (this.state == ICONSTATE.ACTIVE){
                icon_background.css("background-color", this.active_color);
                icon_img.attr("src", this.inactive_icon_path);
            }
            else if (this.state == ICONSTATE.INACTIVE){
                icon_background.css("background-color", this.inactive_color);
                icon_img.attr("src", this.active_icon_path);
            }
        }
        
    }

    toggleState(){
        if (this.state == ICONSTATE.INACTIVE){
            this.state = ICONSTATE.ACTIVE;
        }
        else if(this.state == ICONSTATE.ACTIVE) {
            this.state = ICONSTATE.INACTIVE;
        }

        this.toggleIcon();

    }

    stateHandler(){
        this.toggleContainer();
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
            if (_this.state == ICONSTATE.ACTIVE){
                $('#' + _this.container_id).show();
                
            }
            if (_this.state == ICONSTATE.INACTIVE){
                $('#' + _this.container_id).hide();
            }
        }
    }

    handleClick(){
        this.toggleState();
        this.setLocalStorage();
        this.stateHandler();
    }

    getCurrentTime(unix_timestamp){
        var date = new Date(unix_timestamp);
        return date.getHours() + " : " + date.getMinutes();
    }

    sendMessageToBackground(request, cb){

        chrome.runtime.sendMessage({msg: request.msg, data: request.data}, function(response) {

            // console.log(" resquest | response ", request, response);
            cb(response);
        });
    }

    displayMessageOnIconHover(){
        var _this = this;
        var icon_type = this.constructor.name;
        if (this.hover_message_disabled !== null){
            $('icon[type="' + icon_type + '"]').hover(function(){

                // if plugin is disabled
                if (_this.disabled){
                    var hover_message = _this.hover_message_disabled;
                    var html = "<div class='clearfix'>" + 
                    "<div class='col-xs-2'>" + 
                    "<img width=20 height=20 src='/static/images/info.svg'>" +
                    "</div>" + 
                    "<div class='col-xs-10'>" +
                    "<span>" + hover_message+ "</span>" + 
                    "</div>" +
                    "</div>";

                    var event = new CustomEvent("showNotification", {
                        detail: {html: html, timeout_in_sec: 2}
                    });

                    window.dispatchEvent(event);
                }
            }, function(){});
        }
    }

    registerEvents(){
        var _this = this;
        window.addEventListener("pluginActivated", function(evt){
            _this.displayMessageOnIconHover();
        });
    }
}

class NotesIcon extends Icon{
    constructor(){
        super();
        this.container_id = "notes-container";

        this.submit_btn_id = "notes-submit";

        this.active_icon_path = "static/images/notes.svg";
        this.inactive_icon_path = "static/images/notes_inactive.svg";

        this.icon_disable_path = "static/images/notes_disabled.svg";

        this.hover_message_disabled = "Take note when recording.";
        
    }

    registerEvents(){
        super.registerEvents();
        var _this = this;
       
        $('#' + _this.submit_btn_id).click(function(){
            _this.addNotes();
        });

        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        
            if (message.cmd == "take-note"){
        
                // check if note is active
                if (_this.state == ICONSTATE.ACTIVE){
                    _this.addNotes();

                    sendResponse({status: true});
                }

                else{
                    sendResponse({status: false});
                }
                
                
            }
        
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

            // clear the container
            $("textarea").val('');

            var event = new CustomEvent("switchToIcon", {
                detail: {"from": NotesIcon.name, "to": ExpandIcon.name}
            });
            window.dispatchEvent(event);

        });

    }
}

class BookmarkIcon extends Icon{

    constructor(){
        super();
        this.active_icon_path = "static/images/bookmark.svg";
        this.inactive_icon_path = "static/images/bookmark_inactive.svg";

        this.icon_disable_path = "static/images/bookmark_disabled.svg";
        this.hover_message_disabled = "Bookmark moment when recording.";
    }

    generateBookmark(obj){

        // obj.content is array
        var p_html = "<p style='margin-top:auto;margin-bottom:auto;'>";

        console.log(" received data obj ", obj);

        var host_transcription = obj.content.filter(function(d){
            return d["origin"] == "host";
        });

        var guest_transcription = obj.content.filter(function(d){
            return d["origin"] == "guest";
        });

        // console.log(" host and guest transcription ", host_transcription, guest_transcription);

        if (!host_transcription.length && !guest_transcription.length){
            p_html += obj.content[0].content;
        }
        else{

            if (host_transcription.length){
                p_html += "Host : ";

                host_transcription.forEach(function(d){
                    p_html += d["content"];
                });
            }

            if (guest_transcription.length){
                p_html += "<br>";
                p_html += "Guest : ";

                guest_transcription.forEach(function(d){
                    p_html += d["content"];
                });
            }

        }

        p_html += "</p>";

        console.log(" p html ", p_html);

        return "<div class='parent-data row' style='margin-left:10%;padding-top:2%;padding-bottom:2%;align-items:center;display:flex;'>" + 
        "<div class='col-xs-1'><img src='static/images/bookmark.svg'></div>" +
        "<div class='col-xs-7'>" + p_html + "</div>" +
        "<div class='col-xs-3 align-self-center' style='color:#808080b5;'>" + this.getCurrentTime(obj.time) + "</div>" +
        "<div>";
    }


    bookMarkAdded(){
        var _this = this;
        setTimeout(
            function(){
                _this.toggleState();
                _this.stateHandler();
                _this.setLocalStorage();
            }, 50);

        var notification_html = "<div class='col-xs-2'>" +
            "<img title='Info' height=24 width=24 src='static/images/info.svg'>" +
        "</div>" + 
        "<div class='col-xs-10'>"+
            "<span>Moment bookmarked</span>" +
        "</div>";

        var event = new CustomEvent("showNotification", {
            detail: {html: notification_html, timeout_in_sec: 1}
        });
        window.dispatchEvent(event);
    }


    addBookMark(){
        var _this = this;

        _this.sendMessageToBackground({"msg": "save_bookmark", "data": "Moment Bookmarked."}, function(response){

            if (response.data){
                // add it to the data container
                var text_to_add = _this.generateBookmark(response.data);
                $('#'+_this.data_container_id).prepend(text_to_add);
            }
        });

        _this.bookMarkAdded();
        
    }

    handleClick(){
        this.toggleState();
        this.stateHandler();
        this.setLocalStorage();
        this.addBookMark();
    }
}

class CaptureTabIcon extends Icon{

    constructor(){
        super();
        this.active_icon_path = "static/images/capture.svg";
        this.inactive_icon_path = "static/images/capture_inactive.svg";

        this.icon_disable_path = "static/images/capture_disabled.svg";
        this.hover_message_disabled = "Capture screenshot when recording.";
    }

    capture(){
        var _this = this;
        this.sendMessageToBackground({"msg": "capture_tab", "data": null}, function(response){
            

            // response.url has the base64 image
            var html = _this.generateCapture(response.data);
            _this.addTabCapture(html);

        })

        _this.captureTaken();
    }

    captureTaken(){
        var _this = this;
        setTimeout(
            function(){
                _this.toggleState();
                _this.stateHandler();
                _this.setLocalStorage();
            }, 50);

        var notification_html = "<div class='col-xs-2'>" +
            "<img title='Info' height=24 width=24 src='static/images/info.svg'>" +
            "</div>" + 
            "<div class='col-xs-10'><span>Screenshot captured</span>" +
            "</div>";

        var event = new CustomEvent("showNotification", {
            detail: {html: notification_html, timeout_in_sec: 1}
        });

        window.dispatchEvent(event);
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
        this.toggleState();
        this.stateHandler();
        this.setLocalStorage();
        this.capture();
    }
}

/* Expand the data container view */
class ExpandIcon extends Icon{
    constructor(){
        super();
        this.container_id = "data-container";
        this.valid_data_types = ["notes", "bookmark", "image"]

        this.active_icon_path = "static/images/down_arrow.svg";
        this.inactive_icon_path = "static/images/down_arrow_inactive.svg";

        this.icon_disable_path = "static/images/down_arrow_disabled.svg";
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
            var p_html = "<p style='margin-top:auto;margin-bottom:auto;'>";

            var host_transcription = data.content.filter(function(d){
                return d["origin"] == "host";
            });

            var guest_transcription = data.content.filter(function(d){
                return d["origin"] == "guest";
            });

            // console.log(" host and guest transcription ", host_transcription, guest_transcription);

            if (!host_transcription.length && !guest_transcription.length){
                p_html += data.content[0].content;
            }
            else{

                if (host_transcription.length){
                    p_html += "Host : ";

                    host_transcription.forEach(function(d){
                        p_html += d["content"];
                    });
                }

                if (guest_transcription.length){
                    p_html += "<br>";
                    p_html += "Guest : ";

                    guest_transcription.forEach(function(d){
                        p_html += d["content"];
                    });
                }

            }

            p_html += "</p>";
            icon_html = "<div class='col-xs-1'><img src='static/images/bookmark.svg'></div>";

            content_html = "<div class='col-xs-7'>" + p_html + "</div>";
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

        // start the data with the function


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

    stateHandler(){
        this.toggleContainer();
        this.populateDataContainer();

    }

    handleClick(){
        this.toggleState();
        this.stateHandler();
        this.setLocalStorage();
    }
}

class SettingsIcon extends Icon{
    constructor(){
        super();
        this.server = "http://" + CONFIG.transcription.ip;
        this.enable_transcription_view_for_debug = false;
        this.power_mode = false;
        this.apply_btn_id = "settings-apply-btn";
        this.container_id = "settings-container";

        this.input_powermode_setting_id = "setting-enable-powermode";
        this.input_server_setting_id = "setting-server-url";
        this.langauge_id = "lang";

        this.language_code = CONFIG.transcription.lang_default;

        this.active_icon_path = "static/images/settings.svg";
        this.inactive_icon_path = "static/images/settings_inactive.svg";

        this.icon_disable_path = "static/images/settings_disabled.svg";
        this.hover_message_disabled = "Settings not available during recording.";
        
    }


    getLanguageCode(){
        var language = $('#'+ this.langauge_id + " option:selected").val();
        return language
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

    updatePowerModeCheckbox(state){
       $('#'+ this.input_powermode_setting_id).prop("checked", state);
    }

    updateLanguage(lang){
        $('#' + this.langauge_id + ' option[value="' + lang +'"]').prop('selected', 'selected').change();
    }

    settingsUpdateHandler(settings){

        var event = new CustomEvent("settingsUpdateHandler", {
            detail: settings
        });
		window.dispatchEvent(event);
    }

    registerEvents(){

        super.registerEvents();
        var _this = this;

        $('#' + _this.apply_btn_id).click(function(){

            _this.power_mode = _this.getPowerModeSetting();
            _this.server = _this.getServerURL();
            _this.language_code = _this.getLanguageCode();

            var d = {
                "power_mode": _this.power_mode,
                "lang": _this.language_code,
                "server_url": _this.server
            }

            chrome.runtime.sendMessage({msg: "settings_updated", data: d}, function(response){
                console.log("Settings updated status : ", response);

                var settings = response.data.settings;
                _this.settingsUpdateHandler(settings);

            });
            
        });

        // send request to get data
        chrome.runtime.sendMessage({msg: "get-settings"}, function(response){
                       
            if (response.settings){
                var powermode_state = response.settings.power_mode;
                _this.updatePowerModeCheckbox(powermode_state);
                _this.updateLanguage(response.settings.lang);
            }
        });
    }

}

class RecordIcon extends Icon{

    constructor(){
        super();
        this.recording = false;

        this.active_icon_path = "static/images/record.svg";
        this.inactive_icon_path = "static/images/record_inactive.svg";

        this.icon_disable_path = "static/images/record_disabled.svg";
    }

    reset(){
        this.recording = false;
    }

    toggleIcon(){
        var icon_type = this.constructor.name;
        var icon = $('icon[type="' + icon_type +'"]');
        var icon_img = $('icon[type="' + icon_type +'"] img');
        var icon_background = icon.parent();

        if (this.state == ICONSTATE.ACTIVE){
            // run animation switch between two icons
            icon_img.addClass("pulse-ring");
        
        }
        else if (this.state == ICONSTATE.INACTIVE){
            icon_img.removeClass("pulse-ring");
            icon_background.css("background-color", this.inactive_color);
            icon_img.attr("src", this.active_icon_path);
        }
    }

    startCapturingMicAudio(settings){

        //sends a message to the content page to capture the mic audio
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    
            // sends message to content script (main.js)
            chrome.tabs.sendMessage(tabs[0].id, {action: "capture_mic_start", data: settings}, function(response){
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
        });
    }

    meeting_started(){
        var _this = this;
        chrome.storage.local.set({"meeting_in_progress": true}, function(){
            console.log("meeting started flag set in storage .");

            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                var currTab = tabs[0];
                if (currTab) { 

                    chrome.runtime.sendMessage({msg: "start", data: currTab.id}, function(response){

                        _this.startCapturingMicAudio(response.settings);
                       
                        if (response.settings){

                            // fire setting handler event
                            var event = new CustomEvent("settingsUpdateHandler", {
                                detail: response.settings
                            });
                            window.dispatchEvent(event);
                        }
                    });

                }
            });
        })
    }

    meeting_stopped(){
        var _this = this;
        chrome.storage.local.set({"meeting_in_progress": false}, function(){
            console.log("meeting stopped flag set in storage .");

            chrome.runtime.sendMessage({msg: "stop"}, function(response){
                // console.log(response.status);

                _this.stopCapturingMicAudio();

                if (response.settings){

                    // fire setting handler event
                    var event = new CustomEvent("settingsUpdateHandler", {
                        detail: response.settings
                    });
                    window.dispatchEvent(event);
                }
            })
        });
    }


    start(){

        this.changeTooltipText("Stop recording");
        this.meeting_started();

        var event = new CustomEvent("enhant-start", {});
        window.dispatchEvent(event);
    }

    showZipDownloadNotification(){
        var notification_html = "<div class='col-xs-2'>" +
        "<img title='Info' height=24 width=24 src='static/images/info.svg'>" +
        "</div>" + 
        "<div class='col-xs-10'>"+
            "<span>Zip Downloaded</span>" +
        "</div>";

        var event = new CustomEvent("showNotification", {
            detail: {html: notification_html, timeout_in_sec: 1}
        });
        window.dispatchEvent(event);
    }

    stop(){
        this.changeTooltipText("Start recording");
        this.meeting_stopped();
        this.showZipDownloadNotification();

        var event = new CustomEvent("enhant-stop", {});
        window.dispatchEvent(event);

    }


    stateHandler(){
        this.toggleContainer();

        if (this.state == ICONSTATE.ACTIVE){
            var event = new CustomEvent("recordingStarted", {});
			window.dispatchEvent(event);
        }
        else if (this.state == ICONSTATE.INACTIVE){
            var event = new CustomEvent("recordingStopped", {});
			window.dispatchEvent(event);
        }
    }

    handleClick(){
        this.toggleState();
        this.setLocalStorage();
        this.stateHandler();

        // set the recording state based on icon state
        if (this.state == ICONSTATE.ACTIVE){
            this.recording = true;
            this.start();
        }
        else{
            this.recording = false;
            this.stop()
        }

    }


}

class PowerModeIcon extends Icon{
    constructor(){
        super();

        this.active_icon_path = "static/images/powermode.svg";
        this.inactive_icon_path = "static/images/powermode_inactive.svg";

        this.icon_disable_path = "static/images/powermode_disabled.svg";

        // powermode icon is not clickable
        this.clickable = false;

        this.recording = false;

        this.hover_message_disabled = "Power mode OFF. Enable it from settings.";
    }

    // dont toggle icon for powermode
    toggleIcon(){
    }

    startCapturingTabAudio(){
        chrome.runtime.sendMessage({action: "capture_screen_start"}, function(response){
            console.log("Tab recording status for start : ", response.status);
        });
    }

    stopCapturingTabAudio(){

        // stop the tab recording
        chrome.runtime.sendMessage({action: "capture_screen_stop"}, function(response){
            console.log("Tab recording status for stop : ", response.status);
        });
    }


    set_active(){
        this.state = ICONSTATE.ACTIVE;
        this.changeTooltipText("Power Mode ON");
    }

    set_inactive(){
        this.state = ICONSTATE.INACTIVE;
        this.changeTooltipText("Power Mode OFF");
    }

    stop(){
        if (this.recording){
            this.stopCapturingTabAudio();
            this.recording = false;
        }
    }

    start(){

        if (!(this.recording)){
            this.startCapturingTabAudio();

            this.recording = true;
        }
    }
}

class LogoIcon extends Icon{
    constructor(){
        super();
        this.clickable = false;

        this.active_icon_path = "static/images/logo_24.svg";
        this.icon_disable_path = "static/images/logo_24_disabled.svg";
    }
}

class SeparatorIcon extends Icon{
    constructor(){
        super();
        this.clickable = false;

        this.active_icon_path = "static/images/seperator_line.svg";
        this.icon_disable_path = "static/images/seperator_line_disabled.svg";
    }
}



