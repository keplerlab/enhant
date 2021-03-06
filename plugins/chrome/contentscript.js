var _enhant_position = {};

function isEmpty(obj){
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop)) {
            return false;
        }
    }

    return JSON.stringify(obj) === JSON.stringify({});
}

function adjustEnhantPosition(position){

    var left = position.left * window.innerWidth;
    var top = position.top * window.innerHeight;

    var right = left + position.width;
    var bottom = top + position.height;

    if (window.innerWidth < right){
        left = left - (right - window.innerWidth);
    }

    if (window.innerWidth < bottom){
        top = top - (bottom - window.innerHeight);
    }

    if (left <= 0){
        left = 0;
    }

    if (top <= 0){
        top = 0;
    }

    var obj = {
        left: left,
        top: top,
        right: right,
        bottom: bottom,
        height: position.height,
        width: position.width
    };

    return obj;

}

function normalizeTopLeftSavePosition(div){
    var position = div.getBoundingClientRect().toJSON();
    position.left = position.left / window.innerWidth;
    position.top = position.top / window.innerHeight;

    _enhant_position = position;
}

function setPositionEnhant(position, div){
    if (position !== null){
        var adjusted_position = adjustEnhantPosition(position);
        $('#' + div.id).css({
            left: adjusted_position.left + "px",
            top: adjusted_position.top + "px"
        });
    }
    else{

        $('#' + div.id).css({
            right: "0px",
            top: "10px"
        });
    }
}

function saveEnhantPosition(position){

    var msg = "save_enhant_position";
    chrome.runtime.sendMessage({msg: msg, data: position}, function(response) {
        console.log("Position updated status : ", response);
    });
}

function getEnhantPosition(cb){
    var msg = "get_enhant_position";
    chrome.runtime.sendMessage({msg: msg}, function(response) {
        var position = response.data;
        
        if (!isEmpty(position)){
            cb(position);
        }
        else{
            cb(null);
        }
    });
}

function createIframeCanvas(){
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;

    var iframe2 = document.createElement('iframe');
    iframe2.frameBorder = "none";
    iframe2.src = chrome.runtime.getURL("iframe2.html");
    iframe2.style.position = "absolute";
    iframe2.style.pointerEvents = "none";
    iframe2.style.top = "0px";
    iframe2.style.left = "0px";
    iframe2.style.zIndex = "-2147483645";
    iframe2.id = "frame2";

    iframe2.style.width = "100%";
    iframe2.style.height = "100%";
    
    // create a div
    var DIV_ID_2 = "enhant-frame-canvas-wrapper";
    var div = document.createElement('div');
    div.id = DIV_ID_2;
    div.style.left = "0px";
    div.style.top = "0px";
    div.style.position = "absolute";
    div.style.zIndex = "-2147483645";
    div.style.width = "100%";
    div.style.height = "100%";
    div.appendChild(iframe2);

    document.body.appendChild(div);

    $('#' + div.id).css({
        "max-height": windowHeight
    });

    return [iframe2, div];
}

function createEnhantPlugin(position){
    const FRAME_ID = "enhant-frame";

    // in pixels
    const FRAME_MAX_WIDTH = 376;
    const FRAME_MAX_HEIGHT = 350;

    var iframe = document.createElement('iframe');
    iframe.frameBorder = "none";
    iframe.style.width = "100%";
    iframe.id = FRAME_ID
    iframe.src = chrome.runtime.getURL("popup.html");

    // create a div
    var DIV_ID_2 = "enhant-frame-wrapper";
    var div = document.createElement('div');
    div.id = DIV_ID_2;
    div.style.position = "fixed";
    div.style.background = "white";
    div.style.zIndex = "2147483647";
    div.style.width = "380px";
    div.style["boxShadow"] = "0 10px 16px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19)";

    div.appendChild(iframe);
    document.body.appendChild(div);

    // set the position
    setPositionEnhant(position, div);

    const resizer = iFrameResize({ log: false, checkOrigin: false,
        maxHeight: FRAME_MAX_HEIGHT, maxWidth: FRAME_MAX_WIDTH}, '#' + FRAME_ID);


    return [iframe, div];
     
}

