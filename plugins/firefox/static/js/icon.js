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

        this.icon_disabled_message = null;

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
            // console.log("State value set for : ", local_storage_data);
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

    displayMessageOnIconDisabled(){
        var _this = this;
        if (_this.disabled && _this.icon_disabled_message !== null){
            var disabled_message = _this.icon_disabled_message;
            var html = "<div class='clearfix'>" + 
            "<div class='col-xs-2'>" + 
            "<img width=20 height=20 src='/static/images/info.svg'>" +
            "</div>" + 
            "<div class='col-xs-10'>" +
            "<span>" + disabled_message+ "</span>" + 
            "</div>" +
            "</div>";

            var event = new CustomEvent("showNotification", {
                detail: {html: html, timeout_in_sec: 2}
            });

            window.dispatchEvent(event);
        }
    }

    registerEvents(){}

    // fires an event to start the meeting
    dispatchStart(){
        // fire setting handler event
        var event = new CustomEvent("triggerStart", {});
        window.dispatchEvent(event);
    }

    // gets the tab info data
    _getTabInfo(cb){
        chrome.runtime.sendMessage({msg: "tab_info"}, function(response){
            var obj = {
                "current_tab_id": response.current_tab_id,
                "tab_info": response.data
            }
            cb(obj);
        });
    }

    // get the current recording status into a dict
    getRecordingStatus(cb){

        // default state of recording data
        var recording_data = {
            "tabId": null,
            "currentTabId": null,
            "meeting_in_progress": false
        }

        this._getTabInfo(function(data){
            chrome.runtime.sendMessage({msg: "get-current-tabid"}, function(response){
                if (response.status){
                    recording_data["currentTabId"] = response.id;

                    var d_tab_info = data["tab_info"];
                    recording_data["tabId"] = d_tab_info["tabId"];;
                    recording_data["meeting_in_progress"] = d_tab_info["meeting_in_progress"];;

                    cb(recording_data);
                }
                else {
                    cb(recording_data);
                }
            });
        });
    }
}

class CollapseToolbarIcon extends Icon{

    constructor(){
        super();

        this.active_icon_path = "static/images/collapse.svg";
        this.inactive_icon_path = "static/images/expand.svg";

        this.icon_disable_path = "static/images/disable_collapse.svg";
    }

    toggleIcon(){
        
        if ((this.active_icon_path !== null) && (this.inactive_icon_path !== null)){
            var icon_type = this.constructor.name;
            var icon = $('icon[type="' + icon_type +'"]');
            var icon_img = $('icon[type="' + icon_type +'"] img');

            console.log(" state : ", this.state);

            if (this.state == ICONSTATE.ACTIVE){
                this.changeTooltipText("Expand Toolbar");
                icon_img.attr("src", this.inactive_icon_path);
            }
            else if (this.state == ICONSTATE.INACTIVE){
                this.changeTooltipText("Collpase Toolbar");
                icon_img.attr("src", this.active_icon_path);
            }
        }
        
    }

    handleClick(){
        super.handleClick();

        // Collpase is active
        if (this.state == ICONSTATE.ACTIVE){

            // send a message to collpase the toolbar based on the width
            var event = new CustomEvent("collapseToolbar", {});
            window.dispatchEvent(event);
        }
        // expand is active
        else {
            // send a message to content script to expand to full width
            var event = new CustomEvent("expandToolbar", {});
            window.dispatchEvent(event);
        }
    }
}

class NotesIcon extends Icon{
    constructor(){
        super();
        this.container_id = "notes-container";

        this.submit_btn_id = "notes-submit";

        this.voice_btn_id = "notes-voice-btn";
        this.voice_btn_text_id = "notes-voice-icn-text";
        this.voice_active = false;

        this.active_icon_path = "static/images/notes.svg";
        this.inactive_icon_path = "static/images/notes_inactive.svg";

        this.icon_disable_path = "static/images/notes_disabled.svg";

        this.icon_disabled_message = "Take note enabled when recording.";

        this.final_text = ""
        
    }

    stopAnimation(){
        $('#' + this.voice_btn_text_id).text("Tap to speak");
        $('#' + this.voice_btn_id).removeClass("pulse-ring");
    }

    startAnimation(){
        $('#' + this.voice_btn_text_id).text("Tap to stop");
        $('#' + this.voice_btn_id).addClass("pulse-ring");
    }

