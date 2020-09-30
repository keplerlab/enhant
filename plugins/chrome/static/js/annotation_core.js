class AnnotationTool{
    constructor(canvas_id){
        this.canvas_id = canvas_id;

        this.zIndexLowest = "-1";
        this.zIndexHighest = "2147483647";

        this.mouse_position = {
            x: 0,
            y: 0
        }
    }

    getCanvas(){
        var canvas = $("#" + this.canvas_id);
        return canvas;
    }

    getCanvasContext(){
        var canvas_el = this.getCanvas()[0];
        var ctx = canvas_el.getContext('2d');
        return ctx;
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
        var canvas = this.getCanvas()[0];
        x = e.clientX - canvas.offsetLeft; 
        y = e.clientY - canvas.offsetTop; 

        this.mouse_position = {
            x: x,
            y: y
        }
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
    constructor(canvas_id){
        super(canvas_id);

        this.zIndex = "0";
    }

    updateCss(){
        var _this = this;
        var canvas = _this.getCanvas();

        var style_obj = {
            "pointer-events": "none",
            "position": "block",
            "z-index": _this.zIndexHighest,
            "display": "block",
            "cursor": "default"
        }

        _this.updateParentIframeZIndex(style_obj);

        // set the z-index of the canvas to low value so it hides beneath 
        canvas.css(style_obj);
    }

    activate(data){
        var _this = this;
        _this.updateCss();
    }

}

class Pen extends AnnotationTool{
    constructor(canvas_id){
        super(canvas_id);

        // default pen settings
        this.stroke = 3;
        this.color = "black";
        this.lineCap = "round";
        this.cursor_path = "";

        this.paint = false;
    }

    handleMouseUp(e){
        this.paint = false;
    }

    handleMouseDown(e){

        this.updateMousePosition(e);
        this.paint = true;
    }

    handleMouseMove(e){

        // draw only if paint is enabled (between mouse up and down)
        if (!this.paint) return;
        var ctx = this.getCanvasContext();
        ctx.beginPath();
        ctx.lineWidth = this.stroke;
        ctx.lineCap = this.lineCap;
        ctx.strokeStyle = this.color;

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
    }

    updateCss(){
        var _this = this
        var canvas = _this.getCanvas();

        var style_obj = {
            "z-index": _this.zIndexHighest, 
            "pointer-events": "auto",
            "position": "absolute",
            "cursor": _this.cursor_path == "" ? "default" : "url('" + _this.cursor_path + "'), auto"
        }

        _this.updateParentIframeZIndex(style_obj);

        // set the z-index of the canvas to low value so it hides beneath 
        canvas.css(style_obj);
    }

    activate(data){
        console.log(" activating tool with data ", data);
        this.setPenData(data);
        this.updateCss();

        console.log(" tool activated ", this.constructor.name);

    }

}

class Eye extends AnnotationTool{
    constructor(canvas_id){
        super(canvas_id);

        this.hidden = false;
    }

    activate(){
        var canvas = this.getCanvas();
        if (this.hidden){
            this.hidden = false;
            canvas.show();
        }
        else{
            this.hidden = true;
            canvas.hide();
        }
    }

    deactivate(){
        var canvas = this.getCanvas();
        this.hidden = false;
        canvas.show();
    }
}