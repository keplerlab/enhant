window.addEventListener("message", function(m){
    console.log(" [This is leftmost frame] Received message from enhant frame ", m);


});

// create a canvas and regsiter a listener for resize    
window.addEventListener("resize", resizeCanvas);

window.addEventListener('mousedown', startPainting); 
window.addEventListener('mouseup', stopPainting); 
window.addEventListener('mousemove', sketch); 

var
// Obtain a reference to the canvas element using its id.
htmlCanvas = document.getElementById('canvas'),
// Obtain a graphics context on the canvas element for drawing.
ctx = htmlCanvas.getContext('2d');

function resizeCanvas(){

    htmlCanvas.width = window.innerWidth;
    htmlCanvas.height = window.innerHeight;
}

// Stores the initial position of the cursor 
let coord = {x:0 , y:0};  

var startX, startY, moveX, moveY, temp, textEle, minInitWidth = 150, minInitHeight = 75;
var fontSize = "20";
var fontColor = "#000000";
var fillColor = "";
var fontFamily = "Arial";
var bBold = false;
var bItalic = false;
var bUnderline = false;
   
// This is the flag that we are going to use to  
// trigger drawing 
let paint = false; 
    
// Updates the coordianates of the cursor when  
// an event e is triggered to the coordinates where  
// the said event is triggered. 
function getPosition(event){ 
  coord.x = event.clientX - htmlCanvas.offsetLeft; 
  coord.y = event.clientY - htmlCanvas.offsetTop; 
} 

// The following functions toggle the flag to start 
// and stop drawing 
function startPainting(e){ 
    paint = true; 
    getPosition(e); 

    initX = e.clientX + window.scrollX, initY = e.clientY + window.scrollY;

    var textEle = document.createElement('div');
    textEle.id = "annotate-plugin-temp-text-element";
    textEle.style.position = "absolute";
    textEle.style.top = initY + "px";
    textEle.style.left = initX + "px";
    textEle.style.width = "0px";
    textEle.style.height = "0px";
    textEle.style.border = "2px solid black";
    textEle.style.zIndex = "2147483642";
    document.body.appendChild(textEle);
} 
  
function stopPainting(){ 
    paint = false; 

    var textEle = document.getElementById("annotate-plugin-temp-text-element");
    var eleLeft = parseFloat(textEle.style.left.slice(0, -2));
    var eleTop = parseFloat(textEle.style.top.slice(0, -2));
    var eleWidth = parseFloat(textEle.style.width.slice(0, -2));
    var eleHeight = parseFloat(textEle.style.height.slice(0, -2));
    textEle.remove();

    addText(eleLeft, eleTop, eleWidth, eleHeight);
} 

function sketch(event){ 
    if (!paint) return; 
    ctx.beginPath(); 
      
    ctx.lineWidth = 5; 
     
    // Sets the end of the lines drawn 
    // to a round shape. 
    ctx.lineCap = 'round'; 
      
    ctx.strokeStyle = 'green'; 
        
    // The cursor to start drawing 
    // moves to this coordinate 
    ctx.moveTo(coord.x, coord.y); 
     
    // The position of the cursor 
    // gets updated as we move the 
    // mouse around. 
    getPosition(event); 
     
    // A line is traced from start 
    // coordinate to this coordinate 
    ctx.lineTo(coord.x , coord.y); 
      
    // Draws the line. 
    ctx.stroke(); 

    startX = initX, startY = initY, moveX = event.clientX + window.scrollX, moveY = event.clientY + window.scrollY;

    if (startX > moveX) {
        temp = startX;
        startX = moveX;
        moveX = temp;
    }

    if (startY > moveY) {
        temp = startY;
        startY = moveY;
        moveY = temp;
    }

    var textEle = document.getElementById("annotate-plugin-temp-text-element");

    startX = initX, startY = initY, moveX = event.clientX + window.scrollX, moveY = event.clientY + window.scrollY;

    if (startX > moveX) {
        temp = startX;
        startX = moveX;
        moveX = temp;
    }

    if (startY > moveY) {
        temp = startY;
        startY = moveY;
        moveY = temp;
    }

    textEle.style.left = startX + "px";
    textEle.style.top = startY + "px";
    textEle.style.width = parseFloat(moveX - startX) + "px";
    textEle.style.height = parseFloat(moveY - startY) + "px";
  } 

  function createTextElementContainer(left, top, width, height) {
    var textElementContainer = document.createElement('div');
    textElementContainer.className = "text-container";
    textElementContainer.style.width = width + "px";
    textElementContainer.style.height = height + "px";
    textElementContainer.style.position = "absolute";
    textElementContainer.style.top = top + "px";
    textElementContainer.style.left = left + "px";
    textElementContainer.style.border = "1px solid black";
    textElementContainer.style.zIndex = "900000000";
    textElementContainer.style.padding = "10px";
    textElementContainer.style.cursor = "all-scroll";
    textElementContainer.style.boxSizing = "content-box";
    return textElementContainer;
}


function createTextElement(minHeight) {
    var className = "text-alement" + (new Date())
        .getTime();
    var textElement = document.createElement('div');
    textElement.className = className;
    textElement.contentEditable = "true";
    textElement.style.userSelect = "none";
    textElement.style.paddingBottom = "10px";
    textElement.style.boxSizing = "border-box";
    textElement.style.height = "auto";
    textElement.style.minHeight = minHeight + "px";
    textElement.style.outline = "0px solid transparent";
    textElement.style.overflowWrap = "break-word";
    textElement.spellcheck = false;
    textElement.style.fontSize = fontSize + "px";
    textElement.style.fontFamily = fontFamily;
    textElement.style.color = fontColor;
    textElement.style.backgroundColor = fillColor;
    textElement.style.cursor = "text";
    textElement.style.lineHeight = "1em";
    if (bBold)
        textElement.style.fontWeight = "bold";
    if (bItalic)
        textElement.style.fontStyle = "italic";
    if (bUnderline)
        textElement.style.textDecoration = "underline";
    return textElement;
}

function onTextElementClick(e) {
    e.stopPropagation();
}

function onTextElementResize(e) {
    for (var i = 0; i < e.length; i++) {
        if (e[i].target == lastEle) {
            lastEle.parentElement.style.height = parseFloat(e[i].contentRect.height + 10) + "px";
            resizeWidthHandle.style.top = parseInt(lastEle.parentElement.offsetTop + (lastEle.parentElement.offsetHeight / 2) - (resizeWidthHandleSize / 2)) + "px";
        }
    }
}

function addText(posX, posY, width, height) {
    width = width - 20 < minInitWidth ? minInitWidth : width - 20;
    height = height - 20 < minInitHeight ? minInitHeight : height - 20;
    var textElement = createTextElement(height);
    var textElementContainer = createTextElementContainer(posX, posY, width, height);
    textElementContainer.appendChild(textElement);
    document.body.appendChild(textElementContainer);
    lastEle = textElement;
    textElementContainer.addEventListener("click", showEditTextToolbarOnClick, {
        useCapture: true,
        passive: false
    });
    textElement.addEventListener("click", showEditTextToolbarOnClick, {
        useCapture: true,
        passive: false
    });
    // textElementContainer.addEventListener("mouseover", showEditTextToolbar, {useCapture: true, passive: false});
    // textElementContainer.addEventListener("mouseleave", handleEditTextToolbarMouseLeave,false);
    // textElementContainer.addEventListener("mousemove", ResetShowEditTextToolbar, {useCapture: true, passive: false});
    textElement.focus();
}