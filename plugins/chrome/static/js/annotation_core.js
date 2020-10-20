class AnnotationTool{
    constructor(canvas, ctx){
        this.canvas = canvas;

        this.zIndexLowest = "-2147483645";
        this.zIndexHighest = "2147483645";

        this.ctx = ctx;

        this.points = [];

        this.points_scroll = [];

        this.mouse_position = {
            x: 0,
            y: 0
        }
    }

    getSavedData(){
        return this.points;
    }

    clearData(){
        this.points = [];
        this.points_scroll = [];
    }

    addData(arr){
        this.points.push(arr);
        this.points_scroll.push(arr);
    }

    getCanvas(){
        return this.canvas;
    }

    getCanvasContext(){
        return this.ctx;
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

    updateCss(style_local, style_parent){
        var _this = this
        var canvas = _this.canvas;

        _this.updateParentIframeZIndex(style_parent);

        // set the z-index of the canvas to low value so it hides beneath 
        $('#'+ canvas.id).css(style_local);
    }

    delete(){
        this.clearData();
    }

    draw(){

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

    handleResize(e){
        this.draw();
    }

    //TODO : activate can receive data like cursor path later
    // This will change some other styling as well.
    activate(data){
        var style_local = {
            "z-index": this.zIndexHighest, 
            "pointer-events": "auto"
        };

        this.updateCss(style_local, style_local);
    }

    deactivate(){
        var style_local = {
            "pointer-events": "none",
            "position": "block",
            "z-index": this.zIndexHighest,
            "display": "block",
            "cursor": "default"
        }

        var style_parent = {
            "pointer-events": "none",
            "cursor": "default"
        }

        this.updateCss(style_local, style_parent);
    }
}

class Select extends AnnotationTool{
    constructor(canvas, ctx){
        super(canvas, ctx);

        this.zIndex = "0";
    }

    enableSelect(){
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
        _this.enableSelect();
    }

    deactivate(){
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

        this.curve_data = [];

        this.globalCompositeOperation = "source-over";
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
        this.addData(this.curve_data);
    }

    handleMouseDown(e){

        // save the default state
        var ctx = this.ctx;

        this.curve_data = [];
        
        this.updateMousePosition(e);

        this.curve_data.push({
            x: this.mouse_position.x / this.canvas.width,
            y: this.mouse_position.y / this.canvas.height,
            lineWidth: this.stroke,
            strokeStyle: this.getRGBAString(this.color, this.strokeAlpha)
        });

        this.paint = true;
    }

    handleMouseMove(e){

        // draw only if paint is enabled (between mouse up and down)
        if (!this.paint) return;
        var ctx = this.ctx;
        ctx.globalCompositeOperation = this.globalCompositeOperation;
        ctx.lineWidth = this.stroke;
        ctx.lineCap = this.lineCap;
        ctx.lineJoin = this.lineJoin;
        ctx.strokeStyle = this.getRGBAString(this.color, this.strokeAlpha);

        ctx.beginPath();

        // move to the start mouse coordinate
        ctx.moveTo(this.mouse_position.x, this.mouse_position.y);

        // update the mouse position as it moves
        this.updateMousePosition(e);

        this.curve_data.push({
            x: this.mouse_position.x / this.canvas.width,
            y: this.mouse_position.y / this.canvas.height,
            lineWidth: this.stroke,
            strokeStyle: this.getRGBAString(this.color, this.strokeAlpha)
        });

        // trace a line from start coordinate to new coordinate
        ctx.lineTo(this.mouse_position.x, this.mouse_position.y);

        // draw the line
        ctx.stroke();
    }

    clearCanvas(){
        var ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    delete(){
        super.delete();
        this.clearCanvas();

    }

    drawScroll(data){
        var _this = this;
        var position = data;
        var top = position.top;
        var left = position.left;

        this.points_scroll = this.points_scroll.map(function(curve){

            return curve.map(function(point){
                var point_x = ((point.x * _this.canvas.width)  + left) / _this.canvas.width;
                var point_y = ((point.y * _this.canvas.height) + top) / _this.canvas.height;
                return {
                    x: point_x,
                    y: point_y,
                    lineWidth: point.lineWidth,
                    strokeStyle: point.strokeStyle
                }
            });
        });

        this.draw(this.points_scroll);
    }

    draw(points_arr){
        var _this = this;
        var ctx = this.ctx;
        var canvas_jquery = $('#' + this.canvas.id);
        var scaleWidth = Number(canvas_jquery.attr("scaleWidth"));
        var scaleHeight = Number(canvas_jquery.attr("scaleHeight"));

        var points = points_arr || this.points;

        points.forEach(function(curve_arr){

            curve_arr.forEach(function(point, index){

                // console.log(" index/ point ", index + 1, curve_arr.length);

                if ((index + 1) < curve_arr.length){

                    ctx.beginPath();
                    var start_x = point.x * _this.canvas.width;
                    var start_y = point.y * _this.canvas.height;

                    // console.log(" moving point from ", point.x, point.y, " to ", start_x, start_y);
                    ctx.moveTo(start_x, start_y);
                    ctx.lineWidth = point.lineWidth;
                    ctx.globalCompositeOperation = _this.globalCompositeOperation;
                    ctx.lineCap = _this.lineCap;
                    ctx.lineJoin = _this.lineJoin;
                    ctx.strokeStyle = point.strokeStyle;

                    var start_x = curve_arr[index + 1].x;
                    var start_y = curve_arr[index + 1].y;

                    var next_x = (start_x * _this.canvas.width);
                    var next_y = (start_y * _this.canvas.height);

                    // console.log(" moving next point from ", curve_arr[index + 1].x, curve_arr[index + 1].y, " to ", next_x, next_y);

                    // trace a line from start coordinate to next coordinate
                    ctx.lineTo(next_x, next_y);
                    ctx.stroke();
                }
            });
        });
    }

    setPenData(data){
        if (data.hasOwnProperty("color")){
            this.color = data["color"];
        }

        if (data.hasOwnProperty("cursor")){
            this.cursor_path = data.cursor;
        }
    }

    update(data){
        this.setPenData(data);
    }

}

class Highlight extends Pen{
    constructor(canvas, ctx){
        super(canvas, ctx);

        this.color = "#FFCF74";
        this.lineCap = "butt";
        this.lineJoin = "round";
        this.stroke = 14;
        this.strokeAlpha = 0.35;
        this.globalCompositeOperation = "multiply";
    }
}

class Eye extends AnnotationTool{
    constructor(canvas, ctx){
        super(canvas, ctx);

        this.CLS_TEXT_TOOL_CONTAINER = "enhant-text-container";

        this.hidden = false;
    }

    hideTextOverlays(){
        $('.' + this.CLS_TEXT_TOOL_CONTAINER).hide();
    }

    showTextOverlays(){
        $('.' + this.CLS_TEXT_TOOL_CONTAINER).show();
    }

    setState(data){
        var canvas = this.canvas;

        if (data.state){
            this.hidden = true;
            $('#'+ canvas.id).hide();
            this.hideTextOverlays();
        }
        else{
            this.hidden = false;
            $('#'+ canvas.id).show();
            this.showTextOverlays();
        }
    }

    activate(){
        this.setState({state: true});
    }

    deactivate(){
        this.setState({state: false});
        super.deactivate();
    }
}

class Delete extends AnnotationTool{
    constructor(canvas, ctx){
        super(canvas, ctx);

        this.CLS_TEXT_TOOL_CONTAINER = "enhant-text-container";
    }

    activate(tool_arr){
       tool_arr.forEach(function(tool){
           tool.delete();
       })
    }
}

class Erase extends Pen{
    constructor(canvas, ctx){
        super(canvas, ctx);

        this.paint = false;
        this.stroke = 20;
        this.lineCap = "round";
        this.lineJoin = "round";
        this.globalCompositeOperation = "destination-out";
    }

    handleMouseDown(e){
        this.paint = true;
        this.updateMousePosition(e);
    }

    handleMouseUp(e){
        this.paint = false;
    }

    handleMouseMove(e){

        // draw only if paint is enabled (between mouse up and down)
        if (!this.paint) return;
        var ctx = this.ctx;
        ctx.lineWidth = this.stroke;
        ctx.lineCap = this.lineCap;
        ctx.lineJoin = this.lineJoin;
        ctx.globalCompositeOperation = this.globalCompositeOperation;
        ctx.strokeStyle = "rgba(0,0,0,1)";

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

    stopErase(){

        var _this = this
        var canvas = _this.canvas;

        var style_obj = {
            "z-index": _this.zIndexHighest, 
            "pointer-events": "auto"
        }

        _this.updateParentIframeZIndex({
            "z-index": _this.zIndexHighest, 
            "pointer-events": "auto"
        });

        // set the z-index of the canvas to low value so it hides beneath 
        $('#'+ canvas.id).css(style_obj);

        var ctx = _this.ctx;
        ctx.globalCompositeOperation = "source-over";
    }

    startErase(){
        var ctx = this.ctx;
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
    }

    update(data){
        if (data.state){
            this.startErase();
        }
        else{
            this.stopErase();
        }
    }

    activate(){
        super.activate();
        this.startErase();
    }

    deactivate(){
        this.stopErase();
        super.deactivate();
    }
}

class Text extends AnnotationTool{
    constructor(canvas, ctx){
        super(canvas, ctx);

        this.fontSize = "17";
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
        this.CLS_IMAGE_DELETE = "delete-text";


        this.BUFFER_WIDTH_IN_PX = 20;
        this.BUFFER_HEIGHT_IN_PX = 20;

        this.overlap = false;
        this.overlap_el = null;
    }

    createPointData(el){
        var data = {
            el: el,
            normalized_position  : {
                left: (parseInt(el.style.left, 10) / this.canvas.width),
                top: (parseInt(el.style.top, 10) / this.canvas.height)
            }
        }

        return data;
    }

    addData(el){
        var data = this.createPointData(el);
        
        this.points.push(data);
        this.points_scroll.push(data);
    }

    createDeleteIcon(left,top,width,height){
        var html = '<svg width="12px" height="12px" viewBox="0 0 12 12" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">'+
        '<title>Fill</title>'+
        '<g id="Symbols" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">'+
            '<g id="Icon/Close" transform="translate(-6.000000, -6.000000)" fill="' + this.fontColor + '">' +
                '<path d="M13.41,12 L17.71,7.71 L17.7100001,7.70999993 C18.1021221,7.31787793 18.1021221,6.68211993 17.7099999,6.28999993 C17.3178779,5.89787793 16.6821199,5.89787793 16.2899999,6.29000007 L11.9999999,10.5900001 L7.70999993,6.29000007 L7.71,6.29000014 C7.317878,5.89787814 6.68212,5.89787814 6.29,6.29 C5.897878,6.682122 5.897878,7.31788 6.28999986,7.71 C6.28999986,7.71 6.28999986,7.71 6.28999986,7.71 L10.5899999,12 L6.28999986,16.29 L6.28999988,16.29 C5.89787788,16.67892 5.89528188,17.31208 6.28420151,17.7042 C6.28612635,17.7061407 6.28805914,17.7080735 6.28999983,17.7099983 L6.2899998,17.7099983 C6.6789198,18.1021203 7.3120798,18.1047163 7.7041998,17.7157967 C7.70614049,17.7138718 7.70807328,17.711939 7.70999812,17.7099983 L11.9999981,13.4099983 L16.2899981,17.7099983 L16.2899981,17.7099983 C16.6789181,18.1021203 17.3120781,18.1047163 17.7041981,17.7157967 C17.7061388,17.7138719 17.7080716,17.7119391 17.7099964,17.7099984 L17.7099965,17.7099983 C18.1021185,17.3210783 18.1047145,16.6879183 17.7157947,16.2957983 C17.7138699,16.2938576 17.7119371,16.2919249 17.7099964,16.29 L13.41,12 Z" id="Fill"></path>'+
            '</g>'+
        '</g>'+
        '</svg>';
        var iconEl = document.createElement('div');

        iconEl.innerHTML = html;
        iconEl.className = this.CLS_IMAGE_DELETE;
        iconEl.id = this.CLS_IMAGE_DELETE + new Date().getTime().toString();
        iconEl.style.position = "relative";
        iconEl.style.zIndex = "900000000";
        iconEl.style.display = "inline-block";
        iconEl.style.float = "right";
        iconEl.style.cursor = "pointer";
        // iconEl.src = "static/images/delete_text.svg";
        return iconEl;
    }
    
    createTextElementContainer(left, top, width, height) {
        var textElementContainer = document.createElement('div');
        textElementContainer.className = this.CLS_TEXT_TOOL_CONTAINER;
        textElementContainer.id = this.CLS_TEXT_TOOL_CONTAINER + (new Date()).getTime();
        textElementContainer.style.width = width + "px";
        textElementContainer.style.height = height + "px";
        textElementContainer.style.position = "absolute";
        textElementContainer.style.overflow = "auto";
        textElementContainer.style.top = top + "px";
        textElementContainer.style.left = left + "px";
        textElementContainer.style.border = "1px solid " + this.fontColor;
        textElementContainer.style.zIndex = "900000000";
        textElementContainer.style.padding = "10px";
        textElementContainer.style.cursor = "all-scroll";
        textElementContainer.style.boxSizing = "content-box";
        return textElementContainer;
    }

    createTextElement(minHeight) {
        var className = this.CLS_TEXT_TOOL_PREFIX;
        var textElement = document.createElement('div');
        textElement.className = className;
        textElement.id = className + (new Date()).getTime();
        textElement.contentEditable = "true";
        textElement.style.userSelect = "none";
        textElement.style.display = "inline-block";
        textElement.style.boxSizing = "border-box";
        textElement.style.width = "85%";
        textElement.style.height = "auto";
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

    updatePointsPosition(el){
        var points_id_arr = this.points.map(function(point){return point.el.id});
        var index = points_id_arr.indexOf(el.id);

        if (index !== -1){
            this.points.splice(index, 1, this.createPointData(el));
            this.points_scroll.splice(index, 1, this.createPointData(el));
        }
    }

    addText(posX, posY, width, height) {
        var _this = this;
        width = width - 20 < this.minInitWidth ? this.minInitWidth : width - 20;
        height = height - 20 < this.minInitHeight ? this.minInitHeight : height - 20;
        var textElement = this.createTextElement(height);
        var deleteTextIcon = this.createDeleteIcon(posX, posY, width, height);
        var textElementContainer = this.createTextElementContainer(posX, posY, width, height);
        textElementContainer.appendChild(deleteTextIcon);
    
        textElementContainer.appendChild(textElement);
        document.body.appendChild(textElementContainer);
        // lastEle = textElement;

        deleteTextIcon.addEventListener("click", function(evt){
            // alert(" clickeed " + this.id);
            $('#' + this.id).parent().remove();
        });
        // textElement.addEventListener("click", showEditTextToolbarOnClick, {
        //     useCapture: true,
        //     passive: false
        // });
       
        textElement.focus();

        $('.'+ this.CLS_TEXT_TOOL_CONTAINER).draggable({
            stop: function(evt, ui){
                var el = this;
                _this.updatePointsPosition(el);
            }
        }).resizable();
        $('.ui-resizable-s').css("bottom", "0px");
        $('.ui-resizable-e').css("right", "0px");

        return textElementContainer;
        
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
                    _this.overlap_el = $(this);
                }
            }
        });

        return this.overlap;
    }

    handleMouseDown(e){
        var _this = this;
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
            textEle.style.border = "2px solid " + this.fontColor;
            textEle.style.zIndex = "2147483642";
            document.body.appendChild(textEle);

            // delete all empty texts
            var all_texts = $('.' + this.CLS_TEXT_TOOL_PREFIX);
            $.each(all_texts, function(index, el){
                var el_content = $(this).html();
                if (el_content.length == 0){
                    $(this).parent().remove();

                    var el_parent_id = $(this).parent().attr("id");
                    var points_id = _this.points.map(function(p){return p.el.id});

                    var el_index = points_id.indexOf(el_parent_id);

                    _this.points.splice(el_index, 1);
                    _this.points_scroll.splice(el_index, 1);
                }
            });
        }
        else{
            // focus on overlapping el
            var textEl_focus = this.overlap_el.find('.' + this.CLS_TEXT_TOOL_PREFIX);    
            textEl_focus.focus();
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

            var textElementContainer = this.addText(eleLeft, eleTop, eleWidth, eleHeight);
            this.addData(textElementContainer);
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

    drawScroll(data){
        
        var _this = this;
        this.points_scroll = this.points_scroll.map(function(obj){

            var point_x = ((obj.normalized_position.left * _this.canvas.width)  + data.left) / _this.canvas.width;
            var point_y = ((obj.normalized_position.top * _this.canvas.height) + data.top) / _this.canvas.height;
            return {
                el: obj.el,
                normalized_position: {
                    left: point_x,
                    top: point_y
                }
            }
        });
        
        this.draw(this.points_scroll);
    }

    draw(points_arr){
        var _this = this;
        var points = points_arr || this.points;

        points.forEach(function(obj){
            var el = obj.el;
            var normalized_position = obj.normalized_position;
            el.style.left = (normalized_position.left * _this.canvas.width) + "px";
            el.style.top = (normalized_position.top * _this.canvas.height) + "px";
        });
    }

    deleteText(){
        $('.' + this.CLS_TEXT_TOOL_CONTAINER).remove();
    }

    delete(){
        super.delete();
        this.deleteText();
    }

    update(data){
        if (data.hasOwnProperty("color")){
            this.fontColor = data.color;
        }
    }

    activate(){
        var style_local = {
            "z-index": this.zIndexHighest, 
            "pointer-events": "auto",
        }

        var style_parent = {
            "z-index": this.zIndexHighest, 
            "pointer-events": "auto"
        }
        this.updateCss(style_local, style_parent);
        $('.'+ this.CLS_TEXT_TOOL_CONTAINER).draggable('enable').resizable('enable');
    }

    deactivate(){
        super.deactivate();
        $('.'+ this.CLS_TEXT_TOOL_CONTAINER).draggable('disable').resizable('disable');
    }
}