    handleVoice(){

        var _this = this;

        if (_this.voice_active){
            _this.stopAnimation();
            _this.voice_active = false;
        }
        else{

            // dispatch the start meeting event if required
            _this.getRecordingStatus(function(recording_data){

                // dispatch start event if meeting not in progress
                if (!recording_data.meeting_in_progress){
                    _this.dispatchStart();
                }
                
            });

            _this.startAnimation();
            _this.voice_active = true;
            _this.final_text = "";
        }
    }

    registerEvents(){
        super.registerEvents();
        var _this = this;
       
        $('#' + _this.submit_btn_id).click(function(){
            _this.addNotes();
        });

        $('#' + _this.voice_btn_id).on("click", function(){
            _this.handleVoice();
        });

        window.addEventListener("stopAudioNotes", function(event){
            _this.final_text = "";
            $("textarea").val("");
            _this.handleVoice();
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

        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

            // console.log(" listner for notes - - - - - ", request);
            if (request.msg == "transcription_notes") {

                // dispatch the start meeting event if required
                _this.getRecordingStatus(function(recording_data){

                    // meeting not in progress, clear the previous text
                    if (!recording_data["meeting_in_progress"]){

                        _this.final_text = "";
                        $("textarea").val(_this.final_text);
                    }
                    else{
                        if (_this.voice_active){

                            var transcription_data = request.data;
        
                            if (transcription_data.is_final){
        
                                _this.final_text += transcription_data["transcription"]
        
                                // add transcription to note textarea
                                $('textarea').val("");
                                $('textarea').val(_this.final_text);
                            }
                            else{
                                $('textarea').val(_this.final_text + transcription_data["transcription"]);
                            }
                        }
                    }
                    
                });
            }
        });
    }

    generateNote(obj){
        return "<div class='parent-data row' style='margin-left:4%;padding-top:2%;padding-bottom:2%;align-items:center;display:flex;'>" + 
        "<div class='col-xs-1'><img src='static/images/notes.svg'></div>" +
        "<div class='col-xs-7'><p style='margin-top:auto;margin-bottom:auto;'>" + obj.content + "</p>" + "</div>" +
        "<div class='col-xs-2 align-self-center' style='color:#808080b5;margin-left:10px;padding-left:0px;'>" + this.getCurrentTime(obj.time) + "</div>" +
        "<div class='delete-note' timestamp='" + obj.time +"' style='padding-left:0px;cursor:pointer;' class='col-xs-1'><img width=25 src='static/images/trash.svg'></div>" +
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
            _this.final_text = ""
            $("textarea").val(_this.final_text);

            // stop the voice active when note is added
            if (_this.voice_active){
                _this.handleVoice();
            }


            var event = new CustomEvent("switchToIcon", {
                detail: {"from": NotesIcon.name, "to": ExpandIcon.name}
            });
            window.dispatchEvent(event);

        });


        // when note is added.. dispatch the start meeting event if required
        _this.getRecordingStatus(function(recording_data){

            // dispatch start event if meeting not in progress
            if (!recording_data["meeting_in_progress"]){
                _this.dispatchStart();
            }
            
        });

    }

    handleClick(){
        var _this = this
        super.handleClick();

        _this.getRecordingStatus(function(recording_data){

            // dispatch start event if meeting not in progress
            if (!recording_data["meeting_in_progress"]){
               
                // stop the animation (which might come from unclean stop if page reloaded)
                _this.stopAnimation();
            }
            
        });

    }
}

class BookmarkIcon extends Icon{

    constructor(){
        super();
        this.active_icon_path = "static/images/bookmark.svg";
        this.inactive_icon_path = "static/images/bookmark_inactive.svg";

        this.icon_disable_path = "static/images/bookmark_disabled.svg";
        this.icon_disabled_message = "Bookmark moment enabled when recording.";
    }

