function createIframeCanvas(){
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight

    var iframe2 = document.createElement('iframe');
    iframe2.frameBorder = "none";
    iframe2.src = chrome.runtime.getURL("iframe2.html");
    iframe2.style.position = "fixed";
    iframe2.style.pointerEvents = "none";
    iframe2.style.top = "0px";
    iframe2.style.left = "0px";
    iframe2.style.zIndex = "-2147483645";
    iframe2.id = "frame2";

    document.body.prepend(iframe2);

    iframe2.style.width = "100%";
    iframe2.style.height = "100%";

    return iframe2;
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
    const DIV_ID_2 = "enhant-frame-wrapper";
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
    document.body.prepend(div);

    const resizer = iFrameResize({ log: false, checkOrigin: false,
        maxHeight: FRAME_MAX_HEIGHT, maxWidth: FRAME_MAX_WIDTH}, '#' + FRAME_ID);

    $('#' + DIV_ID_2).draggable({
        iframeFix: true
    });
    
}

$(document).ready(function(){
    console.log(" contentscript for popup html loaded ");

    var iframe2 = createIframeCanvas();
    createEnhantPlugin();

    var targetFrame = document.getElementById(iframe2.id);

    window.addEventListener('message', function (m) {

        if ((m.data.hasOwnProperty("sender")) && (m.data.sender == "enhant")){
            
            console.log(" received message [Parent content script] : ", m);

            targetFrame.contentWindow.postMessage(m.data, '*');

            if (m.data.key == "update_iframe"){

                if (m.data.style !== null){
                    $('#' + iframe2.id).css(m.data.style);
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

        // iframe2.style.width = width;
        // iframe2.style.height = height;

        targetFrame.contentWindow.postMessage(parent_dimensions, '*');
    };

    function windowScrollHandler(e){

        var top = "0px";
        var left = "0px";

        if (window.scrollY + document.documentElement.clientHeight <= document.documentElement.scrollHeight) {
            top = window.scrollY + "px";
        }
        if (window.scrollX + document.documentElement.clientWidth <= document.documentElement.scrollWidth) {
            left = window.scrollX + "px";
        }

        iframe2.style.top = top;
        iframe2.style.left = left;

        // send parent dimensions
        var parent_dimensions = {
            "key": "scroll",
            "position": {
                "top": top,
                "left": left
            }
        }
    }

    window.addEventListener("resize", windowResizeHandler);

    window.addEventListener("scroll", windowScrollHandler);
});