function collpaseEnhantToolbar(){
    $("#enhant-frame-wrapper").css({"width": "85px"});
}

function expandEnhantToolbar(){
    var position = $("#enhant-frame-wrapper").position();
    if ((window.innerWidth - position.left) <= 380){
        $("#enhant-frame-wrapper").css({"width": "380px", "left": position.left - 380});
    }
    else{
        $("#enhant-frame-wrapper").css({"width": "380px"});
    }
}

//handlers iframe drag
var pageMouseX, pageMouseY;
var frameContainerLeft = 0,frameContainerTop = 0;
function handleEnhantIframeDragStart(iframe_container, data){

    var position = iframe_container.getBoundingClientRect();

    frameContainerTop = parseInt(position.top, 10);
    frameContainerLeft = parseInt(position.left, 10);

    pageMouseX = frameContainerLeft + data.startX;
    pageMouseY = frameContainerTop + data.startY;


    window.addEventListener("mouseup", handleEnhantIframeDragStop);
    window.addEventListener("mousemove", handleParentMouseMove);
}

function handleEnhantIframeDragMove(iframe_container, data){

    // console.log(" data incoming for movement ", data);

    var newLeft = frameContainerLeft + data.offsetX;
    var newTop = frameContainerTop + data.offsetY;

    var el_bounding_data = iframe_container.getBoundingClientRect().toJSON();

    var boundary_left = 0;
    var boundary_right = (window.innerWidth - el_bounding_data.width);
    var boundary_top = 0;
    var boundary_bottom = (window.innerHeight - el_bounding_data.height);

    if (((newLeft > boundary_left) && (newLeft < boundary_right)) && ((newTop > boundary_top) && (newTop < boundary_bottom))){
        frameContainerTop = newTop;
        frameContainerLeft = newLeft;

        iframe_container.style.top = newTop + "px";
        iframe_container.style.left = newLeft + "px";

        pageMouseX += data.offsetX;
        pageMouseY += data.offsetY;
    }
}

function handleEnhantIframeDragStop(iframe_container){

    try{
        var position = iframe_container.getBoundingClientRect().toJSON();
        position["left"] = position["left"] / window.innerWidth;
        position["top"] = position["top"] / window.innerHeight;
        saveEnhantPosition(position);

    }
    catch(err){
        console.log(" removing listeners as mouse outside of body");
        var message = {
            "key": "stop_drag",
        }
        var el =  document.getElementById("enhant-frame");

        el.contentWindow.postMessage(message, '*');
    }
   
    window.removeEventListener("mouseup", handleEnhantIframeDragStop);
    window.removeEventListener("mousemove", handleParentMouseMove);
}

function handleParentMouseMove(evt){

    var newLeft = frameContainerLeft + (evt.clientX - pageMouseX);
    var newTop = frameContainerTop + (evt.clientY - pageMouseY);

    var iframe_container = document.getElementById("enhant-frame-wrapper");

    var el_bounding_data = iframe_container.getBoundingClientRect().toJSON();

    var boundary_left = 0;
    var boundary_right = (window.innerWidth - el_bounding_data.width);
    var boundary_top = 0;
    var boundary_bottom = (window.innerHeight - el_bounding_data.height);

    if (((newLeft > boundary_left) && (newLeft < boundary_right)) && ((newTop > boundary_top) && (newTop < boundary_bottom))){
        frameContainerLeft = newLeft;
        frameContainerTop = newTop;

        iframe_container.style.top = newTop + "px";
        iframe_container.style.left = newLeft + "px";

        pageMouseX = evt.clientX;
        pageMouseY = evt.clientY;

        // update enhant position
        normalizeTopLeftSavePosition(iframe_container);
    }

    
}

