(function ($) {
    var Utils = canvasPlayground.Utils;

    canvasPlayground.Playground = function (canvasId, options, components) {

        // region private fields
        // -------------------------------------------------------------------------------------------------------------------------
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

        var defaultOptions = {
            id: Utils.guid(),
            name: undefined,
            width: 2000,
            height: 600
        };

        components = components || [];         // TODO: convert it a sorted set etc so that we have a z-index
        // -------------------------------------------------------------------------------------------------------------------------
        // endregion


        // region public fields
        // -------------------------------------------------------------------------------------------------------------------------
        options = $.extend({}, defaultOptions, options);
        self.options = options;
        // -------------------------------------------------------------------------------------------------------------------------
        // endregion


        //region Playground public methods
        // -------------------------------------------------------------------------------------------------------------------------
        this.addComponent = function (component) {
            components.push(component);
            component.initialize();
            self.renderAll(canvasContext);
        };

        this.removeComponent = function (component) {
            // see http://stackoverflow.com/questions/5767325/remove-specific-element-from-an-array
            var index = components.indexOf(component);
            if (index > -1) {
                components.splice(index, 1);
            }
            self.renderAll(canvasContext);
        };

        this.findPixelHit = function (x, y) {
            // pixel hit priority is the element being dragged
            if (state.dragging && state.elementBeingDragged && state.elementBeingDragged.containsPoint(x, y, canvasContext))
                return state.elementBeingDragged;

            var i;
            for (i = 0; i < components.length; ++i) {
                canvasContext.save();
                if (components[i].containsPoint(x, y, canvasContext)) {
                    canvasContext.restore();
                    return components[i];
                }
                canvasContext.restore();
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

        this.getState = function () {
            var states = [];
            var i;
            for (i = 0; i < components.length; ++i) {
                states.push(components[i].getState());
            }

            return {options: options, components: states};
        };

        this.refresh = function () {
            initializeCanvas();
            this.renderAll();
        };
        // -------------------------------------------------------------------------------------------------------------------------
        //endregion


        //region Playground canvasEventHandlers
        // -------------------------------------------------------------------------------------------------------------------------
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
                    // if a component is being dragged, do the translate operation
                    // trigger component's translate listeners
                    state.elementBeingDragged.translate(e.offsetX - state.elementDragOffset.x, e.offsetY - state.elementDragOffset.y);
                    $(state.elementBeingDragged).trigger('element:translate', {x: e.offsetX - state.elementDragOffset.x, y: e.offsetY - state.elementDragOffset.y});

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

                    // set mouse cursor to translate if pixelHit is draggable
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
        // -------------------------------------------------------------------------------------------------------------------------
        //endregion


        // region private methods
        // -------------------------------------------------------------------------------------------------------------------------

        // initialize canvas
        function initializeCanvas() {
            $canvas.attr('width', options.width);
            $canvas.attr('height', options.height);
        }

        // -------------------------------------------------------------------------------------------------------------------------
        // endregion


        // region initialization
        // -------------------------------------------------------------------------------------------------------------------------
        initializeCanvas();

        $canvas.on('mousedown', canvasEventHandlers.mousedownHandler);
        $canvas.on('mouseup', canvasEventHandlers.mouseupHandler);
        $canvas.on('mousemove', canvasEventHandlers.mousemoveHandler);
        $canvas.on('click', canvasEventHandlers.clickHandler);
        // -------------------------------------------------------------------------------------------------------------------------
        // endregion
    };
})(jQuery);