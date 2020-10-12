function createIframeCanvas(){
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight

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
    div.style.background = "none";
    div.style.width = "100%";
    div.style.height = "100%";
    div.appendChild(iframe2);

    document.body.appendChild(div);

    return [iframe2, div];
}

function createEnhantPlugin(){
    const FRAME_ID = "enhant-frame";

    // in pixels
    const FRAME_MAX_WIDTH = 376;
    const FRAME_MAX_HEIGHT = 350;

    var iframe = document.createElement('iframe');
    iframe.frameBorder = "none";
    iframe.style.width = "100%";
    iframe.style.position = "fixed";
    iframe.id = FRAME_ID
    iframe.src = chrome.runtime.getURL("popup.html");

    // create a div
    var DIV_ID_2 = "enhant-frame-wrapper";
    var div = document.createElement('div');
    div.id = DIV_ID_2;
    div.style.right = "0px";
    div.style.top = "10px";
    div.style.position = "absolute";
    div.style.background = "white";
    div.style.zIndex = "2147483647";
    div.style.width = "380px";
    div.style.cursor = "move";

    div.style["boxShadow"] = "0 10px 16px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19)";

    div.appendChild(iframe);
    document.body.appendChild(div);

    const resizer = iFrameResize({ log: false, checkOrigin: false,
        maxHeight: FRAME_MAX_HEIGHT, maxWidth: FRAME_MAX_WIDTH}, '#' + FRAME_ID);

    $('#' + DIV_ID_2).draggable({
        iframeFix: true
    });
    
}

$(document).ready(function(){
    console.log(" contentscript for popup html loaded ");

    var annotation_el = createIframeCanvas();
    var iframe2 = annotation_el[0];
    var div_iframe2 = annotation_el[1];

    var lastScrollY = 0;
    var lastScrollX = 0;

    createEnhantPlugin();

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

            if (m.data.key == "annotation_active"){
                windowResizeHandler();
            }
        }
    }, false);


    function windowResizeHandler(e){

        var height = window.innerHeight;
        var width = window.innerWidth;

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


