function hideNotification(){
    $('#notification').hide();
}

function showNotification(html, timeout_in_sec){
    $('#notification').show();
    $('#notification-content').html(html);

    setTimeout(function(){
        hideNotification();
    }, timeout_in_sec * 1000);
}

function powermodeIconHandler(data){
    if (data.powermode){

        // show the powermode
        $('icon[type="PowerModeIcon"]').removeAttr("should_disable");
    }
    else{

        // disable the powermode
        $('icon[type="PowerModeIcon"]').attr("should_disable", true);
    }
}

// listener and variables for sending drag information to parent 
var drag = false;
var startX = 0;
var startY = 0;

const _DRAG_START = "DRAG_START";
const _DRAG_MOVE = "DRAG_MOVE";
const _DRAG_STOP = "DRAG_STOP";

function sendMouseCoordinatesToParent(msg, data){

    var iframe_to_parent_msg =  {
        "id": "parent", 
        "key": "iframe_mouse_drag",
        "msg": msg,
        "sender": "enhant",
        "input": data
    }

    window.parent.postMessage(iframe_to_parent_msg, "*")
}

function enhantDragMouseDown(evt){
    // only left click
    if (evt.which == 1){
        drag = true;

        evt.preventDefault();

        startX = evt.clientX;
        startY = evt.clientY;

        var data = {
            startX: startX,
            startY: startY
        };

        sendMouseCoordinatesToParent(_DRAG_START ,data);

        document.addEventListener("mouseup", enhantDragMouseUp);
        document.addEventListener("mousemove", enhantDragMouseMove);
    }
}

function enhantDragMouseUp(evt){
    drag = false;

    sendMouseCoordinatesToParent(_DRAG_STOP, {});

    document.removeEventListener("mouseup", enhantDragMouseUp);
    document.removeEventListener("mousemove", enhantDragMouseMove);

}

function enhantDragMouseMove(evt){
    if (drag){
        var offset_data = {
            offsetX : evt.clientX - startX,
            offsetY: evt.clientY - startY
        }

        sendMouseCoordinatesToParent(_DRAG_MOVE, offset_data);

        //! IMPORTANT
        // This is a hack (if offset > 10px) the toolbar starts shacking
        // because the postmessage seems to be slower than mousemovement
        // if ((Math.abs(offset_data.offsetX) < 10) && (Math.abs(offset_data.offsetY) < 10)){
        //     sendMouseCoordinatesToParent(_DRAG_MOVE, offset_data);
        // }
    
    }

}

