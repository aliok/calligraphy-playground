//TODOs :
// * Read http://learn.jquery.com/code-organization/
// * Prevent doing renderAll() unnecessarily by keeping "dirty" state

// see http://stackoverflow.com/questions/10371539/why-define-anonymous-function-and-pass-jquery-as-the-argument
// about passing $ as parameter
(function ($) {
    var EPSILON = 0.01;

    var Utils = canvasPlayground.Utils;
    var Playground = canvasPlayground.Playground;
    var Rect = canvasPlayground.Rect;


    var playground = new Playground('c');


    var Node = function (data) {
        this.data = data;
        this.previous = null;
        this.next = null;
    };

    var EditorStates = {
        MOVE: "MOVE",
        ADD_NEIGHBOR: "ADD_NEIGHBOR",
        DELETE_MARKER: "DELETE_MARKER",
        INSPECT: "INSPECT"
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

        $(playground).on("element:click", function (e, data) {
            if (self.state === EditorStates.INSPECT) {
                // see http://stackoverflow.com/questions/16862627/json-stringify-output-to-div-in-pretty-print-way
                var strJson = JSON.stringify(data.element.getState(), null, 2);
                $('#object-information').html(Utils.syntaxHighlight(strJson));
            }
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

    // following stuff is used dynamically. they're the "data-command-id" attributes of the command buttons
    //noinspection JSUnusedGlobalSymbols
    var commandButtonHandlers = {
        GO_TO_STATE_MOVE: function () {
            calligraphyMarkingContainer.state = EditorStates.MOVE;
            // clear object information shown on side panel
            $('#object-information').html('');
        },
        GO_TO_STATE_ADD_NEIGHBOR: function () {
            calligraphyMarkingContainer.state = EditorStates.ADD_NEIGHBOR;
        },
        GO_TO_STATE_DELETE_MARKER: function () {
            calligraphyMarkingContainer.state = EditorStates.DELETE_MARKER;
        },
        GO_TO_STATE_INSPECT: function () {
            calligraphyMarkingContainer.state = EditorStates.INSPECT;
        },
        OPEN_PLAYGROUND_SETTINGS: function () {
            $('#playgroundIdInput').val(playground.options.id);
            $('#playgroundNameInput').val(playground.options.name);
            $('#playgroundWidthInput').val(playground.options.width);
            $('#playgroundHeightInput').val(playground.options.height);

            $('#playgroundSettingsModal').modal('show');
        },
        DO_SAVE: function () {
            var state = playground.getState();
            console.log(state);
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
                $(".commandButton.active[data-state-button]").removeClass("active");
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

    $('#playgroundSettingsSaveButton').click(function () {
        playground.options.name = $('#playgroundNameInput').val();
        playground.options.width = Utils.parseInt($('#playgroundWidthInput').val());
        playground.options.height = Utils.parseInt($('#playgroundHeightInput').val());

        playground.refresh();
    });

    var pointerInformation = new canvasPlayground.PointerInformation("mouse-x", "mouse-y");
    pointerInformation.attach(playground);

    var viewportOverview = new canvasPlayground.ViewportOverview("viewport-overview", "viewport-overview-container", "viewport-overview-x", "viewport-overview-y");
    viewportOverview.attach('canvasContainer');


})(jQuery);