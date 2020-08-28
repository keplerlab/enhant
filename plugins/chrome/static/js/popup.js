function hideIcons(){
    $('icon[hidden]').hide();
}

function showIcons(){
    $('icon[hidden]').show();
}

$(document).ready(function(){

    var registered_classes = [
        NotesIcon,
        ExpandIcon,
        BookmarkIcon,
        CaptureTab,
        SettingsIcon,
        RecordIcon,
        PowerModeIcon
    ];

    var icons_events_registered = [];

    var icons_object_mapping = {};

    hideIcons();

    function activateIcon(data){

        var hideIconClass = data.from;
        var showIconClass = data.to;

        if (icons_object_mapping.hasOwnProperty(showIconClass)){
            var icon_obj = icons_object_mapping[showIconClass];
            hideOtherIconWindow(showIconClass);
            icon_obj.handleClick();
        }
       
    }

    window.addEventListener("hideIcons", function(event){
        hideIcons();
    });

    window.addEventListener("showIcons", function(event){
        showIcons();
    });

    window.addEventListener("activateIcon", function(event){
        var data = event.detail;
        activateIcon(data);
    })

    registered_classes.forEach(function(cl){

        var obj = new cl();
        icons_object_mapping[cl.name] = obj;

        // get state from local storage
        obj.getLocalStorage(cl.name, function(value){
            
            // if active toggle the state - and call statehandler
            // console.log(" checking local storage for ", cl.name , value);
            if (value == ICONSTATE.ACTIVE){
                obj.toggleState();
                obj.stateHandler();
            }
        });

        // togglecontainer based on storage data
    });
    
    function hideOtherIconWindow(icon_type){

        for (const prop in icons_object_mapping){
            if (!(prop == icon_type)){
                var icon_obj = icons_object_mapping[prop];
                
                // Record Icon state will  only be set to inactive when the record icon is clicked
                if ((icon_obj.state == ICONSTATE.ACTIVE) && (prop !== RecordIcon.name)){
                    icon_obj.toggleState();
                    icon_obj.setLocalStorage();
                    icon_obj.stateHandler();

                }

                // console.log(" icon state after hiding : ", prop, icon_obj.state);
            }

        }
    }

    $('icon').click(function(){

        // get the icon type
        var icon_type = $(this).attr("type");

        var icon_obj = icons_object_mapping[icon_type];
        hideOtherIconWindow(icon_type);
        icon_obj.handleClick();

        // make sure event is registered only once
        if (icons_events_registered.indexOf(icon_type) == -1){
            icon_obj.registerEvents();
            icons_events_registered.push(icon_type);
        }
    
    });
})