    generateBookmark(obj){

        // obj.content is array
        var p_html = "<p style='margin-top:auto;margin-bottom:auto;'>";

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

        return "<div class='parent-data row' style='margin-left:4%;padding-top:2%;padding-bottom:2%;align-items:center;display:flex;'>" + 
        "<div class='col-xs-1'><img src='static/images/bookmark.svg'></div>" +
        "<div class='col-xs-7'>" + p_html + "</div>" +
        "<div class='col-xs-2 align-self-center' style='color:#808080b5;margin-left:10px;padding-left:0px;'>" + this.getCurrentTime(obj.time) + "</div>" +
        "<div class='delete-note' timestamp='" + obj.time +"' style='padding-left:0px;cursor:pointer;' class='col-xs-1'><img width=25 src='static/images/trash.svg'></div>" +
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

            console.log(" response bookmark  : ", response);

            if (response.data){
                // add it to the data container
                var text_to_add = _this.generateBookmark(response.data);
                $('#'+_this.data_container_id).prepend(text_to_add);
            }
        });

        _this.bookMarkAdded();
        
    }

    handleClick(){

        var _this = this;
       
        _this.toggleState();
        _this.stateHandler();
        _this.setLocalStorage();

        _this.getRecordingStatus(function(recording_data){

            // dispatch start event if meeting not in progress
            if (!recording_data["meeting_in_progress"]){
                _this.dispatchStart();
            }

            _this.addBookMark();
            
        });
    }
}

class CameraIcon extends Icon{

    constructor(){
        super();
        this.container_id = "camera-toolbar";
        this.active_icon_path = "static/images/capture.svg";
        this.inactive_icon_path = "static/images/capture_inactive.svg";

        this.icon_disable_path = "static/images/capture_disabled.svg";
        this.icon_disabled_message = "Capture screenshot enabled when recording.";
        
        this.camera_classes = [
            CaptureTabIcon, 
            CaptureSelectedAreaIcon
        ]

        this.camera_icons = [];
    }

    enableIcon(){
        super.enableIcon();
        var _this = this;
        this.camera_classes.forEach(function(cls){
            var obj = new cls();
            _this.camera_icons[cls.name] = obj;
            obj.enableIcon();
        });
    }

    disableIcon(){
        super.disableIcon();
        var _this = this;
        this.camera_classes.forEach(function(cls){
            var obj = new cls();
            _this.camera_icons[cls.name] = obj;
            obj.disableIcon();
        });
    }
    
}

class CaptureTabIcon extends Icon{

    constructor(){
        super();
        this.active_icon_path = "static/images/capture_full.svg";
        this.inactive_icon_path = "static/images/capture_full_inactive.svg";

        this.icon_disable_path = "static/images/capture_full_disabled.svg";
        this.icon_disabled_message = "Capture screenshot enabled when recording.";
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
        return "<div class='parent-data row' style='margin-left:4%;padding-top:2%;padding-bottom:2%;align-items:center;display:flex;'>" + 
        "<div class='col-xs-1'><img src='static/images/capture.svg'></div>" +
        "<div class='col-xs-7'><img width=200px src='" + obj.content + "'></div>" +
        "<div class='col-xs-2 align-self-center' style='color:#808080b5;margin-left:10px;padding-left:0px;'>" + this.getCurrentTime(obj.time) + "</div>" +
        "<div class='delete-note' timestamp='" + obj.time +"' style='padding-left:0px;cursor:pointer;' class='col-xs-1'><img width=25 src='static/images/trash.svg'></div>" +
        "<div>";
    }
    
    addTabCapture(html){
        var _this = this;
        $('#'+_this.data_container_id).prepend(html);
    }

    handleClick(){
        var _this = this;
        this.getRecordingStatus(function(recording_data){

            // dispatch start event if meeting not in progress
            if (!recording_data["meeting_in_progress"]){
                _this.dispatchStart();
            }
            
        });
        
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
        this.icon_disabled_message = "View captured data when recording.";

        this.delete_note_btn_class = "delete-note";
    }

    registerEvents(){
        var _this = this;
        $("#" + this.container_id).on("click", "." + this.delete_note_btn_class , function(){
            var timestamp = $(this).attr("timestamp");

            // send the timestamp to the background for deletion
            _this.sendMessageToBackground({
                "msg": "delete-note",
                "data": {"timestamp": timestamp}
            }, function(results){

                if (results.status){
                    _this.populateDataContainer();
                }
            });

            // call populate container again
        });
    }

    reset(){
        $('#' +this.data_container_id).html("");
    }

