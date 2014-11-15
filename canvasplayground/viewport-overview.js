(function ($) {
    canvasPlayground.ViewportOverview = function (viewportOverviewId, viewportOverviewWrapperId, viewportOverviewInfoXId, viewportOverviewInfoYId) {
        this.$viewportOverviewContainerDiv = $('#' + viewportOverviewWrapperId);
        this.$viewportOverviewDiv = $('#' + viewportOverviewId);

        this.$viewportOverviewInfoXSpan = $('#' + viewportOverviewInfoXId);
        this.$viewportOverviewInfoYSpan = $('#' + viewportOverviewInfoYId);

        this.attach = function (canvasContainerId) {
            var $canvasContainerDiv = $('#' + canvasContainerId);
            var self = this;

            $canvasContainerDiv.on('scroll', function () {
                var viewportOffsetX = $canvasContainerDiv.scrollLeft();
                var viewportOffsetY = $canvasContainerDiv.scrollTop();
                var viewportWidth = $canvasContainerDiv.width();
                var viewportHeight = $canvasContainerDiv.height();

                // scrollWidth is native HTML, not jQuery
                // see https://forum.jquery.com/topic/scroll-width-of-div
                var contentWidth = $canvasContainerDiv[0].scrollWidth;
                var contentHeight = $canvasContainerDiv[0].scrollHeight;

                // first fix the ratio on $viewportOverviewContainerDiv and $viewportOverviewDiv
                self.$viewportOverviewContainerDiv.css('height', self.$viewportOverviewContainerDiv.width() * contentHeight / contentWidth);

                // calculate the percentages
                // based on example : http://jsfiddle.net/SnJXQ/2/
                var widthInPercent = 100 * viewportWidth / contentWidth;
                var heightInPercent = 100 * viewportHeight / contentHeight;
                var offsetXInPercent = 100 * viewportOffsetX / contentWidth;
                var offsetYInPercent = 100 * viewportOffsetY / contentHeight;

                // following is necessary since we're trying to set margin-top with offsetYInPercent but that is calculated based on width as it is relative.
                offsetYInPercent = offsetYInPercent * viewportHeight / viewportWidth;

                self.$viewportOverviewDiv.css('width', widthInPercent + "%");
                self.$viewportOverviewDiv.css('height', heightInPercent + "%");
                self.$viewportOverviewDiv.css('margin-left', offsetXInPercent + "%");
                self.$viewportOverviewDiv.css('margin-top', offsetYInPercent + "%");


                // update the text
                self.$viewportOverviewInfoXSpan.html(viewportOffsetX + " - " + (viewportOffsetX + viewportWidth));
                self.$viewportOverviewInfoYSpan.html(viewportOffsetY + " - " + (viewportOffsetY + viewportHeight));
            });

            // trigger the scroll event once to update viewport overview
            $canvasContainerDiv.scroll();
        };
    };
})(jQuery);