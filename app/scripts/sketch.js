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
            this.el.style.cursor = "url('../images/cursor.brush.png'), pointer";
            this.canvas = $(el);
            this.canvas.addClass("sketchcanvas");
            this.context = el.getContext('2d');
            this.options = $.extend({
                toolLinks: true,
                defaultTool: 'marker',
                defaultColor: '#000000',
                defaultSize: 5
            }, opts);
            this.painting = false;
            this.color = this.options.defaultColor;
            this.size = this.options.defaultSize;
            this.tool = this.options.defaultTool;
            this.gridsize = 12;
            this.showthegrid = false;
            this.showthegridsize = 1;
            this.actions = [];
            this.action = [];
            this.canvas.bind('click mousedown mouseup mousemove mouseleave mouseout touchstart touchmove touchend touchcancel', this.onEvent);
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
        }
        Sketch.prototype.savetostorage = function(format) {
            console.log("save to storage");
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
            console.log("download");
            return window.open(localStorage.getItem("currentImage"));
        };
        Sketch.prototype.undo = function() {
            console.log("undo");
            if (this.actions.length > 0) {
                this.actions.length = this.actions.length - 1;
                this.redraw();
            }
            return false;
        };
        Sketch.prototype.clear = function(message) {
            console.log("clear, " + message);
            this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
            this.actions.length = 0;
            return false;
        };
        Sketch.prototype.showgrid = function() {
            console.log("show grid");
            var canvas_element = $(this.el);
            if (this.showthegrid === false) {
                canvas_element.addClass("sketchshowgrids"+this.showthegridsize);
                this.showthegrid = true;
            } else {
                canvas_element.removeClass("sketchshowgrids1");
                canvas_element.removeClass("sketchshowgrids2");
                canvas_element.removeClass("sketchshowgrids3");
                this.showthegrid = false;
            }
        };
        Sketch.prototype.showgridincrease = function() {
            if (this.showthegrid === true) {
                this.showgrid();
                this.showthegridsize = this.showthegridsize + 1;
                if (this.showthegridsize > 3) {
                    this.showthegridsize = 1;
                }
                this.gridsize = 8 + (6 * this.showthegridsize);
                this.showthegrid = false;
                this.showgrid();
            }
        };
        Sketch.prototype.showgriddecrease = function() {
            if (this.showthegrid === true) {
                this.showgrid();
                this.showthegridsize = this.showthegridsize - 1;
                if (this.showthegridsize < 1) {
                    this.showthegridsize = 3;
                }
                this.gridsize = 8 + (6 * this.showthegridsize);
                this.showthegrid = false;
                this.showgrid();
            }
        };
        Sketch.prototype.console = function() {
            console.log('actions:');
            console.log(this.actions);
            console.log('actions length:');
            console.log(this.actions.length);
            console.log('last action:');
            if (this.actions.length > 0) {
                console.log(JSON.stringify(this.actions[this.actions.length - 1]));
            } else {
                console.log('none');
            }
            console.log('current tool:');
            console.log(this.tool);
            return false;
        };
        Sketch.prototype.set = function(key, value) {
            console.log('set '+key+' : '+value);
            if (key === 'update') {
                //console.log('update on size '+this['size']+' with value '+value);
                this['size'] = parseInt(this['size']) + parseInt(value);
                //console.log('updated to '+this['size']);
                if (this['size'] < 1) { this['size'] = 1; }
                if (this['size'] > 13) { this['size'] = 13; }
            } else {
                //this is the main setter
                this[key] = value;
            }
            if (key === "tool") {
                console.log("tool chosen with value "+value);
                if (value === "marker") {
                    this.el.style.cursor = "url('../images/cursor.brush.png'), pointer";
                } else if (value === "eraser") {
                    this.el.style.cursor = "url('../images/cursor.marker.png'), no-drop";
                } else if (value === "snaptogrid") {
                    this.el.style.cursor = "url('../images/cursor.pointer.png'), pointer";
                } else { // default cursor
                    this.el.style.cursor = "url('../images/cursor.brush.png'), pointer";
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
                events: []
            };
        };
        Sketch.prototype.stopPainting = function() {
            if (this.action) {
                this.actions.push(this.action);
            }
            this.painting = false;
            this.action = null;
            return this.redraw();
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
                if (this.tool) {
                    return $.sketch.tools[this.tool].draw.call(sketch, this);
                }
            });
            if (this.painting && this.action) {
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