    generateHTMLContainerData(data){

        var d_type = data["type"];
        var icon_html = "";
        var content_html = "";
        var delete_html = "<div class='"+ this.delete_note_btn_class +"' timestamp='" + data.time +"' style='padding-left:0px;cursor:pointer;' class='col-xs-1'><img width=25 src='static/images/trash.svg'></div>";

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
        
        return "<div class='parent-data row' style='margin-left:4%;padding-top:2%;padding-bottom:2%;align-items:center;display:flex;'>" + 
        icon_html +
        content_html +
        "<div class='col-xs-2 align-self-center' style='color:#808080b5;margin-left:10px;padding-left:0px;'>" + this.getCurrentTime(data.time) + "</div>" +
        delete_html +
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
        this.power_mode = CONFIG.power_mode;
        this.apply_btn_id = "settings-apply-btn";
        this.container_id = "settings-container";

        this.input_powermode_setting_id = "setting-enable-powermode";
        this.input_server_setting_id = "setting-server-url";
        this.langauge_id = "lang";

        this.language_code = CONFIG.transcription.lang_default;

        this.active_icon_path = "static/images/settings.svg";
        this.inactive_icon_path = "static/images/settings_inactive.svg";

        this.icon_disable_path = "static/images/settings_disabled.svg";
        this.icon_disabled_message = "Settings not available during recording.";
        
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
        this.languaged_updated_from_previous_setting = true;
        $('#' + this.langauge_id + ' option[value="' + lang +'"]').prop('selected', 'selected').change({
            internal: true
        });
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

        $('#' + _this.langauge_id).change(function(evt){

            // check if selected value is en-IN
            var language = $('#'+ _this.langauge_id + " option:selected").val();

            // if not internally changed via updateLanguage
            if ((!evt.data)){
                if (language == "en-IN"){
                    var notification_html = "<div class='col-xs-2'>" +
                    "<img title='Info' height=24 width=24 src='static/images/info.svg'>" +
                    "</div>" + 
                    "<div class='col-xs-10'><span>English (India) language works best with google transcription service.</span>" +
                    "</div>";
                    var event = new CustomEvent("showNotification", {
                        detail: {html: notification_html, timeout_in_sec: 2}
                    });
                    window.dispatchEvent(event);
                }
            }
        });

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
        this.inactive_icon_path = "static/images/record_blinking.svg";

        this.icon_disable_path = "static/images/record_disabled.svg";
    }

