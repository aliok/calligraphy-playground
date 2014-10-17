//TODOs :
// * Read http://learn.jquery.com/code-organization/
// * Prevent doing renderAll() unnecessarily by keeping "dirty" state

// see http://stackoverflow.com/questions/10371539/why-define-anonymous-function-and-pass-jquery-as-the-argument
// about passing $ as parameter
(function ($) {
    var EPSILON = 0.01;

    var Utils = {
        distance: function (x1, y1, x2, y2) {
            return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
        }
    };

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
        containsPoint: function (a, b, canvasContext) {
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
        containsPoint: function (px, py, ctx) {
            // following is the canvas API way of doing the check. just keeping it for the future reference
            // ctx.beginPath();
            // ctx.rect(this.options.x, this.options.y, this.options.w, this.options.h);
            // return ctx.isPointInPath(px, py);
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
        containsPoint: function (px, py, ctx) {
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

    //region Circle
    var Circle = function (options) {
        var defaultOptions = {
            x: 0,
            y: 0,
            r: 10
        };
        Ellipse.call(this, options);

        $.extend(defaultOptions, this.options);
        this.options = defaultOptions;

        this.options.rx = this.options.r;
        this.options.ry = this.options.r;
    };

    Circle.prototype = {
        // nothing overridden from Ellipse
    };
    Circle.prototype = $.extend({}, Ellipse.prototype, Circle.prototype);
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
        containsPoint: function (px, py, ctx) {
            if (px == this.options.x1 && py == this.options.y1)
                return true;
            if (px == this.options.x2 && py == this.options.y2)
                return true;

            // see http://stackoverflow.com/questions/17692922/check-is-a-point-x-y-is-between-two-points-drawn-on-a-straight-line
            var tolerance = 1;      // tolerance is so high since all the sqrt operations messes up the total distance
            var distanceP1P2 = Utils.distance(this.options.x1, this.options.y1, this.options.x2, this.options.y2);
            var distanceP1P3 = Utils.distance(this.options.x1, this.options.y1, px, py);
            var distanceP2P3 = Utils.distance(this.options.x2, this.options.y2, px, py);

            return Math.abs(distanceP1P2 - distanceP1P3 - distanceP2P3) < tolerance;
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

    //region Line
    var QCurve = function (options) {
        var defaultOptions = {
            x1: 0,
            y1: 0,
            x2: 10,
            y2: 10,
            cx: 20,
            cy: 20
        };
        BaseShape.call(this, options);

        $.extend(defaultOptions, this.options);
        this.options = defaultOptions;
    };

    QCurve.prototype = {
        initialize: function () {
            this._recalculateCenterOfGravity();
        },
        containsPoint: function (px, py, ctx) {
            // this check is kind of hard to implement with math. thus, let's just use canvas API way.

            if (px == this.options.x1 && py == this.options.y1)
                return true;
            if (px == this.options.x2 && py == this.options.y2)
                return true;

            ctx.beginPath();
            ctx.moveTo(this.options.x1, this.options.y1);
            ctx.quadraticCurveTo(this.options.cx, this.options.cy, this.options.x2, this.options.y2);
            return ctx.isPointInPath(px, py);

        },
        offset: function (x, y) {
            return {x: x - this.options.x1, y: y - this.options.y1};
        },
        render: function (ctx) {
            ctx.lineWidth = this.options.strokeWidth;
            ctx.strokeStyle = this.options.strokeColor;
            ctx.beginPath();
            ctx.moveTo(this.options.x1, this.options.y1);
            ctx.quadraticCurveTo(this.options.cx, this.options.cy, this.options.x2, this.options.y2);
            ctx.stroke();
        },
        move: function (x, y) {
            this.options.cx += x - this.options.x1;
            this.options.cy += y - this.options.y1;
            this.options.x2 += x - this.options.x1;
            this.options.y2 += y - this.options.y1;
            this.options.x1 = x;
            this.options.y1 = y;
            this._recalculateCenterOfGravity();
        },
        _recalculateCenterOfGravity: function () {
            this.options.centerOfGravity.x = (this.options.x1 + this.options.x2 + this.options.cx) / 3;
            this.options.centerOfGravity.y = (this.options.y1 + this.options.y2 + this.options.cy) / 3;
        }
    };
    QCurve.prototype = $.extend({}, BaseShape.prototype, QCurve.prototype);
    //endregion

    var $canvasContainerDiv = $('#canvasContainer');
    var $mouseXSpan = $('#mouse-x');
    var $mouseYSpan = $('#mouse-y');
    var $viewportXSpan = $('#viewport-x');
    var $viewportYSpan = $('#viewport-y');
    var $viewportBoxContainerDiv = $('#viewport-box-container');
    var $viewportBoxDiv = $('#viewport-box');


    var playground = new Playground('c');

    $(playground).on('playground:mousemove', function (e, data) {
        $mouseXSpan.html(data.x);
        $mouseYSpan.html(data.y);
    });

    $canvasContainerDiv.on('scroll', function () {
        var viewportOffsetX = $canvasContainerDiv.scrollLeft();
        var viewportOffsetY = $canvasContainerDiv.scrollTop();
        var viewportWidth = $canvasContainerDiv.width();
        var viewportHeight = $canvasContainerDiv.height();

        // see https://forum.jquery.com/topic/scroll-width-of-div
        var contentWidth = $canvasContainerDiv[0].scrollWidth;
        var contentHeight = $canvasContainerDiv[0].scrollHeight;

        // first fix the ratio on $viewportBoxContainerDiv and $viewportBoxDiv
        $viewportBoxContainerDiv.css('height', $viewportBoxContainerDiv.width() * contentHeight / contentWidth);

        // calculate the percentages
        // based on example : http://jsfiddle.net/SnJXQ/2/

        var widthInPercent = 100 * viewportWidth / contentWidth;
        var heightInPercent = 100 * viewportHeight / contentHeight;
        var offsetXInPercent = 100 * viewportOffsetX / contentWidth;
        var offsetYInPercent = 100 * viewportOffsetY / contentHeight;

        // following is necessary since we're trying to set margin-top with offsetYInPercent but that is calculated based on width as it is relative.
        offsetYInPercent = offsetYInPercent * viewportHeight / viewportWidth;

        $viewportBoxDiv.css('width', widthInPercent + "%");
        $viewportBoxDiv.css('height', heightInPercent + "%");
        $viewportBoxDiv.css('margin-left', offsetXInPercent + "%");
        $viewportBoxDiv.css('margin-top', offsetYInPercent + "%");


        // update the text
        $viewportXSpan.html(viewportOffsetX + " - " + (viewportOffsetX + viewportWidth));
        $viewportYSpan.html(viewportOffsetY + " - " + (viewportOffsetY + viewportHeight));
    });

    var Node = function (data) {
        this.data = data;
        this.previous = null;
        this.next = null;
    };

    var EditorStates = {
        MOVE: "MOVE",
        ADD_NEIGHBOR: "ADD_NEIGHBOR",
        DELETE_MARKER: "DELETE_MARKER"
    };

    var CalligraphyMarkingContainer = function (playground, leftRootCoordinates, rightRootCoordinates) {
        //region CalligraphyMarkingContainer constants
        const colorLeftRootMarker = "rgba(255,0,0,0.6)";
        const colorLeftMarker = "rgba(255,0,0,0.3)";
        const colorRightRootMarker = "rgba(0,0,255,0.6)";
        const colorRightMarker = "rgba(0,0,255,0.3)";
        //endregion

        const self = this;
        self.state = EditorStates.MOVE; // default state is MOVE

        self.createMarkerRect = function (x, y) {
            return new Rect({x: x, y: y, w: 10, h: 10, "strokeColor": "#000"});
        };

        var leftRootMarker = self.createMarkerRect(leftRootCoordinates.x, leftRootCoordinates.y);
        var rightRootMarker = self.createMarkerRect(rightRootCoordinates.x, rightRootCoordinates.y);
        leftRootMarker.options.fillColor = colorLeftRootMarker;
        rightRootMarker.options.fillColor = colorRightRootMarker;

        var leftRoot = new Node(leftRootMarker);
        var rightRoot = new Node(rightRootMarker);

        $(leftRootMarker).on('element:click', function (e, data) {
            if (self.state === EditorStates.ADD_NEIGHBOR) {
                var newNode = self.createNeighborRect(leftRoot, colorLeftMarker);
                self.addNoteInBetween(newNode, leftRoot, leftRoot.next);
            }
            // don't allow deleting root marker
        });

        $(rightRootMarker).on('element:click', function (e, data) {
            if (self.state === EditorStates.ADD_NEIGHBOR) {
                var newNode = self.createNeighborRect(rightRoot, colorRightMarker);
                self.addNoteInBetween(newNode, rightRoot, rightRoot.next);
            }
            // don't allow deleting root marker
        });

        self.createNeighborRect = function (node, fillColor) {
            var x = 0;
            var y = 0;
            if (node.next) {
                x = (node.data.options.x + node.next.data.options.x) / 2;
                y = (node.data.options.y + node.next.data.options.y) / 2;
            } else {
                x = node.data.options.x + 20;
                y = node.data.options.y + 20;
            }

            var marker = self.createMarkerRect(x, y);
            marker.options.fillColor = fillColor;

            var newNode = new Node(marker);

            $(marker).on('element:click', function (e, data) {
                if (self.state === EditorStates.ADD_NEIGHBOR) {
                    self.createNeighborRect(newNode, fillColor);
                }
                else if (self.state === EditorStates.DELETE_MARKER) {
                    self.deleteNode(newNode);
                }
            });

            playground.addComponent(marker);
            return  newNode;
        };

        self.addNoteInBetween = function (newNode, left, right) {
            left.next = newNode;
            newNode.previous = left;
            if (right)
                right.previous = left;
        };

        self.deleteNode = function (node) {
            if (!node.previous) {
                console.log("Node looks like root! It cannot be deleted!");
                console.log(node);
            }

            node.previous.next = node.next;
            if (node.next)
                node.next.previous = node.previous;

            playground.removeComponent(node.data);
        };

        playground.addComponent(leftRootMarker);
        playground.addComponent(rightRootMarker);
    };

    var calligraphyMarkingContainer = new CalligraphyMarkingContainer(playground, {x: 300, y: 200}, {x: 270, y: 220});

    var commandButtonHandlers = {
        GO_TO_STATE_MOVE: function () {
            calligraphyMarkingContainer.state = EditorStates.MOVE;
        },
        GO_TO_STATE_ADD_NEIGHBOR: function () {
            calligraphyMarkingContainer.state = EditorStates.ADD_NEIGHBOR;
        },
        GO_TO_STATE_DELETE_MARKER: function () {
            calligraphyMarkingContainer.state = EditorStates.DELETE_MARKER;
        }
    };

    $('.commandButton').click(function () {
        var commandId = $(this).attr('data-command-id');
        var commandButtonHandler = commandButtonHandlers[commandId];
        if (!commandButtonHandler) {
            console.log('No commandButtonHandler found for command ' + commandId);
        }
        else {
            if ($(this).attr('data-state-button')) {
                $(".commandButton.active").removeClass("active");
                $(this).addClass("active");
            }
            commandButtonHandler();
        }
    });

    $('.commandButton').each(function (index, button) {
        var shortcut = $(button).attr('data-shortcut');
        if (shortcut) {
            $(document).bind('keydown', shortcut, function () {
                $(button).click()
            });
        }
    });

    $canvasContainerDiv.scroll();


//    console.log(numeric.solve([
//        [1, 2],
//        [3, 4]
//    ], [17, 39]));

//    var $canvas = $("#c");
//    var canvasContext = $canvas[0].getContext("2d");
//
//    var x = 323, y = 150;
//    canvasContext.save();
//    canvasContext.fillRect(x, y, 10, 10);
//    canvasContext.moveTo(rect1.options.centerOfGravity.x, rect1.options.centerOfGravity.y);
//    canvasContext.lineTo(rect3.options.centerOfGravity.x, rect3.options.centerOfGravity.y);
//    canvasContext.stroke();
//    canvasContext.restore();
//
//    canvasContext.save();
//    canvasContext.beginPath();
//    canvasContext.moveTo(rect1.options.centerOfGravity.x, rect1.options.centerOfGravity.y);
//    canvasContext.quadraticCurveTo(500, 100, rect3.options.centerOfGravity.x, rect3.options.centerOfGravity.y);
//    console.log(canvasContext.isPointInPath(x, y));
//    canvasContext.stroke();
//    canvasContext.restore();

})(jQuery);