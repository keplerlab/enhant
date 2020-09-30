$(document).ready(function(){
    console.log(" contentscript for popup html loaded ");
    const FRAME_ID = "enhant-frame";

    // in pixels
    const FRAME_MAX_WIDTH = 376;
    const FRAME_MAX_HEIGHT = 350;

    var iframe = document.createElement('iframe');
    iframe.frameBorder = "none";
    iframe.style.width = "100%";
    iframe.id = FRAME_ID
    iframe.src = chrome.runtime.getURL("popup.html");


    var iframe2 = document.createElement('iframe');
    iframe2.frameBorder = "none";
    iframe2.style.width = "100%";
    iframe2.style.position = "absolute";
    iframe2.style.pointerEvents = "none";
    iframe2.style.top = "0px";
    iframe2.style.left = "0px";
    iframe2.style.height = "100%";
    iframe2.style.zIndex = "-2147483647";
    iframe2.id = "frame2";
    iframe2.src = chrome.runtime.getURL("iframe2.html");

    // create a div
    const DIV_ID = "enhant-frame2-wrapper";
    var div_2 = document.createElement('div');
    div_2.id = DIV_ID;
    div_2.style.left = "0px";
    div_2.style.top = "10px";
    div_2.style.position = "absolute";
    div_2.style.background = "white";
    div_2.style.zIndex = "2147483647";
    div_2.style.width = "380px";
    div_2.style.cursor = "move";
    div_2.style["boxShadow"] = "0 10px 16px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19)";
    document.body.appendChild(iframe2);

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
    document.body.appendChild(div);


    $('#' + DIV_ID_2).draggable({
        iframeFix: true
    });

    const resizer = iFrameResize({ log: false, checkOrigin: false,
        maxHeight: FRAME_MAX_HEIGHT, maxWidth: FRAME_MAX_WIDTH}, '#' + FRAME_ID);

    var targetFrame = document.getElementById(iframe2.id);

    window.addEventListener('message', function (m) {

        if ((m.data.hasOwnProperty("sender")) && (m.data.sender == "enhant")){
            
            console.log(" received message [Parent content script] : ", m);

             // send  a message with the size
             windowResizeHandler();

            targetFrame.contentWindow.postMessage(m.data, '*');

            if (m.data.key == "update_iframe"){

                if (m.data.style !== null){
                    $('#' + iframe2.id).css(m.data.style);
                }
                
            }
        }
    }, false);

    function windowResizeHandler(e){
        // send parent dimensions
        var parent_dimensions = {
            "key": "resize",
            "scale": {
                "height": $(document).height(),
                "width": $(document).width()
            }
        }

        targetFrame.contentWindow.postMessage(parent_dimensions, '*');
    };

    window.addEventListener("resize", windowResizeHandler);
});


