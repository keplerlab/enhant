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


    // create a div
    const DIV_ID = "enhant-frame-wrapper";
    var div = document.createElement('div');
    div.id = DIV_ID;
    div.style.right = "0px";
    div.style.top = "10px";
    div.style.position = "absolute";
    div.style.zIndex = "9000000";
    div.style.width = "380px";
    div.style.cursor = "move";

    div.style["boxShadow"] = "0 10px 16px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19)";

    div.appendChild(iframe);
    document.body.appendChild(div);


    // to resize the iframe based on internal contents 
    const resizer = iFrameResize({ log: false, checkOrigin: false, 
        maxHeight: FRAME_MAX_HEIGHT, maxWidth: FRAME_MAX_WIDTH,
        heightCalculationMethod : 'max' }, '#' + FRAME_ID);

    $('#' + DIV_ID).draggable({
        iframeFix: true
    });

})


