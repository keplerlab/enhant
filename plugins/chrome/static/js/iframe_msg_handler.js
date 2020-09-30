const AnnotationTools = [
    Select,
    Pen,
    Eye
]

const AnnotationMessageCLSMapping = {
    select: Select,
    pen: Pen,
    eye: Eye
};


const MESSAGING_PROTOCOL = {
    annotation_active: "annotation_active",
    annotation_inactive: "annotation_inactive",
    annotation_tool: "annotation_tool",
    resize: "resize"
};

class Annotation{
    constructor(){
        this.annotation_tools_ref = {};
        this.canvas_id = "enhant-annotation-canvas";

        // default class is the select tool
        this.selected_cls = Select.name;
    }

    initializeCanvas(){
        $('#' + this.canvas_id).css({
            "top": "0px",
            "left": "0px"
        });

        this.resizeCanvas();
    }

    resizeCanvas(e){
        var htmlCanvas = document.getElementById(this.canvas_id);
        htmlCanvas.width = window.innerWidth;
        htmlCanvas.height = window.innerHeight;
    }

    addCanvasToBody(html){
        $("body").prepend(html);
        this.initializeCanvas();
    }

    // create the canvas
    createCanvas(){
        var html = "<canvas id='" + this.canvas_id + "'></canvas>";
        this.addCanvasToBody(html);
    }

    // handle events to respective classes
    handleMouseDown(e){
        var _this = this;
        var tool_obj = _this.annotation_tools_ref[_this.selected_cls];
        tool_obj.handleMouseDown(e);
    }

    // handle events to respective classes
    handleMouseUp(e){
        var _this = this;
        var tool_obj = _this.annotation_tools_ref[_this.selected_cls];
        tool_obj.handleMouseUp(e);
    }

    // handle events to respective classes
    handleMouseMove(e){
        var _this = this;
        var tool_obj = _this.annotation_tools_ref[_this.selected_cls];
        tool_obj.handleMouseMove(e);
    }

    handleScroll(e){
        console.log(" scroll ", e);
        var _this = this;
        requestAnimationFrame(function(){
            if (window.scrollY + document.documentElement.clientHeight <= document.documentElement.scrollHeight) {

                $('#' + _this.canvas_id).css({
                    "top": window.scrollY + "px"
                });
                
            }
            if (window.scrollX + document.documentElement.clientWidth <= document.documentElement.scrollWidth) {
    
                $('#' + _this.canvas_id).css({
                    "left": window.scrollX + "px"
                });
            }
        });
    }

    // will be called when annotation is enabled
    registerListeners(){
        var _this = this;   
        window.addEventListener("resize", _this.resizeCanvas.bind(_this));
        window.addEventListener("mousedown", _this.handleMouseDown.bind(_this));
        window.addEventListener("mouseup", _this.handleMouseUp.bind(_this));
        window.addEventListener("mousemove", _this.handleMouseMove.bind(_this));
    }

    // will be called when annotation is disabled
    removeListeners(){
        var _this = this;
        window.removeEventListener("resize", _this.resizeCanvas.bind(_this));
        window.removeEventListener("mousedown", _this.handleMouseDown.bind(_this));
        window.removeEventListener("mouseup", _this.handleMouseUp.bind(_this));
        window.removeEventListener("mousemove", _this.handleMouseMove.bind(_this));
    }

    initialize(){
        var _this = this;
        AnnotationTools.forEach(function(cls){
            _this.annotation_tools_ref[cls.name] =  new cls(_this.canvas_id);
        });

        _this.createCanvas();
    }

    selectTool(cls_name, data){
        var _this = this;

        _this.selected_cls = cls_name;

        var tool_obj = _this.annotation_tools_ref[_this.selected_cls];

        console.log(" selecting tool ", tool_obj);
        tool_obj.activate(data);
    }

    removeSelectedTool(){
        var _this = this;
        var tool_obj = _this.annotation_tools_ref[_this.selected_cls];
        tool_obj.deactivate();
    }

    clear(){
        var _this = this;
        _this.removeSelectedTool();
        _this.removeListeners();
    }
}

var _annotation;

window.addEventListener("message", function(m){
    console.log(" Message received from enhan(t) plugin ", m);

    var key = m["data"]["key"];

    // if (key == MESSAGING_PROTOCOL.resize){
        
    //     if (_annotation instanceof Annotation){
    //         _annotation.resizeCanvas(m["data"]["scale"]);
    //     }
    // }

    // based on the message key get the annotation class
    if (key == MESSAGING_PROTOCOL.annotation_active){
        _annotation = new Annotation();
        _annotation.initialize();
        _annotation.registerListeners();
    }

    if (key == MESSAGING_PROTOCOL.annotation_inactive){

        if (_annotation instanceof Annotation){
            _annotation.clear();
            delete _annotation;
        }
        
    };

    if (key == MESSAGING_PROTOCOL.annotation_tool){

        var tool_info = m.data.tool_info;
        var tool_name = tool_info["name"];
        var tool_data = tool_info["data"];

        if (_annotation instanceof Annotation){
             // remove the previous selected tool
            _annotation.removeSelectedTool();
            _annotation.selectTool(tool_name, tool_data);
        }
       
    }

});