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

$(document).ready(function(){

    var registered_classes = [
        LogoIcon,
        SeparatorIcon,
        NotesIcon,
        ExpandIcon,
        BookmarkIcon,
        CaptureTabIcon,
        SettingsIcon,
        RecordIcon,
        PowerModeIcon
    ];

    var icons_object_mapping = {};

    // register the classes and events
    registered_classes.forEach(function(cl){

        var obj = new cl();
        obj.registerEvents();
        icons_object_mapping[cl.name] = obj;

        obj.disableIcon();

    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log(" Received message from browser action [Activate plugin] : ", message);
    
        if (message.cmd == "activate_plugin"){

            var event = new CustomEvent("pluginActivated", {});
            window.dispatchEvent(event);

            // enable these icons
            var iconsToEnable = [
                LogoIcon,
                SeparatorIcon,
                RecordIcon,
                SettingsIcon,
                ExpandIcon
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

                icon_obj.handleClick();

                // check if Expand icon is active
                var expand_icon_class = ExpandIcon.name;
                if (icons_object_mapping.hasOwnProperty(expand_icon_class)){
                    var expand_icon_obj = icons_object_mapping[expand_icon_class];
                    
                    // if expand is not active then hide other icons
                    if (expand_icon_obj.state == ICONSTATE.INACTIVE){
                        hideOtherIconWindow(icon_type);
                    }

                    else{

                        expand_icon_obj.populateDataContainer();
                       
                    }
                }
            }
            else{

                hideOtherIconWindow(icon_type);
                icon_obj.handleClick();
            }
        }
    
    });

    window.addEventListener("recordingStopped", function(event){
       var iconsToDisable = [
           BookmarkIcon,
           CaptureTabIcon,
           NotesIcon
       ];

       var iconsToEnable = [
           SettingsIcon
       ]

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
            NotesIcon
        ];

        var iconsToDisable = [
            SettingsIcon
        ]
 
        iconsToEnable.forEach(function(cl){
             var icon_obj = icons_object_mapping[cl.name];
             icon_obj.enableIcon();
        });

        iconsToDisable.forEach(function(cl){
            var icon_obj = icons_object_mapping[cl.name];
            icon_obj.disableIcon();
        })

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
