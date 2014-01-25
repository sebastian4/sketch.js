var __slice = Array.prototype.slice;
(function($) {
    var Sketch;
    $.fn.sketch = function() {
        var args, key, sketch;
        key = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        if (this.length > 1) {
            $.error('Sketch.js can only be called on one element at a time.');
        }
        sketch = this.data('sketch');
        if (typeof key === 'string' && sketch) {
            if (sketch[key]) {
                if (typeof sketch[key] === 'function') {
                    return sketch[key].apply(sketch, args);
                } else if (args.length === 0) {
                    return sketch[key];
                } else if (args.length === 1) {
                    return sketch[key] = args[0];
                }
            } else {
                return $.error('Sketch.js did not recognize the given command.');
            }
        } else if (sketch) {
            return sketch;
        } else {
            this.data('sketch', new Sketch(this.get(0), key));
            return this;
        }
    };
    Sketch = (function() {
        function Sketch(el, opts) {
            this.el = el;
            this.imgdir = "../images/sketchjs/";
            this.el.style.cursor = "url('"+this.imgdir+"cursor.pencil.png'), pointer";
            this.canvas = $(el);
            this.canvas.addClass("sketchcanvas");
            this.context = el.getContext('2d');
            this.options = $.extend({
                toolLinks: true,
                defaultTool: 'drawlines',
                defaultColor: '#000000',
                defaultSize: 7
            }, opts);
            this.painting = false;
            this.color = this.options.defaultColor;
            this.size = this.options.defaultSize;
            this.tool = this.options.defaultTool;
            this.gridsize = 8;
            this.showthegrid = false;
            this.showthegridsize = 0;
            this.actions = [];
            this.action = [];
            this.actionindex = 0;
            this.toogleToolFlag = false;
            this.lastdrawlinesmousemove = null;
            this.firstMoveToCanvas = false;
            this.canvas.bind('click mousedown mouseup mousemove mouseleave mouseout touchstart touchmove touchend touchcancel dblclick', this.onEvent);
            if (this.options.toolLinks) {
                $('body').delegate("a[href=\"#" + (this.canvas.attr('id')) + "\"]", 'click', function(e) {
                    var $canvas, $this, key, sketch, _i, _len, _ref;
                    $this = $(this);
                    $canvas = $($this.attr('href'));
                    sketch = $canvas.data('sketch');
                    _ref = ['color', 'size', 'tool', 'update'];
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        key = _ref[_i];
                        if ($this.attr("data-" + key)) {
                            sketch.set(key, $(this).attr("data-" + key));
                        }
                    }
                    if ($(this).attr('data-savetostorage')) {
                        sketch.savetostorage($(this).attr('data-savetostorage'));
                    }
                    if ($(this).attr('data-download')) {
                        sketch.download($(this).attr('data-download'));
                    }
                    if ($(this).attr('data-clear')) {
                        sketch.clear($(this).attr('data-clear'));
                    }
                    if ($(this).attr('data-console')) {
                        sketch.console();
                    }
                    if ($(this).attr('data-undo')) {
                        sketch.undo();
                    }
                    if ($(this).attr('data-showgrid')) {
                        sketch.showgrid();
                    }
                    if ($(this).attr('data-showgrid-increase')) {
                        sketch.showgridincrease();
                    }
                    if ($(this).attr('data-showgrid-decrease')) {
                        sketch.showgriddecrease();
                    }
                    return false;
                });
            }
            $(this.el.parentNode).scroll(function() {
                if (this.childNodes.length > 0 && this.childNodes[1]!==null) {
                    var $childCanvas = $(this.childNodes[1]);
                    var $tsketch = $childCanvas.data('sketch');
                    $tsketch.reshiftBackground();
                }                
            });
            this.clear("starting");
            this.showgrid();
        }
        Sketch.prototype.savetostorage = function(format) {
            //console.log("save to storage");
            var mime;
            format || (format = "png");
            if (format === "jpg") {
                format = "jpeg";
            }
            mime = "image/" + format;
            localStorage.setItem("currentImage", this.el.toDataURL(mime));
            return false;
        };
        Sketch.prototype.download = function(format) {
            //console.log("download");
            return window.open(localStorage.getItem("currentImage"));
        };
        Sketch.prototype.undo = function() {
            //console.log("undo");
            if (this.actions.length > 0 && this.actions[this.actions.length-1].tool == "empty") {
                this.actions.length = this.actions.length - 1;
            }
            if (this.actions.length > 0) {
                this.actions.length = this.actions.length - 1;
                this.redraw();
            }
            this.actionindex = this.actions.length;
            return false;
        };
        Sketch.prototype.clear = function(message) {
            //console.log("clear, " + message);
						var doClear = false;
						if (message !== "starting") {
							 var doClear = confirm("Do you want to clear the whole image?");
						}
						if (doClear) {
							 this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
            	 this.actions.length = 0;
            	 this.actionindex = this.actions.length;
						}
            return false;
        };
        Sketch.prototype.showgrid = function() {
            //console.log("show grid");
            var canvas_element = $(this.el);
            if (this.showthegrid === false) {
                canvas_element.addClass("sketchshowgrids");
                //canvas_element.addClass("sketchshowgrids"+this.showthegridsize);
                this.reshiftBackground();
                this.showthegrid = true;
            } else {
            	canvas_element.removeClass("sketchshowgrids");
                this.showthegrid = false;
            }
        };
        Sketch.prototype.reshiftBackground = function() {
            //console.log("reshiftBackground");
            var canvas_element = $(this.el);
            var backgroundWidth = 80*(this.gridsize);
            var backgroundHeight = 50*(this.gridsize);
            var backgroundPosHorizontal = ( Math.round((this.canvas.offset().left+this.el.parentNode.scrollLeft) / this.gridsize) * this.gridsize ) 
                                            - (this.canvas.offset().left+this.el.parentNode.scrollLeft) + (this.el.parentNode.scrollLeft%this.gridsize);
            var backgroundPosVertical = ( Math.round(this.canvas.offset().top / this.gridsize) * this.gridsize ) - this.canvas.offset().top;
            canvas_element.css("background-size",backgroundWidth+"px "+backgroundHeight+"px");
            canvas_element.css("background-position",backgroundPosHorizontal+"px "+backgroundPosVertical+"px"); 
        };
        Sketch.prototype.showgridincrease = function() {
            if (this.showthegrid === true) {
                this.showgrid();
                this.showthegridsize = this.showthegridsize + 1;
                if (this.showthegridsize > 9) {
                    this.showthegridsize = 9;
                }
                this.gridsize = 8 + (this.showthegridsize);
                this.showthegrid = false;
                this.showgrid();
            }
        };
        Sketch.prototype.showgriddecrease = function() {
            if (this.showthegrid === true) {
                this.showgrid();
                this.showthegridsize = this.showthegridsize - 1;
                if (this.showthegridsize < -1) {
                    this.showthegridsize = -1;
                }
                this.gridsize = 8 + (this.showthegridsize);
                this.showthegrid = false;
                this.showgrid();
            }
        };
        Sketch.prototype.console = function() {
            console.group("sketch snapshot");
        	console.group("sketch snapshot - main");
        	console.log('current painting: '+this.painting);
            console.log('current tool: '+this.tool);
            console.log('current color: '+this.color);
            console.log('current size: '+this.size);
            console.groupEnd();
            console.group("sketch snapshot - grid stuff");
            console.log('current gridsize: '+this.gridsize);
            console.log('current showthegrid: '+this.showthegrid);
            console.log('current showthegridsize: '+this.showthegridsize);
            console.log('current paintingongrid: '+this.paintingongrid);
            console.groupEnd();
            console.group("sketch snapshot - actions");
            console.log('actions:');
            console.log(this.actions);
            console.log('actions length: '+this.actions.length);
            console.log('action index: '+this.actionindex);
            if (this.actions.length > 3) {
            	console.log('before *3 last action:');
                console.log(JSON.stringify(this.actions[this.actions.length - 4]));
            } else {
                console.log('before *3 last action: none');
            }
            if (this.actions.length > 2) {
            	console.log('before *2 last action:');
                console.log(JSON.stringify(this.actions[this.actions.length - 3]));
            } else {
                console.log('before *2 last action: none');
            }
            if (this.actions.length > 1) {
            	console.log('before last action:');
                console.log(JSON.stringify(this.actions[this.actions.length - 2]));
            } else {
                console.log('before last action: none');
            }
            if (this.actions.length > 0) {
            	console.log('last action:');
                console.log(JSON.stringify(this.actions[this.actions.length - 1]));
            } else {
                console.log('last action: none');
            }
            console.groupEnd();
            console.groupEnd();
            return false;
        };
        Sketch.prototype.set = function(key, value) {
            //console.log('set '+key+' : '+value);
            if (key === 'update') {
                //console.log('update on size '+this['size']+' with value '+value);
                this['size'] = parseInt(this['size']) + parseInt(value);
                //console.log('updated to '+this['size']);
                if (this['size'] < 1) { this['size'] = 1; }
                if (this['size'] > 19) { this['size'] = 19; }
            } else {
                //this is the main setter
                this[key] = value;
            }
            if (key === "tool") {
                //console.log("tool chosen with value "+value);
                if (value === "toggle") {
                    if (this.toogleToolFlag) {
                        value = "drawlines";
                        this.toogleToolFlag = false;
                    } else {
                        value = "marker";
                        this.toogleToolFlag = true;
                    }
                    this[key] = value;
                    this.showgrid();
                }
                //console.log("tool chosen with value "+value);
                if (value === "marker") {
                    this.el.style.cursor = "url('"+this.imgdir+"cursor.brush.png'), pointer";
                } else if (value === "eraser") {
                    this.el.style.cursor = "url('"+this.imgdir+"cursor.eraser.png'), no-drop";
                } else if (value === "snaptogrid") {
                    this.el.style.cursor = "url('"+this.imgdir+"cursor.ruler.png'), pointer";
                } else if (value === "drawlines") {
                    this.el.style.cursor = "url('"+this.imgdir+"cursor.pencil.png'), pointer";
                } else { // default cursor
                    this.el.style.cursor = "url('"+this.imgdir+"cursor.brush.png'), pointer";
                } 
            }
            return this.canvas.trigger("sketch.change" + key, value);
        };
        Sketch.prototype.startPainting = function() {
            this.painting = true;
            return this.action = {
                tool: this.tool,
                color: this.color,
                size: parseFloat(this.size),
                index: this.actionindex,
                events: []
            };
        };
        Sketch.prototype.stopPainting = function() {
            if (this.action) {
                this.actions.push(this.action);
            }
            this.actionindex = this.actions.length;
            this.painting = false;
            this.action = null;
            return this.redraw();
        };
        Sketch.prototype.paintVertex = function() {
            return this.action = {
                tool: this.tool,
                color: this.color,
                size: parseFloat(this.size),
                index: this.actionindex,
                events: []
            };
        };
        Sketch.prototype.paintEmptySegment = function() {
            return this.action = {
                tool: "empty",
                color: null,
                size: 0,
                index: this.actionindex,
                events: []
            };
        };
        Sketch.prototype.onEvent = function(e) {
            if (e.originalEvent && e.originalEvent.targetTouches) {
                e.pageX = e.originalEvent.targetTouches[0].pageX;
                e.pageY = e.originalEvent.targetTouches[0].pageY;
            }
            $.sketch.tools[$(this).data('sketch').tool].onEvent.call($(this).data('sketch'), e);
            e.preventDefault();
            return false;
        };
        Sketch.prototype.redraw = function() {
            var sketch;
            this.el.width = this.canvas.width();
            this.context = this.el.getContext('2d');
            sketch = this;
            $.each(this.actions, function() {
                if (this.tool) { // this paints afterwards
                    return $.sketch.tools[this.tool].draw.call(sketch, this);
                }
            });
            if (this.painting && this.action) { // this paints on the fly
                return $.sketch.tools[this.action.tool].draw.call(sketch, this.action);
            }
        };
        return Sketch;
    })();
    $.sketch = {
        tools: {}
    };
    $.sketch.tools.marker = {
        onEvent: function(e) {
            switch (e.type) {
                case 'mousedown':
                case 'touchstart':
                    this.startPainting();
                    break;
                case 'mouseup':
                case 'mouseout':
                case 'mouseleave':
                case 'touchend':
                case 'touchcancel':
                    this.stopPainting();
            }
            if (this.painting) {
                this.action.events.push({
                    x: e.pageX - this.canvas.offset().left,
                    y: e.pageY - this.canvas.offset().top,
                    event: e.type
                });
                return this.redraw();
            }
        },
        draw: function(action) {
            var event, previous, _i, _len, _ref;
            this.context.lineJoin = "round";
            this.context.lineCap = "round";
            this.context.beginPath();
            this.context.moveTo(action.events[0].x, action.events[0].y);
            _ref = action.events;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                event = _ref[_i];
                this.context.lineTo(event.x, event.y);
                previous = event;
            }
            this.context.strokeStyle = action.color;
            this.context.lineWidth = action.size;
            return this.context.stroke();
        }
    };
    $.sketch.tools.snaptogrid = {
        onEvent: function(e) {
            switch (e.type) {
                case 'mousedown':
                case 'touchstart':
                    this.startPainting();
                    break;
                case 'mouseup':
                case 'mouseout':
                case 'mouseleave':
                case 'touchend':
                case 'touchcancel':
                    this.stopPainting();
            }
            if (this.painting) {
                this.action.events.push({
                    x: ( Math.round(e.pageX / this.gridsize) * this.gridsize ) - this.canvas.offset().left,
                    y: ( Math.round(e.pageY / this.gridsize) * this.gridsize ) - this.canvas.offset().top,
                    event: e.type
                });
                return this.redraw();
            }
        },
        draw: function(action) {
            var event, previous, _i, _len, _ref;
            this.context.lineJoin = "round";
            this.context.lineCap = "round";
            this.context.beginPath();
            this.context.moveTo(action.events[0].x, action.events[0].y);
            _ref = action.events;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                event = _ref[_i];
                this.context.lineTo(event.x, event.y);
                previous = event;
            }
            this.context.strokeStyle = action.color;
            this.context.lineWidth = action.size;
            return this.context.stroke();
        }
    };
    $.sketch.tools.drawlines = {
        onEvent: function(e) {
        	var paintingVertex = false;
            var endSegment = false;
            var mouseMove = false;
            switch (e.type) {
                case 'mousedown':
                case 'touchstart':
                    this.paintVertex();
                    paintingVertex = true;
                    break;
                case 'dblclick':
                    this.paintVertex();
                    paintingVertex = true;
                    endSegment = true;
                    break;
                case 'mouseup':
                case 'mouseout':
                case 'mouseleave':
                case 'touchend':
                case 'touchcancel':
                    break;
                case 'mousemove':
                    if (this.firstMoveToCanvas === false) {
                        this.reshiftBackground();
                        this.firstMoveToCanvas = true;
                    }
                    mouseMove = true;
                    break;
            }
            if (paintingVertex) {
                this.action.events.push({
                    x: ( Math.round(e.pageX / this.gridsize) * this.gridsize ) - this.canvas.offset().left,
                    y: ( Math.round(e.pageY / this.gridsize) * this.gridsize ) - this.canvas.offset().top,
                    event: e.type
                });
                //console.log("showthegridsize="+this.showthegridsize+"; gridsize="+this.gridsize+"; offset-left="+this.canvas.offset().left+"; offset-top="+this.canvas.offset().top+"; e.pageX="+e.pageX+"; e.pageY="+e.pageY);
                //console.log("coords: "+(( Math.round(e.pageX / this.gridsize) * this.gridsize ) - this.canvas.offset().left )+" , "+(( Math.round(e.pageY / this.gridsize) * this.gridsize ) - this.canvas.offset().top));
                this.actions.push(this.action);
                if (endSegment) {
                    this.actions.length = this.actions.length - 2;
                    this.actionindex = this.actions.length;
                    this.actions.push(this.paintEmptySegment());
                }
                this.actionindex = this.actions.length;
                return this.redraw();
            } else if (mouseMove) {
                this.context.beginPath();
                this.redraw();
                var lastactionindex = (this.actions.length)-1;
                if (this.actions.length > 0 && lastactionindex >= 0
            	    && this.actions[lastactionindex] !== undefined
            	    && this.actions[lastactionindex].tool == "drawlines") {
            	    var lasttempaction = this.actions[lastactionindex];
                    this.lastdrawlinesmousemove = {
                        x1: lasttempaction.events[0].x,
                        y1: lasttempaction.events[0].y,
                        x2: ( (Math.round(e.pageX / this.gridsize) * this.gridsize ) - this.canvas.offset().left),
                        y2: ( (Math.round(e.pageY / this.gridsize) * this.gridsize ) - this.canvas.offset().top)
                    };
            	    this.context.moveTo(this.lastdrawlinesmousemove.x1, this.lastdrawlinesmousemove.y1);
                    this.context.lineTo(this.lastdrawlinesmousemove.x2, this.lastdrawlinesmousemove.y2);
                } else {
                    //console.log("scrollLeft="+this.el.parentNode.scrollLeft+", scrollLeft%gridsize="+this.el.parentNode.scrollLeft%this.gridsize
                    //            +", canvas.offset="+this.canvas.offset().left+", scroll+off="+(this.el.parentNode.scrollLeft+this.canvas.offset().left));
                    this.lastdrawlinesmousemove = null;
                    this.context.fillRect(
                        ( (Math.round(e.pageX / this.gridsize) * this.gridsize ) - this.canvas.offset().left) - this['size']/2, 
                        ( (Math.round(e.pageY / this.gridsize) * this.gridsize ) - this.canvas.offset().top) - this['size']/2, 
                        this['size'], this['size']
                    );
                }
                return this.context.stroke();
            }
        },
        draw: function(action) {
            this.context.lineJoin = "round";
            this.context.lineCap = "round";
            this.context.beginPath();
            var lastactionindex = (action.index)-1;
            if (this.actions.length > 0 && lastactionindex >= 0
            	&& this.actions[lastactionindex] !== undefined
            	&& this.actions[lastactionindex].tool == "drawlines") {
            	var lasttempaction = this.actions[lastactionindex];
            	this.context.moveTo(lasttempaction.events[0].x, lasttempaction.events[0].y);
                this.context.lineTo(action.events[0].x, action.events[0].y);
                this.lastdrawlinesmousemove = null;
            } else {
                this.context.arc(
                    action.events[0].x, 
                    action.events[0].y, 
                    this['size']/32, 0, 2*Math.PI
                );
            	//this.context.moveTo(action.events[0].x, action.events[0].y);
                //this.context.lineTo(action.events[0].x, action.events[0].y);
            }
            this.context.strokeStyle = action.color;
            this.context.lineWidth = action.size;
            return this.context.stroke();
        }
    };
    $.sketch.tools.empty = {
        onEvent: function(e) {
            return null;
        },
        draw: function(action) {
            return null;
        }
    };
    return $.sketch.tools.eraser = {
        onEvent: function(e) {
            return $.sketch.tools.marker.onEvent.call(this, e);
        },
        draw: function(action) {
            var oldcomposite;
            oldcomposite = this.context.globalCompositeOperation;
            this.context.globalCompositeOperation = "destination-out";
            action.color = "rgba(0,0,0,1)";
            action.size = 15;
            $.sketch.tools.marker.draw.call(this, action);
            return this.context.globalCompositeOperation = oldcomposite;
        }
    };
})(jQuery);
