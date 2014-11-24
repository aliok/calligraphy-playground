(function ($) {
    var Utils = canvasPlayground.Utils;

    //region BaseShape
    /**
     * Base class for all other shape types to extend.
     * @abstract
     * @class
     */
    canvasPlayground.BaseShape = function (options) {
        var defaultOptions =
        {
            draggable: true,
            strokeWidth: 1,
            strokeColor: "#333",
            fillColor: "#333",
            centerOfGravity: {x: 0, y: 0}
        };

        /**
         * Options of the BaseShape
         * @property {string} [id] id of the shape. If empty and it will be generated.
         * @property {boolean} [draggable=true] If shape is draggable on the canvas
         * @property {number} [strokeWidth=1] Stroke width of the shape
         * @property {string} [strokeColor="#333"] Stroke color
         * @property {string} [fillColor="#333"] Fill color
         * @property {number} [centerOfGravity={x:0, y:0}] Center of gravity point.
         * @property {number} centerOfGravity.x X of center of gravity point.
         * @property {number} centerOfGravity.y Y of center of gravity point.
         */
        this.options = $.extend(defaultOptions, options);
        if (!this.options.id)
            this.options.id = Utils.guid();
    };
    var BaseShape = canvasPlayground.BaseShape;

    //noinspection JSUnusedLocalSymbols
    canvasPlayground.BaseShape.prototype = {
        /**
         * Returns the type of the shape.
         * @return {string} type
         */
        getType: function () {
            throw "Not implemented : getType";
        },

        /**
         * Initialize the shape. This often has to do something with calculating a value from the given construction options.
         * </br>
         * This method should be called before shape is added to canvas.
         */
        initialize: function () {
            throw "Not implemented : initialize";
        },

        /**
         * Checks if the given point is contained by this shape.
         * @param {number} x X of point
         * @param {number} y Y of point
         * @param {CanvasRenderingContext2D} canvasContext Canvas ctx
         * @return {boolean} whether the given point is contained by this shape
         */
        containsPoint: function (x, y, canvasContext) {
            throw "Not implemented : containsPoint";
        },

        /**
         * Returns the offset from the given point.
         * @param {number} x X of point
         * @param {number} y Y of point
         * @return {number} offset from the given point
         */
        offset: function (x, y) {
            throw "Not implemented : offset";
        },

        /**
         * Renders the shape itself on the canvas.
         * @param {CanvasRenderingContext2D} ctx Canvas ctx
         */
        render: function (ctx) {
            throw "Not implemented : render";
        },

        /**
         * Translates the shape by given X and Y values.
         * @param {number} x X of target point
         * @param {number} y Y of target point
         */
        translate: function (x, y) {
            throw "Not implemented : translate";
        },

        /**
         * Returns the state object of the shape.
         * @return {Object}
         * @property {string} returnValue.type Type of the shape
         * @property {string} returnValue.options Options of the shape
         */
        getState: function () {
            return {
                "type": this.getType(),
                "options": this.options
            }
        }
    };
    //endregion

    //region Rect
    /**
     * @class
     * @augments canvasPlayground.BaseShape
     */
    canvasPlayground.Rect = function (options) {
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
    var Rect = canvasPlayground.Rect

    Rect.prototype = {
        getType: function () {
            return "Rect";
        },
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
        translate: function (x, y) {
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
    /**
     * @class
     * @augments canvasPlayground.BaseShape
     */
    canvasPlayground.Ellipse = function (options) {
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
    var Ellipse = canvasPlayground.Ellipse

    Ellipse.prototype = {
        getType: function () {
            return "Ellipse";
        },
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
        translate: function (x, y) {
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
    /**
     * @class
     * @augments canvasPlayground.Ellipse
     */
    canvasPlayground.Circle = function (options) {
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
    var Circle = canvasPlayground.Circle

    Circle.prototype = {
        // nothing overridden from Ellipse except the type
        getType: function () {
            return "Circle";
        }
    };
    Circle.prototype = $.extend({}, Ellipse.prototype, Circle.prototype);
    //endregion

    //region Line
    /**
     * @class
     * @augments canvasPlayground.BaseShape
     */
    var Line = canvasPlayground.Line = function (options) {
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
        getType: function () {
            return "Line";
        },
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
        translate: function (x, y) {
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

    //region QCurve
    /**
     * @class
     * @augments canvasPlayground.BaseShape
     */
    canvasPlayground.QCurve = function (options) {
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
    var QCurve = canvasPlayground.QCurve;

    QCurve.prototype = {
        getType: function () {
            return "QCurve";
        },
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
        translate: function (x, y) {
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

    //region BinaryImage
    /**
     * @class
     * @augments canvasPlayground.BaseShape
     */
    canvasPlayground.BinaryImage = function (options) {
        var defaultOptions = {
            x: 0,
            y: 0,
            w: 0,
            h: 0,
            data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAIAAAACDbGyAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9oMCRUiMrIBQVkAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAADElEQVQI12NgoC4AAABQAAEiE+h1AAAAAElFTkSuQmCC"
        };
        BaseShape.call(this, options);

        $.extend(defaultOptions, this.options);
        this.options = defaultOptions;
    };
    var BinaryImage = canvasPlayground.BinaryImage

    BinaryImage.prototype = {
        getType: function () {
            return "BinaryImage";
        },
        initialize: function () {
            this._recalculateCenterOfGravity();
        },
        containsPoint: function (px, py, ctx) {
            // like a rect
            return px >= this.options.x && px <= this.options.x + this.options.w && py >= this.options.y && py <= this.options.y + this.options.h;
        },
        offset: function (x, y) {
            return {x: x - this.options.x, y: y - this.options.y};
        },
        render: function (ctx) {
            // cache the image
            var _self = this;
            if (!this.image) {
                _self.image = new Image();
                _self.image.src = this.options.data;
                _self.image.onload = function () {
                    if (_self.options.w) {
                        ctx.drawImage(_self.image, _self.options.x, _self.options.y, _self.options.w, _self.options.h);
                    }
                    else {
                        ctx.drawImage(_self.image, _self.options.x, _self.options.y);
                    }
                };
            }
            else {
                if (_self.options.w) {
                    ctx.drawImage(_self.image, _self.options.x, _self.options.y, _self.options.w, _self.options.h);
                }
                else {
                    ctx.drawImage(_self.image, _self.options.x, _self.options.y);
                }
            }
        },
        translate: function (x, y) {
            this.options.x = x;
            this.options.y = y;
            this._recalculateCenterOfGravity();
        },
        _recalculateCenterOfGravity: function () {
            this.options.centerOfGravity.x = this.options.x + (this.options.w / 2);
            this.options.centerOfGravity.y = this.options.y + (this.options.h / 2);
        }
    };
    BinaryImage.prototype = $.extend({}, BaseShape.prototype, BinaryImage.prototype);
    //endregion

})(jQuery);