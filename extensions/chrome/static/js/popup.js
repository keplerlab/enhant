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
        RecordIcon
    ];

    var icons_events_registered = [];

    var icons_object_mapping = {};

    hideIcons();

    // get data from local storage if start is active or not
    chrome.storage.local.get(["start", "stop"], function(result){

        if (result.start){
            showIcons();
        }

        if (result.stop){
           hideIcons();
        }
    })
    

    registered_classes.forEach(function(cl){

        var obj = new cl();
        icons_object_mapping[cl.name] = obj;

        // get state from local storage
        obj.getLocalStorage(cl.name, function(value){
            
            // if active toggle the state, and the container as well
            if (value == "active"){
                obj.handleClick();
            }
        });

        // togglecontainer based on storage data
    });
    
    function hideOtherIconWindow(icon_type){

        for (const prop in icons_object_mapping){
            if (!(prop == icon_type)){
                var icon_obj = icons_object_mapping[prop];
                if (icon_obj.state == "active"){
                    icon_obj.hideContainer();
                    icon_obj.toggleState();

                }
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
