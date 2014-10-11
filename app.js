//TODOs :
// * Read http://learn.jquery.com/code-organization/

// see http://stackoverflow.com/questions/10371539/why-define-anonymous-function-and-pass-jquery-as-the-argument
// about passing $ as parameter
(function ($) {
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

        this.addComponent = function (component) {
            components.push(component);
            self.renderAll(canvasContext);
        };

        this.findPixelHit = function (x, y) {
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
                components[i].render(canvasContext);
            }
        };

        var canvasEventHandlers = {
            mousedownHandler: function (e) {
                var pixelHit = self.findPixelHit(e.offsetX, e.offsetY);

                if (pixelHit) {
                    // if we have a component hitting that mouse mousedown event
                    // do several things:
                    // 1. trigger 'mousedown' handler on the component
                    // 2. trigger 'element:mousedown' handler on playground
                    // 3. trigger 'mousedown' handler on playground

                    // but first set the playground state
                    state.dragging = true;
                    state.elementBeingDragged = pixelHit;
                    state.elementDragOffset = pixelHit.offset(e.offsetX, e.offsetY);

                    $(pixelHit).trigger('mousedown');
                    $self.trigger('element:mousedown', {element: pixelHit});
                    $self.trigger('mousedown', {x: e.offsetX, y: e.offsetY});
                }
                else {
                    // if we have don't have a component hitting that mouse mousedown
                    // do less stuff : just trigger mousedown handler on playground
                    $self.trigger('mousedown', {x: e.offsetX, y: e.offsetY});
                }
            },

            mouseupHandler: function (e) {
                var pixelHit = self.findPixelHit(e.offsetX, e.offsetY);

                if (pixelHit) {
                    // if we have a component hitting that mouse mouseup event
                    // do several things:
                    // 1. trigger 'mouseup' handler on the component
                    // 2. trigger 'element:mouseup' handler on playground
                    // 3. trigger 'mouseup' handler on playground

                    // but first set the playground state
                    state.dragging = false;
                    state.elementBeingDragged = null;

                    $(pixelHit).trigger('mouseup');
                    $self.trigger('element:mouseup', {element: pixelHit});
                    $self.trigger('mouseup', {x: e.offsetX, y: e.offsetY});
                }
                else {
                    // if we have don't have a component hitting that mouse mouseup
                    // do less stuff : just trigger mouseup handler on playground
                    $self.trigger('mouseup', {x: e.offsetX, y: e.offsetY});
                }
            },

            mousemoveHandler: function (e) {
                if (state.dragging && state.elementBeingDragged) {
                    state.elementBeingDragged.move(e.offsetX - state.elementDragOffset.x, e.offsetY - state.elementDragOffset.y);
                    self.renderAll(canvasContext);
                }

                var pixelHit = self.findPixelHit(e.offsetX, e.offsetY);

                if (pixelHit) {
                    // if we have a component hitting that mouse mousemove event
                    // do several things:
                    // 1. trigger 'mousemove' handler on the component
                    // 2. trigger 'element:mousemove' handler on playground
                    // 3. trigger 'mousemove' handler on playground

                    $(pixelHit).trigger('mousemove');
                    $self.trigger('element:mousemove', {element: pixelHit});
                    $self.trigger('mousemove', {x: e.offsetX, y: e.offsetY});
                }
                else {
                    // if we have don't have a component hitting that mouse mousemove
                    // do less stuff : just trigger mousemove handler on playground
                    $self.trigger('mousemove', {x: e.offsetX, y: e.offsetY});
                }
            },

            clickHandler: function (e) {
                var pixelHit = self.findPixelHit(e.offsetX, e.offsetY);

                if (pixelHit) {
                    // if we have a component hitting that mouse click
                    // do several things:
                    // 1. trigger 'click' handler on the component
                    // 2. trigger 'element:click' handler on playground
                    // 3. trigger 'click' handler on playground

                    $(pixelHit).trigger('click');
                    $self.trigger('element:click', {element: pixelHit});
                    $self.trigger('click', {x: e.offsetX, y: e.offsetY});
                }
                else {
                    // if we have don't have a component hitting that mouse click
                    // do less stuff : just trigger click handler on playground
                    $self.trigger('click', {x: e.offsetX, y: e.offsetY});
                }
            }
        };

        $canvas.on('mousedown', canvasEventHandlers.mousedownHandler);
        $canvas.on('mouseup', canvasEventHandlers.mouseupHandler);
        $canvas.on('mousemove', canvasEventHandlers.mousemoveHandler);
        $canvas.on('click', canvasEventHandlers.clickHandler);
    };


    var BaseShape = function (options) {
        var defaultOptions =
        {
            strokeWidth: 1,
            strokeColor: "#333",
            fillColor: "#333"
        };

        options = options || defaultOptions;
        $.extend(defaultOptions, options);
        this.options = defaultOptions;
    };

    //noinspection JSUnusedLocalSymbols
    BaseShape.prototype = {
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
        }
    };
    Rect.prototype = $.extend({}, BaseShape.prototype, Rect.prototype);


    var playground = new Playground('c');
//    $(playground).on('click', function(e, data){
//        console.log(data);
//    });

//    $(playground).on('element:click', function(e, data){
//        console.log(data);
//    });


    var rect = new Rect({x: 100, y: 200, w: 100, h: 100, "fillColor": "red"});
//    $(rect).on('click', function(e, data){
//        console.log(e);
//        console.log(data);
//    });

    playground.addComponent(rect);

})(jQuery);