$(document).ready(function(){

    var icons = [
        LogoIcon,
        SeparatorIcon,
        NotesIcon,
        ExpandIcon,
        BookmarkIcon,
        CaptureTabIcon,
        SettingsIcon,
        RecordIcon,
        PowerModeIcon,
        AnnotationIcon
    ];

    var exceptions = [LogoIcon.name, SeparatorIcon.name];

    var icons_object_mapping = {};
    var pluginActivated = false;

    // register the classes and events
    icons.forEach(function(cl){

        var obj = new cl();
        obj.registerEvents();
        icons_object_mapping[cl.name] = obj;

        // exceptions disable everything
        if (exceptions.indexOf(cl.name) == -1){
            obj.disableIcon();
        }
    });

    // send a message  to background to check if tab id is same and meeting in progress
    // this would mean a redirect happened

    chrome.runtime.sendMessage({msg: "tab_info"}, function(response){

        var tab_info = response.data;

        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            var current_tab_id = tabs[0].id;

            if (tab_info.hasOwnProperty("tabId")){

                var lastTabId = tab_info.tabId;
                var meeting_in_progress = tab_info.meeting_in_progress;

                if (lastTabId == current_tab_id){
                    if (meeting_in_progress){
                        var record_icon_obj = icons_object_mapping[RecordIcon.name];
                        record_icon_obj.stateHandler();
                        record_icon_obj.stop();
                        record_icon_obj.enableIcon();
                    }
                }
            }
        });
    });

    //activate listner on enhant logo for drag
    // var el = document.getElementById("drag_enhant");

    document.querySelectorAll('.drag_enhant').forEach(item => {
        item.addEventListener("mousedown", enhantDragMouseDown);
    })
   

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log(" Received message from browser action [Activate plugin] : ", message);
    
        if (message.cmd == "activate_plugin"){

            pluginActivated = true;

            var event = new CustomEvent("pluginActivated", {});
            window.dispatchEvent(event);

            // enable these icons
            var iconsToEnable = [
                LogoIcon,
                SeparatorIcon,
                RecordIcon,
                SettingsIcon,
                AnnotationIcon
            ];
            
            hideNotification();

            iconsToEnable.forEach(function(cl){
                var icon_obj = icons_object_mapping[cl.name];
                icon_obj.enableIcon();
            });
    
            sendResponse({status: true});
    
        }

    });

    function hideOtherIconWindow(icon_type){

        for (const prop in icons_object_mapping){
            if (!(prop == icon_type)){
                var icon_obj = icons_object_mapping[prop];

                var exception_classes = [RecordIcon.name, PowerModeIcon.name];
                
                // Record Icon and powermode icon state will  only be set to inactive when the record icon is clicked
                if ((icon_obj.state == ICONSTATE.ACTIVE) && (exception_classes.indexOf(prop) == -1)){
                    icon_obj.toggleState();
                    icon_obj.setLocalStorage();
                    icon_obj.stateHandler();

                }

                // console.log(" icon state after hiding : ", prop, icon_obj.state);
            }

        }
    }

    function switchToIcon(data){

        var hideIconClass = data.from;
        var showIconClass = data.to;

        if (icons_object_mapping.hasOwnProperty(showIconClass)){
            var icon_obj = icons_object_mapping[showIconClass];
            hideOtherIconWindow(showIconClass);
            icon_obj.enableIcon();
            icon_obj.handleClick();
        }
       
    }

    // set click handler
    $('icon').click(function(){

        var is_icon_clickable = $(this).attr("clickable");

        if (is_icon_clickable !== undefined){

            // get the icon type
            var icon_type = $(this).attr("type");

            var icon_obj = icons_object_mapping[icon_type];

            if (icon_type == BookmarkIcon.name || icon_type == CaptureTabIcon.name){

                var exception_classes = [ExpandIcon.name, AnnotationIcon.name];
                var exception_classes_active = exception_classes.filter(function(cls){
                    var obj = icons_object_mapping[cls];
                    return obj.state == ICONSTATE.ACTIVE
                });

                if (exception_classes_active.length > 0){

                    // check if Expand icon is active
                    var expand_icon_class = ExpandIcon.name;
                    var expand_icon_obj = icons_object_mapping[expand_icon_class];
                        
                    // if expand is not active then hide other icons
                    if (expand_icon_obj.state == ICONSTATE.ACTIVE){
                        expand_icon_obj.populateDataContainer();
                    }

                }
                else{
                    hideOtherIconWindow(icon_type);
                }

                icon_obj.handleClick();
                
            }
            else{

                hideOtherIconWindow(icon_type);
                icon_obj.handleClick();
            }
        }
        else{
            if (pluginActivated){
                // get the icon type
                var icon_type = $(this).attr("type");

                var icon_obj = icons_object_mapping[icon_type];
                icon_obj.displayMessageOnIconDisabled();
            }
        }
    
    });

    window.addEventListener("recordingStopped", function(event){
       var iconsToDisable = [
           BookmarkIcon,
           CaptureTabIcon,
           NotesIcon,
           ExpandIcon
       ];

       var iconsToEnable = [
           SettingsIcon,
           AnnotationIcon
       ];

        iconsToDisable.forEach(function(cl){
            var icon_obj = icons_object_mapping[cl.name];
            icon_obj.disableIcon();
        });

        iconsToEnable.forEach(function(cl){
            var icon_obj = icons_object_mapping[cl.name];
            icon_obj.enableIcon();
        });
    });

    window.addEventListener("recordingStarted", function(event){
        var iconsToEnable = [
            BookmarkIcon,
            CaptureTabIcon,
            NotesIcon,
            AnnotationIcon,
            ExpandIcon
        ];

        var iconsToDisable = [
            SettingsIcon
        ];
 
        iconsToEnable.forEach(function(cl){
             var icon_obj = icons_object_mapping[cl.name];
             icon_obj.enableIcon();

        });

        iconsToDisable.forEach(function(cl){
            var icon_obj = icons_object_mapping[cl.name];
            icon_obj.disableIcon();
        });
    });

    window.addEventListener("switchToIcon", function(event){
        var data = event.detail;
        switchToIcon(data);
    });

    window.addEventListener("settingsUpdateHandler", function(event){

        var settings_data = event.detail;
        var icon_obj = icons_object_mapping[PowerModeIcon.name];

        hideOtherIconWindow(PowerModeIcon.name);

        // check if recorder in active state
        var recorder_obj = icons_object_mapping[RecordIcon.name];

        if (settings_data.power_mode){
            icon_obj.enableIcon();
            icon_obj.set_active();

            if (recorder_obj.state == ICONSTATE.ACTIVE){
                icon_obj.start();
            }
            else{
                icon_obj.stop();
            }
           
        }
        else{

            icon_obj.disableIcon();
            icon_obj.set_inactive();

            if (recorder_obj.state == ICONSTATE.ACTIVE){
                icon_obj.stop();
            }
        }
    });

    window.addEventListener("showNotification", function(event){
        var data = event.detail;
        showNotification(data.html, data.timeout_in_sec);
    });

    window.addEventListener("enhant-stop", function(event){
        var iconsToDisable = [
            BookmarkIcon,
            CaptureTabIcon,
            NotesIcon
        ];
        
        iconsToDisable.forEach(function(cl){
            var icon_obj = icons_object_mapping[cl.name];
            icon_obj.disableIcon();
        });
    });
});
