class AnnotationTool{
    constructor(canvas, ctx){
        this.canvas = canvas;

        this.zIndexLowest = "-1";
        this.zIndexHighest = "2147483647";

        this.ctx = ctx;

        this.mouse_position = {
            x: 0,
            y: 0
        }
    }

    getCanvas(){
        return this.canvas;
    }

    getCanvasContext(){
        return this.ctx;
    }

    addListenerForElement(el, cb){
    }

    removeListenerForElement(el, cb){
    }

    updateParentIframeZIndex(style){
        window.parent.postMessage(
            {
                "sender": "enhant",
                "key": "update_iframe",
                "style": style
                
            }, "*")
    }

    updateMousePosition(e){
        var x, y;
        x = e.clientX - this.canvas.offsetLeft; 
        y = e.clientY - this.canvas.offsetTop; 

        this.mouse_position = {
            x: x,
            y: y
        }
    }

    update(data){
    }

    // get the x, y coordinates of mouse
    handleMouseUp(e){
    }

    handleMouseDown(e){
    }

    handleMouseMove(e){
    }

    activate(data){
    }

    deactivate(){
    }
}

class Select extends AnnotationTool{
    constructor(canvas, ctx){
        super(canvas, ctx);

        this.zIndex = "0";
    }

    updateCss(){
        var _this = this;
        var canvas = _this.canvas;

        var style_obj = {
            "pointer-events": "none",
            "position": "block",
            "z-index": _this.zIndexHighest,
            "display": "block",
            "cursor": "default"
        }

        _this.updateParentIframeZIndex({
            "pointer-events": "none",
            "cursor": "default"
        });

        // set the z-index of the canvas to low value so it hides beneath 
        $('#' + canvas.id).css(style_obj);
    }

    activate(){
        var _this = this;
        _this.updateCss();
    }

}

class Pen extends AnnotationTool{
    constructor(canvas, ctx){
        super(canvas, ctx);

        // default pen settings
        this.stroke = 3;
        this.strokeAlpha = 1;
        this.color = "#000000";
        this.lineCap = "round";
        this.lineJoin = "round";
        this.cursor_path = "";

        this.paint = false;
    }

    getRGBAString(strColor, alpha) {
        var r = "",
            g = "",
            b = "";
        var iRed = 255,
            iGreen = 255,
            iBlue = 255;
    
        strColor = strColor.replace("#", "");
    
        if (strColor.length == 6) {
            r = strColor.substr(0, 2);
            g = strColor.substr(2, 2);
            b = strColor.substr(4, 2);
            iRed = parseInt(r, 16);
            iGreen = parseInt(g, 16);
            iBlue = parseInt(b, 16);
        }

        var rgba = "rgba(" + iRed + "," + iGreen + "," + iBlue + "," + alpha + ")";
    
        return rgba;
    }

    handleMouseUp(e){
        this.paint = false;
    }

    handleMouseDown(e){

        // save the default state
        var ctx = this.ctx;
        
        this.updateMousePosition(e);
        this.paint = true;
    }

    handleMouseMove(e){

        // draw only if paint is enabled (between mouse up and down)
        if (!this.paint) return;
        var ctx = this.ctx;
        ctx.lineWidth = this.stroke;
        ctx.lineCap = this.lineCap;
        ctx.lineJoin = this.lineJoin;
        ctx.strokeStyle = this.getRGBAString(this.color, this.strokeAlpha);

        ctx.beginPath();

        // move to the start mouse coordinate
        ctx.moveTo(this.mouse_position.x, this.mouse_position.y);

        // update the mouse position as it moves
        this.updateMousePosition(e);

        // trace a line from start coordinate to new coordinate
        ctx.lineTo(this.mouse_position.x, this.mouse_position.y);

        // draw the line
        ctx.stroke();
    }

    setPenData(data){
        if (data.hasOwnProperty("color")){
            this.color = data["color"];
        }

        if (data.hasOwnProperty("cursor")){
            this.cursor_path = data.cursor;
        }
    }

