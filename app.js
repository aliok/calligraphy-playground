//TODOs :
// * Read http://learn.jquery.com/code-organization/
// * Prevent doing renderAll() unnecessarily by keeping "dirty" state

// see http://stackoverflow.com/questions/10371539/why-define-anonymous-function-and-pass-jquery-as-the-argument
// about passing $ as parameter
(function ($) {
    var EPSILON = 0.01;

    var Playground = function (canvasId) {
        var self = this;
        var $self = $(this);
        var $canvas = $("#" + canvasId);
        var canvasContext = $canvas[0].getContext("2d");

        var state = {
            // when something is dragged, this value is true
            dragging: false,

            // the element that is being dragged currently
            elementBeingDragged: null,

            // drag offset of the element that is being dragged.
            elementDragOffset: {x: 0, y: 0}
        };

        var components = [];       // TODO: make it a sorted set etc so that we have a z-index

        //region Playground methods
        this.addComponent = function (component) {
            components.push(component);
            component.initialize();
            self.renderAll(canvasContext);
        };

        this.findPixelHit = function (x, y) {
            // pixel hit priority is the element being dragged
            if (state.dragging && state.elementBeingDragged && state.elementBeingDragged.containsPoint(x, y))
                return state.elementBeingDragged;

            var i;
            for (i = 0; i < components.length; ++i) {
                if (components[i].containsPoint(x, y)) {
                    return components[i];
                }
            }
            return null;
        };

        this.renderAll = function () {
            //noinspection SillyAssignmentJS
            $canvas[0].width = $canvas[0].width;        // this clears the canvas
            var i;
            for (i = 0; i < components.length; ++i) {
                canvasContext.save(); // save state
                components[i].render(canvasContext);
                canvasContext.restore(); // save state
            }
        };
        //endregion


        //region Playground canvasEventHandlers
        var canvasEventHandlers = {
            mousedownHandler: function (e) {
                var pixelHit = self.findPixelHit(e.offsetX, e.offsetY);

                if (pixelHit) {
                    // if we have a component hitting that mouse mousedown event
                    // do several things:
                    // 1. trigger 'element:mousedown' handler on the component
                    // 2. trigger 'element:mousedown' handler on playground
                    // 3. trigger 'playground:mousedown' handler on playground

                    // but first set the playground state
                    if (pixelHit.options.draggable) {
                        state.dragging = true;
                        state.elementBeingDragged = pixelHit;
                        state.elementDragOffset = pixelHit.offset(e.offsetX, e.offsetY);
                    }

                    $(pixelHit).trigger('element:mousedown');
                    $self.trigger('element:mousedown', {element: pixelHit});
                    $self.trigger('playground:mousedown', {x: e.offsetX, y: e.offsetY});
                }
                else {
                    // if we have don't have a component hitting that mouse mousedown
                    // do less stuff : just trigger mousedown handler on playground
                    $self.trigger('playground:mousedown', {x: e.offsetX, y: e.offsetY});
                }
            },

            mouseupHandler: function (e) {
                var pixelHit = self.findPixelHit(e.offsetX, e.offsetY);

                if (pixelHit) {
                    // if we have a component hitting that mouse mouseup event
                    // do several things:
                    // 1. trigger 'element:mouseup' handler on the component
                    // 2. trigger 'element:mouseup' handler on playground
                    // 3. trigger 'playground:mouseup' handler on playground

                    // but first set the playground state
                    state.dragging = false;
                    state.elementBeingDragged = null;

                    $(pixelHit).trigger('element:mouseup');
                    $self.trigger('element:mouseup', {element: pixelHit});
                    $self.trigger('playground:mouseup', {x: e.offsetX, y: e.offsetY});
                }
                else {
                    // if we have don't have a component hitting that mouse mouseup
                    // do less stuff : just trigger mouseup handler on playground
                    $self.trigger('playground:mouseup', {x: e.offsetX, y: e.offsetY});
                }
            },

            mousemoveHandler: function (e) {
                if (state.dragging && state.elementBeingDragged) {
                    // if a component is being dragged, do the move operation
                    // trigger component's move listeners
                    state.elementBeingDragged.move(e.offsetX - state.elementDragOffset.x, e.offsetY - state.elementDragOffset.y);
                    $(state.elementBeingDragged).trigger('element:move', {x: e.offsetX - state.elementDragOffset.x, y: e.offsetY - state.elementDragOffset.y});

                    // then render all
                    self.renderAll(canvasContext);
                }

                var pixelHit = self.findPixelHit(e.offsetX, e.offsetY);

                if (pixelHit) {
                    // if we have a component hitting that mouse mousemove event
                    // do several things:
                    // 1. trigger 'element:mousemove' handler on the component
                    // 2. trigger 'element:mousemove' handler on playground
                    // 3. trigger 'playground:mousemove' handler on playground

                    $(pixelHit).trigger('element:mousemove');
                    $self.trigger('element:mousemove', {element: pixelHit});
                    $self.trigger('playground:mousemove', {x: e.offsetX, y: e.offsetY});

                    // set mouse cursor to move if pixelHit is draggable
                    if (pixelHit.options.draggable) {
                        $canvas.css('cursor', 'move');
                    }

                }
                else {
                    // if we have don't have a component hitting that mouse mousemove
                    // do less stuff : just trigger mousemove handler on playground
                    $self.trigger('playground:mousemove', {x: e.offsetX, y: e.offsetY});

                    // set mouse cursor to default since we're not on any component anymore
                    $canvas.css('cursor', 'default');
                }
            },

            clickHandler: function (e) {
                var pixelHit = self.findPixelHit(e.offsetX, e.offsetY);

                if (pixelHit) {
                    // if we have a component hitting that mouse click
                    // do several things:
                    // 1. trigger 'element:click' handler on the component
                    // 2. trigger 'element:click' handler on playground
                    // 3. trigger 'playground:click' handler on playground

                    $(pixelHit).trigger('element:click');
                    $self.trigger('element:click', {element: pixelHit});
                    $self.trigger('playground:click', {x: e.offsetX, y: e.offsetY});
                }
                else {
                    // if we have don't have a component hitting that mouse click
                    // do less stuff : just trigger click handler on playground
                    $self.trigger('playground:click', {x: e.offsetX, y: e.offsetY});
                }
            }
        };

        $canvas.on('mousedown', canvasEventHandlers.mousedownHandler);
        $canvas.on('mouseup', canvasEventHandlers.mouseupHandler);
        $canvas.on('mousemove', canvasEventHandlers.mousemoveHandler);
        $canvas.on('click', canvasEventHandlers.clickHandler);
        //endregion
    };


    //region BaseShape
    var BaseShape = function (options) {
        var defaultOptions =
        {
            draggable: true,
            strokeWidth: 1,
            strokeColor: "#333",
            fillColor: "#333",
            centerOfGravity: {x: 0, y: 0}
        };

        options = options || defaultOptions;
        $.extend(defaultOptions, options);
        this.options = defaultOptions;
    };

    //noinspection JSUnusedLocalSymbols
    BaseShape.prototype = {
        initialize: function (a, b) {
            throw "Not implemented : containsPoint";
        },
        containsPoint: function (a, b) {
            throw "Not implemented : containsPoint";
        },
        offset: function (x, y) {
            throw "Not implemented : offset";
        },
        render: function (ctx) {
            throw "Not implemented : render";
        },
        move: function (ctx) {
            throw "Not implemented : move";
        }
    };
    //endregion

    //region Rect
    var Rect = function (options) {
        var defaultOptions = {
            x: 0,
            y: 0,
            w: 10,
            h: 10
        };
        BaseShape.call(this, options);

        $.extend(defaultOptions, this.options);
        this.options = defaultOptions;
    };

    Rect.prototype = {
        initialize: function () {
            this._recalculateCenterOfGravity();
        },
        containsPoint: function (px, py) {
            return px >= this.options.x && px <= this.options.x + this.options.w && py >= this.options.y && py <= this.options.y + this.options.h;
        },
        offset: function (x, y) {
            return {x: x - this.options.x, y: y - this.options.y};
        },
        render: function (ctx) {
            if (this.options.fillColor) {
                ctx.fillStyle = this.options.fillColor;
                ctx.fillRect(this.options.x, this.options.y, this.options.w, this.options.h);
            }

            ctx.lineWidth = this.options.strokeWidth;
            ctx.strokeStyle = this.options.strokeColor;
            ctx.strokeRect(this.options.x, this.options.y, this.options.w, this.options.h);
        },
        move: function (x, y) {
            this.options.x = x;
            this.options.y = y;
            this._recalculateCenterOfGravity();
        },
        _recalculateCenterOfGravity: function () {
            this.options.centerOfGravity.x = this.options.x + (this.options.w / 2);
            this.options.centerOfGravity.y = this.options.y + (this.options.h / 2);
        }
    };
    Rect.prototype = $.extend({}, BaseShape.prototype, Rect.prototype);
    //endregion

    //region Ellipse
    var Ellipse = function (options) {
        var defaultOptions = {
            x: 0,
            y: 0,
            rx: 10,
            ry: 20
        };
        BaseShape.call(this, options);

        $.extend(defaultOptions, this.options);
        this.options = defaultOptions;
    };

    Ellipse.prototype = {
        initialize: function () {
            this._recalculateCenterOfGravity();
        },
        containsPoint: function (px, py) {
            // see http://math.stackexchange.com/questions/76457/check-if-a-point-is-within-an-ellipse
            if (this.options.rx <= 0 || this.options.ry <= 0)
                return false;

            return (Math.pow(px - this.options.x, 2) / Math.pow(this.options.rx, 2)) + (Math.pow(py - this.options.y, 2) / Math.pow(this.options.ry, 2)) <= 1;
        },
        offset: function (x, y) {
            return {x: x - this.options.x, y: y - this.options.y};
        },
        render: function (ctx) {
            // based on scaling trick in http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas
            ctx.beginPath();
            ctx.translate(this.options.x - this.options.rx, this.options.y - this.options.ry);
            ctx.scale(this.options.rx, this.options.ry);
            ctx.arc(1, 1, 1, 0, 2 * Math.PI, false);
            ctx.restore(); // restore to original state
            ctx.save();    // and save it again so that at the end of this method, canvas state us just the same
            if (this.options.fillColor) {
                ctx.fillStyle = this.options.fillColor;
                ctx.fill();
            }
            ctx.lineWidth = this.options.strokeWidth;
            ctx.strokeStyle = this.options.strokeColor;
            ctx.stroke();
        },
        move: function (x, y) {
            this.options.x = x;
            this.options.y = y;
            this._recalculateCenterOfGravity();
        },
        _recalculateCenterOfGravity: function () {
            this.options.centerOfGravity.x = this.options.x;
            this.options.centerOfGravity.y = this.options.y;
        }
    };
    Ellipse.prototype = $.extend({}, BaseShape.prototype, Ellipse.prototype);
    //endregion

    //region Line
    var Line = function (options) {
        var defaultOptions = {
            x1: 0,
            y1: 0,
            x2: 10,
            y2: 10
        };
        BaseShape.call(this, options);

        $.extend(defaultOptions, this.options);
        this.options = defaultOptions;
    };

    Line.prototype = {
        initialize: function () {
            this._recalculateCenterOfGravity();
        },
        containsPoint: function (px, py) {
            if (px == this.options.x1 && py == this.options.y1)
                return true;
            if (px == this.options.x2 && py == this.options.y2)
                return true;

            var pxFromOrigin = px - this.options.x1;
            var pyFromOrigin = py - this.options.y1;

            if ((this._slope() * pxFromOrigin - pyFromOrigin) < EPSILON)
                return true;
        },
        offset: function (x, y) {
            return {x: x - this.options.x1, y: y - this.options.y1};
        },
        render: function (ctx) {
            ctx.lineWidth = this.options.strokeWidth;
            ctx.strokeStyle = this.options.strokeColor;
            ctx.beginPath();
            ctx.moveTo(this.options.x1, this.options.y1);
            ctx.lineTo(this.options.x2, this.options.y2);
            ctx.stroke();
        },
        move: function (x, y) {
            this.options.x2 += x - this.options.x1;
            this.options.y2 += y - this.options.y1;
            this.options.x1 = x;
            this.options.y1 = y;
            this._recalculateCenterOfGravity();
        },
        _slope: function () {
            if (this.options.x2 - this.options.x1 == 0)
                return Number.MAX_VALUE;
            return (this.options.y2 - this.options.y1) / (this.options.x2 - this.options.x1);
        },
        _recalculateCenterOfGravity: function () {
            this.options.centerOfGravity.x = (this.options.x1 + this.options.x2 ) / 2;
            this.options.centerOfGravity.y = (this.options.y1 + this.options.y2 ) / 2;
        }
    };
    Line.prototype = $.extend({}, BaseShape.prototype, Line.prototype);
    //endregion

    var playground = new Playground('c');
//    $(playground).on('click', function(e, data){
//        console.log(data);
//    });

//    $(playground).on('element:click', function(e, data){
//        console.log(data);
//    });


    var rect = new Rect({x: 100, y: 200, w: 10, h: 10, "strokeColor": "#000", "fillColor": "transparent"});
    var rect2 = new Rect({x: 100, y: 250, w: 10, h: 10, "strokeColor": "#000", "fillColor": "transparent"});
    var ellipse = new Ellipse({x: 200, y: 350, rx: 50, ry: 100, "strokeColor": "#000", "fillColor": "transparent"});

//    $(rect).on('click', function(e, data){
//        console.log(e);
//        console.log(data);
//    });

    playground.addComponent(rect);
    playground.addComponent(rect2);
    playground.addComponent(ellipse);

    var line = new Line({x1: rect.options.centerOfGravity.x, y1: rect.options.centerOfGravity.y, x2: rect2.options.centerOfGravity.x, y2: rect2.options.centerOfGravity.y, "strokeColor": "#000", draggable: false});

    playground.addComponent(line);

    $(rect).on('element:move', function (e, data) {
        line.options.x1 = this.options.centerOfGravity.x;
        line.options.y1 = this.options.centerOfGravity.y;
    });

    $(rect2).on('element:move', function (e, data) {
        line.options.x2 = this.options.centerOfGravity.x;
        line.options.y2 = this.options.centerOfGravity.y;
    });

})(jQuery);