    registerEvents(){

        var _this =  this;
        window.addEventListener("triggerStart", function(event){
            _this.handleClick();
        });

        window.addEventListener("triggerStop", function(event){
            _this.handleClick();
        });
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
            icon_img.attr("src", this.inactive_icon_path);
        
        }
        else if (this.state == ICONSTATE.INACTIVE){
            icon_img.attr("src", this.active_icon_path);
        }
    }

    meeting_started(){
        var _this = this;

        _this._getTabInfo(function(result){
            chrome.runtime.sendMessage({msg: "start", data: result.current_tab_id}, function(response){

                if (response.mic_error !== null){

                    var _window = window;

                    setTimeout(function(){
                        var notification_html = "<div class='col-xs-2'>" +
                        "<img title='Info' height=24 width=24 src='static/images/info.svg'>" +
                        "</div>" + 
                        "<div class='col-xs-10'><span>" + response.mic_error +"</span>" +
                        "</div>";

                        var event = new CustomEvent("showNotification", {
                            detail: {html: notification_html, timeout_in_sec: 8 }
                        });

                        _window.dispatchEvent(event);
                    }, 1000);
                    
                }

                chrome.runtime.sendMessage({msg: "save-host-data", data: response.mic_settings}, function(r){
                    console.log("Host data saved : ", r.status);
                });
               
                if (response.settings){
    
                    // fire setting handler event
                    var event = new CustomEvent("settingsUpdateHandler", {
                        detail: response.settings
                    });
                    window.dispatchEvent(event);
                }
            });
        });
        
    }

    meeting_stopped(){
        var _this = this;

        _this._getTabInfo(function(result){

            chrome.runtime.sendMessage({msg: "stop", data: result.current_tab_id}, function(response){
                // console.log(response.status);
    
                // _this.stopCapturingMicAudio();
    
                if (response.settings){
    
                    // fire setting handler event
                    var event = new CustomEvent("settingsUpdateHandler", {
                        detail: response.settings
                    });
                    window.dispatchEvent(event);
                }
            });
        });
    }


    start(){

        var _this = this;
        this.changeTooltipText("End");

        // check if recording active on another tab
        this.getRecordingStatus(function(recording_data){

            if (recording_data["meeting_in_progress"]){

                if(recording_data["tabId"] !== recording_data["currentTabId"]){
                    var notification_html = "<div class='col-xs-2'>" +
                    "<img title='Info' height=24 width=24 src='static/images/info.svg'>" +
                    "</div>" +
                    "<div class='col-xs-10'>"+
                    "<span>Recording is already active on another tab.</span>" +
                    "</div>";

                    var event = new CustomEvent("showNotification", {
                        detail: {html: notification_html, timeout_in_sec: 3}
                    });
                    window.dispatchEvent(event);
                }
                else{
                    _this.meeting_started();
                }
            }
            else{
                _this.meeting_started();
            }

        });

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
        // this.changeTooltipText("Start");
        this.meeting_stopped();
        this.showZipDownloadNotification();

        var event = new CustomEvent("stopAudioNotes", {});
        window.dispatchEvent(event);

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

    _handleClick(){
        var _this = this;
        _this.toggleState();
        _this.setLocalStorage();
        _this.stateHandler();

        // set the recording state based on icon state
        if (_this.state == ICONSTATE.ACTIVE){
            _this.recording = true;
            _this.start();
        }
        else{
            _this.recording = false;
            _this.stop()
        }
    }

    handleClick(){

        var _this  = this;
        _this._handleClick();
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

        this.icon_disabled_message = "Power mode OFF. Enable it from settings.";
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

    // No support for Tab audio in firefox
    stop(){
        // this.stopCapturingTabAudio();
    }

    // No support for Tab audio in firefox
    start(){
        // this.startCapturingTabAudio();
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


class AnnotationIconBase extends Icon{
    constructor(){
        super();
    }

    changeTooltipText(text){
        var icon_type = this.constructor.name;
        var icon_img = $('iconAnnotation[type="' + icon_type +'"] img');

        icon_img.attr("title", text);
    }

    toggleIcon(){
        if ((this.active_icon_path !== null) && (this.inactive_icon_path !== null)){
            var icon_type = this.constructor.name;

            // console.log(" toggle icon ", icon_type);
            var icon = $('iconAnnotation[type="' + icon_type +'"]');
            var icon_img = $('iconAnnotation[type="' + icon_type +'"] img');
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

    disableIcon(){
        var icon_type = this.constructor.name;
        var icon = $('iconAnnotation[type="' + icon_type +'"]');
        var icon_img = $('iconAnnotation[type="' + icon_type +'"] img');

        icon_img.attr("src", this.icon_disable_path);

        icon.removeAttr("clickable");
        this.disabled = true;
    }

    enableIcon(){
        var icon_type = this.constructor.name;
        var icon = $('iconAnnotation[type="' + icon_type +'"]');
        var icon_img = $('iconAnnotation[type="' + icon_type +'"] img');

        icon_img.attr("src", this.active_icon_path);

        if (this.clickable){
            icon.attr("clickable", true);
        }

        this.disabled = false;
    }
}

class SelectAnnotationIcon extends AnnotationIconBase{
    constructor(){
        super();
        this.active_icon_path = "static/images/select_annotation.svg";
        this.inactive_icon_path = "static/images/select_annotation_inactive.svg";
    }

    handleClick(){
        super.handleClick();
        window.parent.postMessage(
            {
                "id": "frame2", 
                "key": "activate_tool",
                "sender": "enhant",
                "tool_info": {
                    "name": "Select",
                    "data": {}
                }
            }, "*")
    }
}

class PenAnnotationIcon extends AnnotationIconBase{
    constructor(){
        super();
        this.active_icon_path = "static/images/pen_annotation.svg";
        this.inactive_icon_path = "static/images/pen_annotation_inactive.svg";

        this.container_id = "color-toolbar-paint";

        this.color_click_event_registered = false;

        this.pen_cursor = "static/images/pen_canvas_cursor.svg";

        this.selected_color = "#000000";
        this.selected_color_img_tag= $('iconPaint[value="' + this.selected_color +'"]').find("img");
    }
    

    addSelectedColorClass(){
        this.selected_color_img_tag.css({
            "border": "2px solid " + this.selected_color,
            "border-radius": "50%",
            "padding": "1px"
        });
    }

    removeSelectedColorClass(){
        this.selected_color_img_tag.css({
            "border": "",
            "border-radius": "",
            "padding": ""
        });
    }

    registerColorIconClick(){
        var _this = this;
        $("iconPaint").click(function(){
            var colorCode = $(this).attr("value");

            // remove selected color
            _this.removeSelectedColorClass();

            _this.selected_color_img_tag = $(this).find("img");
            _this.selected_color = colorCode;

            // select new color
            _this.addSelectedColorClass();

            if (_this.state == ICONSTATE.ACTIVE){
                window.parent.postMessage(
                    {
                        "id": "frame2", 
                        "key": "update_tool",
                        "sender": "enhant",
                        "tool_info": {
                            "name": "Pen",
                            "data": {
                                "color": colorCode
                            }
                        }
                    }, "*")
            }
        });
        _this.color_click_event_registered = true;
    }

    handleClick(){
        var _this = this;
        super.handleClick();

        if (this.state == ICONSTATE.ACTIVE){

            $("#" + this.container_id).show();
            if (!this.color_click_event_registered){
                this.registerColorIconClick();
            }

            window.parent.postMessage(
                {
                    "id": "frame2", 
                    "key": "activate_tool",
                    "sender": "enhant",
                    "tool_info": {
                        "name": "Pen",
                        "data": {
                        }
                    }
                }, "*")
        }
        else{
            $("#" + this.container_id).hide();
            window.parent.postMessage(
                {
                    "id": "frame2", 
                    "key": "deactivate_tool",
                    "sender": "enhant",
                    "tool_info": {
                        "name": "Pen",
                        "data": {
                        }
                    }
                }, "*")
        }
    }
    
}

class HighlightAnnotationIcon extends AnnotationIconBase{
    constructor(){
        super();
        this.active_icon_path = "static/images/highlight_annotation.svg";
        this.inactive_icon_path = "static/images/highlight_annotation_inactive.svg";

        this.color_click_event_registered = false;
        this.container_id = "color-toolbar-highlight";

        this.highlight_cursor = "static/images/highlight_canvas_cursor.svg";

        this.selected_color = "#FFCF74";
        this.selected_color_img_tag= $('iconHighlight[value="' + this.selected_color +'"]').find("img");
    }

    addSelectedColorClass(){
        this.selected_color_img_tag.css({
            "border": "2px solid " + this.selected_color,
            "border-radius": "50%",
            "padding": "1px"
        });
    }

    removeSelectedColorClass(){
        this.selected_color_img_tag.css({
            "border": "",
            "border-radius": "",
            "padding": ""
        });
    }

    registerColorIconClick(){
        var _this = this;
        $("iconHighlight").click(function(){
            var colorCode = $(this).attr("value");

            // remove selected color
            _this.removeSelectedColorClass();

            _this.selected_color_img_tag = $(this).find("img");
            _this.selected_color = colorCode;

            // select new color
            _this.addSelectedColorClass();

            if (_this.state == ICONSTATE.ACTIVE){
                window.parent.postMessage(
                    {
                        "id": "frame2", 
                        "key": "update_tool",
                        "sender": "enhant",
                        "tool_info": {
                            "name": "Highlight",
                            "data": {
                                "color": colorCode
                            }
                        }
                    }, "*")
            }
        });
        _this.color_click_event_registered = true;
    }

    handleClick(){
        var _this = this;
        super.handleClick();

        if (this.state == ICONSTATE.ACTIVE){
            $("#" + this.container_id).show();
            if (!this.color_click_event_registered){
                this.registerColorIconClick();
            }
            window.parent.postMessage(
                {
                    "id": "frame2", 
                    "key": "activate_tool",
                    "sender": "enhant",
                    "tool_info": {
                        "name": "Highlight",
                        "data": {
                        }
                    }
                }, "*")
        }
        else{
            $("#" + this.container_id).hide();

            window.parent.postMessage(
                {
                    "id": "frame2", 
                    "key": "deactivate_tool",
                    "sender": "enhant",
                    "tool_info": {
                        "name": "Highlight",
                        "data": {
                        }
                    }
                }, "*")
        }
    }
}

class EyeAnnotationIcon extends AnnotationIconBase{
    constructor(){
        super();
        this.active_icon_path = "static/images/eye_opened_annotation.svg";
        this.inactive_icon_path = "static/images/eye_closed_annotation.svg";
    }

    handleClick(){
        var _this = this;
        super.handleClick();

        if (_this.state == ICONSTATE.ACTIVE){
            _this.changeTooltipText("Show Annotations");
            window.parent.postMessage(
                {
                    "id": "frame2", 
                    "key": "activate_tool",
                    "sender": "enhant",
                    "tool_info": {
                        "name": "Eye",
                        "data": {}
                    }
                }, "*")
        }
        else {
            _this.changeTooltipText("Hide Annotations");
            window.parent.postMessage(
                {
                    "id": "frame2", 
                    "key": "deactivate_tool",
                    "sender": "enhant",
                    "tool_info": {
                        "name": "Eye",
                        "data": {}
                    }
                }, "*")
        }
    }
}

class DeleteAnnotationIcon extends AnnotationIconBase{
    constructor(){
        super();
        this.active_icon_path = "static/images/delete_annotation.svg";
        this.inactive_icon_path = "static/images/delete_annotation_inactive.svg";
    }

    handleClick(){
        var _this = this;
        super.handleClick();

        setTimeout(
            function(){
                _this.toggleState();
                _this.setLocalStorage();
                _this.stateHandler();

                window.parent.postMessage(
                    {
                        "id": "frame2", 
                        "key": "deactivate_tool",
                        "sender": "enhant",
                        "tool_info": {
                            "name": "Delete",
                            "data": {}
                        }
                    }, "*")
        }, 50);

        window.parent.postMessage(
            {
                "id": "frame2", 
                "key": "activate_tool",
                "sender": "enhant",
                "tool_info": {
                    "name": "Delete",
                    "data": {}
                }
            }, "*")
    }
}

class TextAnnotationIcon extends AnnotationIconBase{
    constructor(){
        super();
        this.active_icon_path = "static/images/text_annotation.svg";
        this.inactive_icon_path = "static/images/text_annotation_inactive.svg";

        this.color_click_event_registered = false;
        this.container_id = "color-toolbar-text";

        this.selected_color = "#000000";
        this.selected_color_img_tag= $('iconText[value="' + this.selected_color +'"]').find("img");
    }

    addSelectedColorClass(){
        this.selected_color_img_tag.css({
            "border": "2px solid " + this.selected_color,
            "border-radius": "50%",
            "padding": "1px"
        });
    }

    removeSelectedColorClass(){
        this.selected_color_img_tag.css({
            "border": "",
            "border-radius": "",
            "padding": ""
        });
    }

    registerColorIconClick(){
        var _this = this;
        $("iconText").click(function(){
            var colorCode = $(this).attr("value");

            // remove selected color
            _this.removeSelectedColorClass();

            _this.selected_color_img_tag = $(this).find("img");
            _this.selected_color = colorCode;

            // select new color
            _this.addSelectedColorClass();

            if (_this.state == ICONSTATE.ACTIVE){
                window.parent.postMessage(
                    {
                        "id": "frame2", 
                        "key": "update_tool",
                        "sender": "enhant",
                        "tool_info": {
                            "name": "Text",
                            "data": {
                                "color": colorCode
                            }
                        }
                    }, "*")
            }
        });
        _this.color_click_event_registered = true;
    }

    handleClick(){
        var _this = this;
        super.handleClick();

        if (_this.state == ICONSTATE.ACTIVE){
            $("#" + _this.container_id).show();
            if (!_this.color_click_event_registered){
                _this.registerColorIconClick();
            }
            window.parent.postMessage(
                {
                    "id": "frame2", 
                    "key": "activate_tool",
                    "sender": "enhant",
                    "tool_info": {
                        "name": "Text",
                        "data": {}
                    }
                }, "*")
        }
        else{
            $("#" + this.container_id).hide();

            window.parent.postMessage(
                {
                    "id": "frame2", 
                    "key": "deactivate_tool",
                    "sender": "enhant",
                    "tool_info": {
                        "name": "Text",
                        "data": {}
                    }
                }, "*")
        }
    }
}

class EraseAnnotationIcon extends AnnotationIconBase{
    constructor(){
        super();
        this.active_icon_path = "static/images/erase_annotation.svg";
        this.inactive_icon_path = "static/images/erase_annotation_inactive.svg";
    }

    handleClick(){
        var _this = this;
        super.handleClick();

        if (_this.state == ICONSTATE.ACTIVE){
            window.parent.postMessage(
                {
                    "id": "frame2", 
                    "key": "activate_tool",
                    "sender": "enhant",
                    "tool_info": {
                        "name": "Erase",
                        "data": {}
                    }
                }, "*")
        }
        else{
            window.parent.postMessage(
                {
                    "id": "frame2", 
                    "key": "deactivate_tool",
                    "sender": "enhant",
                    "tool_info": {
                        "name": "Erase",
                        "data": {}
                    }
                }, "*")
        }
    }
}

class CaptureSelectedAreaIcon extends AnnotationIconBase{

    constructor(){
        super();
        this.active_icon_path = "static/images/crop.svg";
        this.inactive_icon_path = "static/images/crop_inactive.svg";
    }

    handleClick(){
        var _this = this;
        super.handleClick();


        if (_this.state == ICONSTATE.ACTIVE){
            window.parent.postMessage(
                {
                    "id": "frame2", 
                    "key": "activate_tool",
                    "sender": "enhant",
                    "tool_info": {
                        "name": "CaptureSelectedArea",
                        "data": {}
                    }
                }, "*")
        }
        else{
            window.parent.postMessage(
                {
                    "id": "frame2", 
                    "key": "deactivate_tool",
                    "sender": "enhant",
                    "tool_info": {
                        "name": "CaptureSelectedArea",
                        "data": {}
                    }
                }, "*")
        }
    }
}


class AnnotationIcon extends Icon{
    constructor(){
        super();

        this.container_id = "annotation-toolbar";

        this.active_icon_path = "static/images/annotation.svg";
        this.inactive_icon_path = "static/images/annotation_inactive.svg";

        this.icon_disable_path = "static/images/annotation_disabled.svg";

        this.icon_disabled_message = "Annotate enabled when recording.";

        this.annotation_icon_classes = [
            SelectAnnotationIcon,
            PenAnnotationIcon,
            HighlightAnnotationIcon,
            EyeAnnotationIcon,
            TextAnnotationIcon,
            DeleteAnnotationIcon,
            EraseAnnotationIcon,
            CaptureSelectedAreaIcon
        ]

        this.default_activated_cls = SelectAnnotationIcon;

        this.annotation_icons = {};

        this.currently_active_icon_obj = null;

        this.registerClickForAnnotationIcons();
    }

    hideOtherIconWindow(icon_type){
        var _this = this;
        for (const prop in _this.annotation_icons){
            if (!(prop == icon_type)){
                var icon_obj = _this.annotation_icons[prop];

                if ((icon_obj.state == ICONSTATE.ACTIVE)){
                    icon_obj.toggleState();
                    icon_obj.setLocalStorage();
                    icon_obj.stateHandler();
                }
            }

        }
    }

    intializeAnnotationIcons(){
        var _this = this;
        this.annotation_icon_classes.forEach(function(cls){
            var obj = new cls();
            _this.annotation_icons[cls.name] = obj;
            obj.enableIcon();
            
            // initilize with the default selected
            if (cls.name == _this.default_activated_cls.name){
                _this.currently_active_icon_obj = obj;
                obj.handleClick();
            }
        });
    }

    registerClickForAnnotationIcons(){
        var _this = this;
        $('iconAnnotation').click(function(e){
            var icon_type = $(this).attr("type");

            // Hack: Enable annotationIcon as one of its sub icons is used
            // from cameraIcon
            _this.state = ICONSTATE.ACTIVE;

            var icon_obj = _this.annotation_icons[icon_type];
            _this.currently_active_icon_obj = icon_obj;
            _this.hideOtherIconWindow(icon_type);
            icon_obj.handleClick();
        });

        // listen to add recording and send a delete command
    }

    // as soon as annotation is enabled.. create the canvas
    enableIcon(){
        super.enableIcon();
        this.intializeAnnotationIcons();

        window.parent.postMessage(
            {
                "id": "frame2", 
                "key": "annotation_active",
                "sender": "enhant",
                "tool_info": {}
                
            }, "*")
    }

    //remove the canvas when it disables
    disableIcon(){
        super.disableIcon();

        window.parent.postMessage(
            {
                "id": "frame2", 
                "sender": "enhant",
                "key": "annotation_inactive",
                "tool_info": {}
            }, "*")
    }

    activateLastSelected(){

        if (this.currently_active_icon_obj.state == ICONSTATE.INACTIVE){
            this.currently_active_icon_obj.handleClick();
        }
    }

    deactivateLastSelected(){
        if (this.currently_active_icon_obj.state == ICONSTATE.ACTIVE){
            this.currently_active_icon_obj.handleClick();
        }
       
    }

    toggleAnnotationIcons(){
        var _this = this;
        if (_this.state == ICONSTATE.ACTIVE){
            _this.activateLastSelected();
        }
        else{
            _this.deactivateLastSelected();
        }
    }

    stateHandler(){
        this.toggleContainer();
        this.toggleAnnotationIcons();
    }
}