    updateCss(data){
        var _this = this
        var canvas = _this.canvas;

        _this.cursor_path = data.cursor;

        var style_obj = {
            "z-index": _this.zIndexHighest, 
            "pointer-events": "auto",
            "cursor": _this.cursor_path == "" ? "default" : "url('" + _this.cursor_path + "'), auto"
        }

        _this.updateParentIframeZIndex({
            "z-index": _this.zIndexHighest, 
            "pointer-events": "auto",
            "cursor": _this.cursor_path == "" ? "default" : "url('" + _this.cursor_path + "'), auto"
        });

        // set the z-index of the canvas to low value so it hides beneath 
        $('#'+ canvas.id).css(style_obj);
    }
    update(data){
        this.setPenData(data);
    }

    activate(data){
        this.updateCss(data);
    }

}

class Highlight extends Pen{
    constructor(canvas, ctx){
        super(canvas, ctx);

        this.stroke = 14;
        this.strokeAlpha = 0.2;
    }
}

class Eye extends AnnotationTool{
    constructor(canvas, ctx){
        super(canvas, ctx);

        this.hidden = false;
    }

    update(data){
        var canvas = this.canvas;

        if (data.state){
            this.hidden = true;
            $('#'+ canvas.id).hide();
        }
        else{
            this.hidden = false;
            $('#'+ canvas.id).show();
        }
    }
}

class Delete extends AnnotationTool{
    constructor(canvas, ctx){
        super(canvas, ctx);
    }

    clearCanvas(){
        this.ctx.clearReact(0, 0, canvas.width, canvas.height);
    }

    activate(){
       this.clearCanvas();
    }
}

class Text extends AnnotationTool{
    constructor(canvas, ctx){
        super(canvas, ctx);

        this.fontSize = "20";
        this.fontColor = "#000000";
        this.fillColor = "";
        this.fontFamily = "Arial";
        this.bBold = false;
        this.bItalic = false;
        this.bUnderline = false;
        
        this.initX = 0;
        this.initY = 0;
        this.startX;
        this.startY;
        this.moveX;
        this.moveY; 
        this.temp; 
        this.textEle;
        this.minInitWidth = 150, 
        this.minInitHeight = 75;

        this.CLS_TEXT_TOOL_CONTAINER = "enhant-text-container";
        this.CLS_TEXT_TOOL_PREFIX = "enhant-text-element";


        this.BUFFER_WIDTH_IN_PX = 20;
        this.BUFFER_HEIGHT_IN_PX = 20;

        this.overlap = false;
    }
    
