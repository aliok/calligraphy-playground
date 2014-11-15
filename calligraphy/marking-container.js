(function ($) {
    var EditorStates = calligraphy.EditorStates;
    var Node = calligraphy.Node;

    //region CalligraphyMarkingContainer constants
    const colorLeftRootMarker = "rgba(255,0,0,0.6)";
    const colorLeftMarker = "rgba(255,0,0,0.3)";
    const colorRightRootMarker = "rgba(0,0,255,0.6)";
    const colorRightMarker = "rgba(0,0,255,0.3)";
    //endregion

    calligraphy.MarkingContainer = function (_leftRootCoordinates, _rightRootCoordinates) {

        const self = this;

        self.leftRootCoordinates = _leftRootCoordinates;
        self.rightRootCoordinates = _rightRootCoordinates;

        self.createMarkerRect = function (x, y) {
            return new canvasPlayground.Rect({x: x, y: y, w: 10, h: 10, "strokeColor": "#000"});
        };

        self.createNeighborRect = function (playground, node, fillColor) {
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

            //noinspection JSUnusedLocalSymbols
            $(marker).on('element:click', function (e, data) {
                if (self.calligraphyEditor.state === EditorStates.ADD_NEIGHBOR) {
                    self.createNeighborRect(playground, newNode, fillColor);
                }
                else if (self.calligraphyEditor.state === EditorStates.DELETE_MARKER) {
                    self.deleteNode(playground, newNode);
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

        self.deleteNode = function (playground, node) {
            if (!node.previous) {
                console.log("Node looks like root! It cannot be deleted!");
                console.log(node);
            }

            node.previous.next = node.next;
            if (node.next)
                node.next.previous = node.previous;

            playground.removeComponent(node.data);
        };


        self.attach = function (playground, _calligraphyEditor) {
            self.calligraphyEditor = _calligraphyEditor;

            const leftRootMarker = self.createMarkerRect(self.leftRootCoordinates.x, self.leftRootCoordinates.y);
            const rightRootMarker = self.createMarkerRect(self.rightRootCoordinates.x, self.rightRootCoordinates.y);
            leftRootMarker.options.fillColor = colorLeftRootMarker;
            rightRootMarker.options.fillColor = colorRightRootMarker;

            const leftRoot = new Node(leftRootMarker);
            const rightRoot = new Node(rightRootMarker);

            //noinspection JSUnusedLocalSymbols
            $(leftRootMarker).on('element:click', function (e, data) {
                if (self.calligraphyEditor.state === EditorStates.ADD_NEIGHBOR) {
                    var newNode = self.createNeighborRect(playground, leftRoot, colorLeftMarker);
                    self.addNoteInBetween(newNode, leftRoot, leftRoot.next);
                }
                // don't allow deleting root marker
            });

            //noinspection JSUnusedLocalSymbols
            $(rightRootMarker).on('element:click', function (e, data) {
                if (self.calligraphyEditor.state === EditorStates.ADD_NEIGHBOR) {
                    var newNode = self.createNeighborRect(playground, rightRoot, colorRightMarker);
                    self.addNoteInBetween(newNode, rightRoot, rightRoot.next);
                }
                // don't allow deleting root marker
            });

            $(playground).on("element:click", function (e, data) {
                if (self.calligraphyEditor.state === EditorStates.INSPECT) {
                    // see http://stackoverflow.com/questions/16862627/json-stringify-output-to-div-in-pretty-print-way
                    var strJson = JSON.stringify(data.element.getState(), null, 2);
                    $('#object-information').html(Utils.syntaxHighlight(strJson));
                }
            });

            playground.addComponent(leftRootMarker);
            playground.addComponent(rightRootMarker);
        };

    };

})(jQuery);