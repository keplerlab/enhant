const AnnotationTools = [
    Select,
    Pen,
    Highlight,
    Eye,
    Delete,
    Text,
    Erase
];


const MESSAGING_PROTOCOL = {
    annotation_active: "annotation_active",
    annotation_inactive: "annotation_inactive",
    activate_tool: "activate_tool",
    update_tool: "update_tool",
    resize: "resize",
    scroll: "scroll"
};

class Annotation{
    constructor(){
        this.annotation_tools_ref = {};
        this.canvas_id = "enhant-annotation-canvas";

        // array to save points
        this.points = [];

        // default class is the select tool
        this.selected_cls = Select.name;

        this.left = 0;
        this.top = 0;

        this.originalWidth = 0;
        this.originalHeight = 0;

        this.canvas = null;
        this.ctx = null;
    }

    clearCanvas(){
        var canvas = document.getElementById(this.canvas_id);
        var ctx = canvas.getContext("2d");
        ctx.clearReact(0, 0, canvas.width, canvas.height);

        this.points = [];
    }

    resizeCanvas(scale_data){

        var htmlCanvas = document.getElementById(this.canvas_id);

        var canvas_jquery = $('#' + this.canvas_id);
        var scaleWidth = (canvas_jquery.width() / this.originalWidth);
        var scaleHeight = (canvas_jquery.height() / this.originalHeight);
        canvas_jquery.attr("scaleWidth", scaleWidth);
        canvas_jquery.attr("scaleHeight", scaleHeight);

        htmlCanvas.width = scale_data.width;
        htmlCanvas.height = scale_data.height;
    }

    setCanvasAndContext(){
        var canvas = document.getElementById(this.canvas_id);
        
        var ctx = canvas.getContext("2d");
        this.canvas = canvas;
        this.ctx = ctx;
    }

    // create the canvas
    createCanvas(){
        var html = "<canvas id='" + this.canvas_id + "'></canvas>";
        $("body").prepend(html);
        $('#' + this.canvas_id).css({
            "top": "0px",
            "left": "0px"
        });

        var htmlCanvas = document.getElementById(this.canvas_id);
        htmlCanvas.width = window.innerWidth;
        htmlCanvas.height = window.innerHeight;

        this.originalWidth = htmlCanvas.width;
        this.originalHeight = htmlCanvas.height;

        $('#' + this.canvas_id).attr("scaleWidth", 1);
        $('#' + this.canvas_id).attr("scaleHeight", 1);

        this.setCanvasAndContext();
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

    handleResize(e){
        var _this = this;
        for (const cls in _this.annotation_tools_ref){
            var tool_obj = _this.annotation_tools_ref[cls];

            if (tool_obj.points.length > 0){
                tool_obj.handleResize(e);
            }
        }
    }

    handleScroll(data){
        var _this = this;
        $('#'+ _this.canvas_id).css({
            "left": data.left,
            "top": data.top
        });
        _this.clearCanvas();
    }

    // will be called when annotation is enabled
    registerListeners(){
        var _this = this;   
        // window.addEventListener("resize", _this.resizeCanvas.bind(_this));
        window.addEventListener("mousedown", _this.handleMouseDown.bind(_this));
        window.addEventListener("mouseup", _this.handleMouseUp.bind(_this));
        window.addEventListener("mousemove", _this.handleMouseMove.bind(_this));
    }

    // will be called when annotation is disabled
    removeListeners(){
        var _this = this;
        // window.removeEventListener("resize", _this.resizeCanvas.bind(_this));
        window.removeEventListener("mousedown", _this.handleMouseDown.bind(_this));
        window.removeEventListener("mouseup", _this.handleMouseUp.bind(_this));
        window.removeEventListener("mousemove", _this.handleMouseMove.bind(_this));
    }

    initialize(){
        var _this = this;
        _this.createCanvas();

        AnnotationTools.forEach(function(cls){
            _this.annotation_tools_ref[cls.name] =  new cls(_this.canvas, _this.ctx);
        });
    }

    updateSelectedTool(data){
        var _this = this;
        var tool_obj = _this.annotation_tools_ref[_this.selected_cls];
        tool_obj.update(data);
    }

    selectTool(cls_name, tool_data){
        var _this = this;

        _this.selected_cls = cls_name;

        var tool_obj = _this.annotation_tools_ref[_this.selected_cls];

        if (cls_name == Delete.name){
            var cls_arr = [Pen.name, Highlight.name, Text.name];
            var tool_arr = cls_arr.map(function(cls){return _this.annotation_tools_ref[cls]});
            tool_obj.activate(tool_arr);
        }
        else{
            tool_obj.activate(tool_data);
        }
        
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

var _annotation = null;

window.addEventListener("message", function(m){
    // console.log(" Message received from enhan(t) plugin ", m);

    var key = m["data"]["key"];

    if (key == MESSAGING_PROTOCOL.resize){
        if (_annotation instanceof Annotation){
            _annotation.resizeCanvas(m["data"]["scale"]);
            _annotation.handleResize();
        }
    }

    if (key == MESSAGING_PROTOCOL.scroll){
        if (_annotation instanceof Annotation){
            var scroll_data = m["data"]["position"];
            _annotation.handleScroll(scroll_data);
        }
    }

    // based on the message key get the annotation class
    if (key == MESSAGING_PROTOCOL.annotation_active){
        if (!(_annotation instanceof Annotation)){
            _annotation = new Annotation();
            _annotation.initialize();
            _annotation.registerListeners();
        }
    }

    if (key == MESSAGING_PROTOCOL.annotation_inactive){
        if (_annotation instanceof Annotation){
            _annotation.clear();
            delete _annotation;
            _annotation = null;
        }
        
    };

    if (key == MESSAGING_PROTOCOL.activate_tool){
        var tool_info = m.data.tool_info;
        var tool_name = tool_info["name"];
        var tool_data = tool_info["data"];

        if (_annotation instanceof Annotation){
             // remove the previous selected tool
            _annotation.removeSelectedTool();
            _annotation.selectTool(tool_name, tool_data);
        }
       
    }

    if (key == MESSAGING_PROTOCOL.update_tool){
        var tool_info = m.data.tool_info;
        var tool_name = tool_info["name"];
        var tool_data = tool_info["data"];

        if (_annotation instanceof Annotation){
            _annotation.updateSelectedTool(tool_data);
        }
       
    }

});