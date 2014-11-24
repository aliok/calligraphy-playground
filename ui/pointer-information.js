(function ($) {
    canvasPlayground.ui.PointerInformation = function (mouseXSpanId, mouseYSpanId) {
        var self = this;

        var $mouseXSpan = $('#' + mouseXSpanId);
        var $mouseYSpan = $('#' + mouseYSpanId);

        self.attach = function (playground) {
            $(playground).on('playground:mousemove', function (e, data) {
                $mouseXSpan.html(data.x);
                $mouseYSpan.html(data.y);
            });
        };
    };

})(jQuery);