$(document).ready(function(){
    console.log(" contentscript for popup html loaded ");

    getEnhantPosition(function(position){
        var annotation_el = createIframeCanvas();
        var iframe2 = annotation_el[0];
        var div_iframe2 = annotation_el[1];

        var lastScrollY = 0;
        var lastScrollX = 0;

        // these id should match that in popup.js
        const _DRAG_START = "DRAG_START";
        const _DRAG_MOVE = "DRAG_MOVE";
        const _DRAG_STOP = "DRAG_STOP";

        var enhant_frame = createEnhantPlugin(position);
        var enhant_iframe = enhant_frame[0];
        var enhant_iframe_container = enhant_frame[1];

        // normalized enhant position (to be used when resize happens)
        normalizeTopLeftSavePosition(enhant_iframe_container);

        var targetFrame = document.getElementById(iframe2.id);

        window.addEventListener('message', function (m) {

            if ((m.data.hasOwnProperty("sender")) && (m.data.sender == "enhant")){
                
                // console.log(" received message [Parent content script] : ", m);

                targetFrame.contentWindow.postMessage(m.data, '*');

                if (m.data.key == "update_iframe"){

                    if (m.data.style !== null){
                        $('#' + iframe2.id).css(m.data.style);
                        $('#' + div_iframe2.id).css(m.data.style);
                    }
                    
                }

                if (m.data.key == "capture_crop"){

                    var crop_data = m.data.crop_data;

                    // send a message to background to get the base64 image
                    chrome.runtime.sendMessage({
                        "msg": "capture_tab_without_save"
                    }, function(response) {
                        var base64_image = response.data.content;
                        var image = new Image();
                        image.src = base64_image;

                        image.onload = function(){
                            var canvas = document.createElement("canvas");

                            var width = crop_data.width;
                            var height = crop_data.height;
                            var x = crop_data.x;
                            var y = crop_data.y;

                            canvas.width = width;
                            canvas.height = height;

                            var ctx = canvas.getContext("2d");
                            ctx.drawImage(image, x, y, width * window.devicePixelRatio, height * window.devicePixelRatio, 0, 0, width, height);

                            var cropped_image = canvas.toDataURL("image/png");

                            // send cropped image to be saved as a note
                            chrome.runtime.sendMessage({
                                "msg": "save_crop",
                                "data": cropped_image
                            });
                        }
                    });
                }

                if (m.data.key == "annotation_active"){
                    windowResizeHandler();
                }

                if (m.data.key == "plugin_activated"){
                    if (m.data.state){
                        registerSelectTextEvents();
                    }
                    else{
                        deregisterSelectTextEvents();
                    }
                }

                if (m.data.key == "expand_toolbar"){
                    console.log(" received message [Parent content script] : ", m);
                    expandEnhantToolbar();
                }

                if (m.data.key == "collapse_toolbar"){
                    console.log(" received message [Parent content script] : ", m);
                    collpaseEnhantToolbar();
                }

                // handle mouse drag data from iframe to move iframe
                if (m.data.key == "iframe_mouse_drag"){

                    switch(m.data.msg){
                        case _DRAG_START:
                            handleEnhantIframeDragStart(enhant_iframe_container, m.data.input);
                            break;
                        case _DRAG_MOVE:
                            handleEnhantIframeDragMove(enhant_iframe_container, m.data.input);
                            break;
                        case _DRAG_STOP:
                            handleEnhantIframeDragStop(enhant_iframe_container);
                            break;
                    }
                }
            }
        }, false);


        function windowResizeHandler(e){

            var height = window.innerHeight;
            var width = window.innerWidth;
    
            var newposition = adjustEnhantPosition(_enhant_position);

            $('#' + enhant_iframe_container.id).css({
                left: newposition.left,
                top: newposition.top
            });

            var newposition_normalized = newposition;
            newposition_normalized.left =  newposition_normalized.left / window.innerWidth;
            newposition_normalized.top = newposition_normalized.top / window.innerHeight;

            // update the enhant position on resize
            _enhant_position = newposition_normalized;

            // send parent dimensions
            var parent_dimensions = {
                "key": "resize",
                "scale": {
                    "height": height,
                    "width": width
                }
            }

            div_iframe2.style.width = width;
            div_iframe2.style.height = height;

            $('#' + div_iframe2.id).css({
                "max-height": height
            });

            iframe2.style.width = width;
            iframe2.style.height = height;

            targetFrame.contentWindow.postMessage(parent_dimensions, '*');
        };

        function windowScrollHandler(e){

            var top = 0;
            var left = 0;

            var actualTop = top;
            var actualLeft = left;

            if (window.scrollY + document.documentElement.clientHeight <= document.documentElement.scrollHeight) {
                top = window.scrollY;

                if (top - lastScrollY > 0){
                    actualTop = -(top - lastScrollY);
                }
                else{
                    actualTop = (lastScrollY - top);
                }
            
                lastScrollY = top;
                div_iframe2.style.top = top + "px";
            }
            if (window.scrollX + document.documentElement.clientWidth <= document.documentElement.scrollWidth) {
                left = window.scrollX;

                if (left - lastScrollX > 0){
                    actualLeft = -(left - lastScrollX);
                }
                else{
                    actualLeft = (lastScrollX - left);
                }
                lastScrollX = left;
                div_iframe2.style.left = left + "px";
            }

            // send parent dimensions
            var parent_dimensions = {
                "key": "scroll",
                "position": {
                    "top": actualTop,
                    "left": actualLeft
                }
            }

            targetFrame.contentWindow.postMessage(parent_dimensions, '*');
            
        }

        window.addEventListener("resize", windowResizeHandler);
        window.addEventListener("scroll", windowScrollHandler);
    });
});