    createTextElementContainer(left, top, width, height) {
        var textElementContainer = document.createElement('div');
        textElementContainer.className = this.CLS_TEXT_TOOL_CONTAINER;
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

    createTextElement(minHeight) {
        var className = this.CLS_TEXT_TOOL_PREFIX + (new Date())
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
        textElement.style.fontSize = this.fontSize + "px";
        textElement.style.fontFamily = this.fontFamily;
        textElement.style.color = this.fontColor;
        textElement.style.backgroundColor = this.fillColor;
        textElement.style.cursor = "text";
        textElement.style.lineHeight = "1em";
        if (this.bBold)
            textElement.style.fontWeight = "bold";
        if (this.bItalic)
            textElement.style.fontStyle = "italic";
        if (this.bUnderline)
            textElement.style.textDecoration = "underline";
        return textElement;
    }

    addText(posX, posY, width, height) {
        width = width - 20 < this.minInitWidth ? this.minInitWidth : width - 20;
        height = height - 20 < this.minInitHeight ? this.minInitHeight : height - 20;
        var textElement = this.createTextElement(height);
        var textElementContainer = this.createTextElementContainer(posX, posY, width, height);
        textElementContainer.appendChild(textElement);
        document.body.appendChild(textElementContainer);
        // lastEle = textElement;
        // textElementContainer.addEventListener("click", showEditTextToolbarOnClick, {
        //     useCapture: true,
        //     passive: false
        // });
        // textElement.addEventListener("click", showEditTextToolbarOnClick, {
        //     useCapture: true,
        //     passive: false
        // });
       
        textElement.focus();

        $('.'+ this.CLS_TEXT_TOOL_CONTAINER).draggable().resizable();
    }

    getPosition(event){ 
        var x, y;

        x = event.clientX - this.canvas.offsetLeft; 
        y = event.clientY - this.canvas.offsetTop; 

        this.mouse_position = {
            x: x,
            y: y
        }
    }

    checkOverlapWithExistingTextContainer(){
        var newLeft = this.initX;
        var newTop = this.initY;

        var _this = this;

        var allContainers = $('.' + this.CLS_TEXT_TOOL_CONTAINER);
        allContainers.each(function(){
            var el_position = $(this).offset();
            var el_width = $(this).width();
            var el_height = $(this).height();

            // console.log(" width height , position ",el_width, el_height, el_position, newLeft, newTop);

            var el_right = el_position.left + el_width;
            var el_bottom = el_position.top + el_height;

            var bounding_left = el_position.left - _this.BUFFER_WIDTH_IN_PX;
            var bounding_right = el_right + _this.BUFFER_WIDTH_IN_PX;
            var bounding_top = el_position.top - _this.BUFFER_HEIGHT_IN_PX;
            var bounding_bottom = el_bottom + _this.BUFFER_HEIGHT_IN_PX;

            // console.log(" overlaps ? ", bounding_left, bounding_right, bounding_top, bounding_bottom);

            if ((newLeft >= bounding_left) && (newLeft <= bounding_right)){

                if ((newTop >=  bounding_top) && (newTop <= bounding_bottom)){
                    _this.overlap = true;
                }
            }
        });

        return this.overlap;
    }

    handleMouseDown(e){
        this.getPosition(e); 

        // reset overlap
        this.overlap = false;

        this.initX = e.clientX + window.scrollX;
        this.initY = e.clientY + window.scrollY;

        this.checkOverlapWithExistingTextContainer();

        if (!this.overlap){
            var textEle = document.createElement('div');
            textEle.id = "enhant-temp-text-element";
            textEle.style.position = "absolute";
            textEle.style.top = this.initY + "px";
            textEle.style.left = this.initX + "px";
            textEle.style.width = "0px";
            textEle.style.height = "0px";
            textEle.style.border = "2px solid black";
            textEle.style.zIndex = "2147483642";
            document.body.appendChild(textEle);
        }
    }

    handleMouseUp(event){

        if (!this.overlap){
            var textEle = document.getElementById("enhant-temp-text-element");
            var eleLeft = parseFloat(textEle.style.left.slice(0, -2));
            var eleTop = parseFloat(textEle.style.top.slice(0, -2));
            var eleWidth = parseFloat(textEle.style.width.slice(0, -2));
            var eleHeight = parseFloat(textEle.style.height.slice(0, -2));
            textEle.remove();

            this.addText(eleLeft, eleTop, eleWidth, eleHeight);
        }
    }

    handleMouseMove(event){
        var textEle = document.getElementById("enhant-temp-text-element");

        if (textEle !== null){
            this.startX = this.initX;
            this.startY = this.initY; 
            this.moveX = event.clientX + window.scrollX;
            this.moveY = event.clientY + window.scrollY;
    
            if (this.startX > this.moveX) {
                this.temp = this.startX;
                this.startX = this.moveX;
                this.moveX = this.temp;
            }
    
            if (this.startY > this.moveY) {
                this.temp = this.startY;
                this.startY = this.moveY;
                this.moveY = this.temp;
            }
    
            textEle.style.left = this.startX + "px";
            textEle.style.top = this.startY + "px";
            textEle.style.width = parseFloat(this.moveX - this.startX) + "px";
            textEle.style.height = parseFloat(this.moveY - this.startY) + "px";
        }

    }

    updateCss(){
        var _this = this
        var canvas = _this.canvas;

        var style_obj = {
            "z-index": _this.zIndexHighest, 
            "pointer-events": "auto",
        }

        _this.updateParentIframeZIndex({
            "z-index": _this.zIndexHighest, 
            "pointer-events": "auto"
        });

        // set the z-index of the canvas to low value so it hides beneath 
        $('#'+ canvas.id).css(style_obj);
    }

    update(data){
        if (data.hasOwnProperty("color")){
            this.fontColor = data.color;
        }
    }

    activate(){
        this.updateCss();
    }
}
