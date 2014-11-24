//TODOs :
// * Read http://learn.jquery.com/code-organization/
// * Prevent doing renderAll() unnecessarily by keeping "dirty" state

// see http://stackoverflow.com/questions/10371539/why-define-anonymous-function-and-pass-jquery-as-the-argument
// about passing $ as parameter
(function ($) {
    var playground = new canvasPlayground.Playground('c');

    const pointerInformation = new canvasPlayground.ui.PointerInformation("mouse-x", "mouse-y");
    pointerInformation.attach(playground);

    const viewportOverview = new canvasPlayground.ui.ViewportOverview("viewport-overview", "viewport-overview-container", "viewport-overview-x", "viewport-overview-y");
    viewportOverview.attach('canvasContainer');

    const settingsDialog = new canvasPlayground.ui.SettingsDialog(playground);
    settingsDialog.attach();

    const calligraphyEditor = new calligraphy.Editor();
    calligraphyEditor.attach(playground, settingsDialog);

    const markingContainer = new calligraphy.MarkingContainer({x: 300, y: 200}, {x: 270, y: 220});
    markingContainer.attach(playground, calligraphyEditor);

})(jQuery);