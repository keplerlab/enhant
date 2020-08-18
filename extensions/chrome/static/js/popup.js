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

    registered_classes.forEach(function(cl){
        var obj = new cl();
        icons_object_mapping[cl.name] = obj;
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


// let record_btn = document.getElementById('record');
// let stop_btn = document.getElementById('stop');

// record_btn.onclick = function(){
    
//     chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {

//         console.log(" tabs ", tabs[0]);

//         // sends message to content script (main.js)
//         // chrome.tabs.sendMessage(tabs[0].id, {action: "start_local_recording"}, function(response){
//         //     console.log("Local recording status : ", response.status);
//         // })

//         chrome.runtime.sendMessage({action: "start_tab_recording"}, function(response){
//             console.log("Local recording status : ", response.status);
//         })
//     })
// }

// stop_btn.onclick = function(){

//     chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {

//         // sends message to content script (main.js)
//         // chrome.tabs.sendMessage(tabs[0].id, {action: "stop_local_recording"}, function(response){
//         //     console.log("Local recording status : ", response.status);
//         // })

//         // stop the tab recording
//         chrome.runtime.sendMessage({action: "stop_tab_recording"}, function(response){
//             console.log("Local recording status : ", response.status);
//         })
//     })
// }
