(function ($) {
    var Utils = canvasPlayground.Utils;

    canvasPlayground.ui.SettingsDialog = function (playground) {

        this.attach = function () {
            $('#playgroundSettingsSaveButton').click(function () {
                playground.options.name = $('#playgroundNameInput').val();
                playground.options.width = Utils.parseInt($('#playgroundWidthInput').val());
                playground.options.height = Utils.parseInt($('#playgroundHeightInput').val());

                playground.refresh();
            });
        };

        this.show = function () {
            $('#playgroundIdInput').val(playground.options.id);
            $('#playgroundNameInput').val(playground.options.name);
            $('#playgroundWidthInput').val(playground.options.width);
            $('#playgroundHeightInput').val(playground.options.height);

            $('#playgroundSettingsModal').modal('show');
        };
    };


})(jQuery);