function getSelectionType(){

    var range = window.getSelection().getRangeAt(0);
    var fragment = range.cloneContents();
    var imgs = fragment.querySelectorAll('img');

    var data = {
        "img": false,
        "text": false
    }

    if (imgs.length > 0 ){
        data.img = true;
    }

    if (window.getSelection){
        var text = window.getSelection().toString();
        if (text.length > 0){
            data.text = true;
        }
    }
    
    return data;
}

function selectionTextListener(e){

    if (e.srcElement.id == "submit-selected"){

        var data = getSelectionType();

        if (data.img){
            var range = window.getSelection().getRangeAt(0);
            var DOMRect = range.getBoundingClientRect();
            var bound = {
                "x": parseInt(DOMRect.x * window.devicePixelRatio),
                "y": parseInt(DOMRect.y * window.devicePixelRatio),
                "width" : parseInt(DOMRect.width),
                "height": parseInt(DOMRect.height)
            }

            // remove selection before taking screenshot
            window.getSelection().removeAllRanges();

            // take a screenshot after a second so deselection happens 
            setTimeout(function(){
                // set bound values
                chrome.runtime.sendMessage({
                    "msg": "capture_tab_without_save"
                }, function(response) {
                    var base64_image = response.data.content;
                    var image = new Image();
                    image.src = base64_image;

                    image.onload = function(){
                        var canvas = document.createElement("canvas");

                        var width = bound.width;
                        var height = bound.height;
                        var x = bound.x;
                        var y = bound.y;

                        canvas.width = width;
                        canvas.height = height;

                        var ctx = canvas.getContext("2d");
                        ctx.drawImage(image, x, y, width * window.devicePixelRatio, height * window.devicePixelRatio, 0, 0, width, height);

                        var cropped_image = canvas.toDataURL("image/png");

                        // send cropped image to be saved as a note
                        chrome.runtime.sendMessage({
                            "msg": "save_crop",
                            "data": cropped_image
                        });
                    }
                });
            }, 1000);

        }
        else{
            if (data.text){
                var selected_text = window.getSelection().toString();
                if (selected_text.length > 0){
                    chrome.runtime.sendMessage({
                        "msg": "save_selected_text", 
                        "data": selected_text
                    });
                }
            }
        }

        $('#submit-selected').remove();
    
    }
    else {

        // check if image or text is present, rendera button
        var data = getSelectionType();
        $('#submit-selected').remove();
        if (data.img || data.text){

            var selected_button = $('<button>').attr({
                type: 'button',
                title: 'Add Note',
                id: 'submit-selected'
            }).html("Add Note").css({
                "color": "#1E90FF",
                "position": "absolute",
                "height": "30px",
                "background-color": "white",
                "z-index": 2147483645
            }).hide();

            $(document.body).append(selected_button);
            selected_button.css({
                top: e.pageY - 30,//offsets
                left: e.pageX - 13 //offsets
            }).fadeIn();
        }
    }
}

function registerSelectTextEvents(){

    window.addEventListener("mouseup", selectionTextListener);
}

function deregisterSelectTextEvents(){

    window.removeEventListener("mouseup", selectionTextListener);
}




