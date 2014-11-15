(function ($) {
    var EditorStates = calligraphy.EditorStates = {
        MOVE: "MOVE",
        ADD_NEIGHBOR: "ADD_NEIGHBOR",
        DELETE_MARKER: "DELETE_MARKER",
        INSPECT: "INSPECT"
    };

    calligraphy.Editor = function () {

        const self = this;
        self.state = EditorStates.MOVE; // default state is MOVE

        this.attach = function (playground, settingsDialog) {
            // following stuff is used dynamically. they're the "data-command-id" attributes of the command buttons
            //noinspection JSUnusedGlobalSymbols
            var calligraphyCommandButtonHandlers = {
                GO_TO_STATE_MOVE: function () {
                    self.state = EditorStates.MOVE;
                    // clear object information shown on side panel
                    $('#object-information').html('');
                },
                GO_TO_STATE_ADD_NEIGHBOR: function () {
                    self.state = EditorStates.ADD_NEIGHBOR;
                },
                GO_TO_STATE_DELETE_MARKER: function () {
                    self.state = EditorStates.DELETE_MARKER;
                },
                GO_TO_STATE_INSPECT: function () {
                    self.state = EditorStates.INSPECT;
                },
                OPEN_PLAYGROUND_SETTINGS: function () {
                    settingsDialog.show();
                },
                DO_SAVE: function () {
                    var state = playground.getState();
                    console.log(state);
                }
            };

            const $calligraphyCommandButtons = $('.calligraphyCommandButton');

            $calligraphyCommandButtons.click(function () {
                var commandId = $(this).attr('data-command-id');
                var commandButtonHandler = calligraphyCommandButtonHandlers[commandId];
                if (!commandButtonHandler) {
                    console.log('No commandButtonHandler found for command ' + commandId);
                }
                else {
                    if ($(this).attr('data-state-button')) {
                        $(".calligraphyCommandButton.active[data-state-button]").removeClass("active");
                        $(this).addClass("active");
                    }
                    commandButtonHandler();
                }
            });

            $calligraphyCommandButtons.each(function (index, button) {
                var shortcut = $(button).attr('data-shortcut');
                if (shortcut) {
                    $(document).bind('keydown', shortcut, function () {
                        $(button).click()
                    });
                }
            });
        };
    };

})(jQuery);