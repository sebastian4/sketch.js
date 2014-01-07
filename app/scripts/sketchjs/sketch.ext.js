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
            this.el.style.cursor = "url('http://www.sesh.com/images-brush.cursor.g.32.png'), pointer";
            this.canvas = $(el);
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
            this.paintingongrid = false;
            this.gridsize = 18;
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
                    _ref = ['color', 'size', 'tool'];
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
            console.log("savetostorage");
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
            console.log("showgrid");
            var canvas_element = $(this.el);
            if (this.showthegrid === false) {
                canvas_element.addClass("showgrids"+this.showthegridsize);
                this.showthegrid = true;
            } else {
                canvas_element.removeClass("showgrids1");
                canvas_element.removeClass("showgrids2");
                canvas_element.removeClass("showgrids3");
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
                this.gridsize = 12 + (6 * this.showthegridsize);
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
                this.gridsize = 12 + (6 * this.showthegridsize);
                this.showthegrid = false;
                this.showgrid();
            }
        };
        Sketch.prototype.console = function() {
            console.group("sketch snapshot");
            console.log( moment().format('DD-h:mm:ss') );
            console.log('current painting: '+this.painting);
            console.log('current tool: '+this.tool);
            console.log('current color: '+this.color);
            console.log('current size: '+this.size);
            console.log('current gridsize: '+this.gridsize);
            console.log('current showthegrid: '+this.showthegrid);
            console.log('current showthegridsize: '+this.showthegridsize);
            console.log('current paintingongrid: '+this.paintingongrid);
            console.log('actions:');
            console.log(this.actions);
            console.log('actions length:');
            console.log(this.actions.length);
            /* console.log('last action:');
            if (this.actions.length > 0) {
                console.log(JSON.stringify(this.actions[this.actions.length - 1]));
            } else {
                console.log('none');
            } */
            console.groupEnd()
            return false;
        };
        Sketch.prototype.set = function(key, value) {
            this[key] = value;
            if (key === "tool") {
                console.log("tool chosen with value "+value);
                if (value === "marker") {
                    this.el.style.cursor = "url('http://www.sesh.com/images-brush.cursor.g.32.png'), pointer";
                } else if (value === "eraser") {
                    this.el.style.cursor = "url('http://www.sesh.com/images-marker.cursor.g.32.png'), no-drop";
                } else if (value === "snaptogrid") {
                    this.el.style.cursor = "url('http://www.sesh.com/images-pointer.g.png'), pointer";
                } else { // default cursor
                    this.el.style.cursor = "url('http://www.sesh.com/images-brush.cursor.g.32.png'), pointer";
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
                    console.log(moment().format('DD-h:mm:ss')+" redraw this.actions this.tool");
                    return $.sketch.tools[this.tool].draw.call(sketch, this);
                }
            });
            if (this.painting && this.action) {
                console.log(moment().format('DD-h:mm:ss')+" redraw this.painting && this.action");
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
                    this.startPainting(); break;
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
            console.log(moment().format('DD-h:mm:ss')+' draw marker');
            var event, previous, _i, _len, _ref;
            this.context.lineJoin = "round"; this.context.lineCap = "round";
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
                    this.startPainting(); break;
                case 'mouseup':
                case 'mouseout':
                case 'mouseleave':
                case 'touchend':
                case 'touchcancel':
                    this.stopPainting();
            }
            if (this.painting) {
                var newx = e.pageX;
                var newy = e.pageY;
                /*
                var near = ((e.pageX % this.gridsize) < 4) && ((e.pageY % this.gridsize) < 4);
                console.log('near = '+near);
                if (near) {
                    newx = ( Math.round(e.pageX / this.gridsize) * this.gridsize );
                    newy = ( Math.round(e.pageY / this.gridsize) * this.gridsize );
                }
                */
                var nearx = ((e.pageX % this.gridsize) < (this.gridsize / 2));
                var neary = ((e.pageY % this.gridsize) < (this.gridsize / 2));
                if (nearx && neary) {
                    newx = ( Math.round(e.pageX / this.gridsize) * this.gridsize );
                    newy = ( Math.round(e.pageY / this.gridsize) * this.gridsize );
                    console.log('near both');
                    
                    this.paintingongrid = true;
                    
                    this.action.events.push({
                        x: newx - this.canvas.offset().left,
                        y: newy - this.canvas.offset().top,
                        event: e.type
                    });
                    
                    
                    return this.redraw();
                    
                } 
                else {
                    this.paintingongrid = false;
                }

                return false;
            }
        },
        draw: function(action) {
            console.log(moment().format('DD-h:mm:ss')+' draw snaptogrid');
            if (this.paintingongrid) {
                var event, previous, _i, _len, _ref;
                this.context.lineJoin = "round"; this.context.lineCap = "round";
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
        }
    };
    return $.sketch.tools.eraser = {
        onEvent: function(e) {
            return $.sketch.tools.marker.onEvent.call(this, e);
        },
        draw: function(action) {
            var oldcomposite;
            oldcomposite = this.context.globalCompositeOperation;
            this.context.globalCompositeOperation = "copy";
            action.color = "rgba(0,0,0,0)";
            action.size = 15;
            $.sketch.tools.marker.draw.call(this, action);
            return this.context.globalCompositeOperation = oldcomposite;
        }
    };
})(jQuery);