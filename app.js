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

        var components = [];       // TODO: make it a sorted set etc so that we have a z-index

        this.addComponent = function (component) {
            components.push(component);
            component.render(canvasContext);
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

        $canvas.on('click', function (e) {
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
            else{
                // if we have don't have a component hitting that mouse click
                // do less stuff : just trigger click handler on canvas
                $self.trigger('click', {x: e.offsetX, y: e.offsetY});
            }
        });
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
        render: function (ctx) {
            throw "Not implemented : render";
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
        render: function (ctx) {
            if (this.options.fillColor) {
                ctx.fillStyle = this.options.fillColor;
                ctx.fillRect(this.options.x, this.options.y, this.options.w, this.options.h);
            }

            ctx.lineWidth = this.options.strokeWidth;
            ctx.strokeStyle = this.options.strokeColor;
            ctx.strokeRect(this.options.x, this.options.y, this.options.w, this.options.h);
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