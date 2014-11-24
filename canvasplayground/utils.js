(function ($) {

    /**
     * @namespace canvasPlayground.Utils
     */
    canvasPlayground.Utils = {

        /**
         * Returns the distance between 2 points.
         * @param {int} x1 x of point #1
         * @param {int} y1 y of point #1
         * @param {int} x2 x of point #2
         * @param {int} y2 y of point #2
         * @return {number} distance in floating point number
         */
        distance: function (x1, y1, x2, y2) {
            return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
        },

        /**
         * Returns syntax-highlighted string representation of a JSON.
         * @param {Object} json Any Javascript object
         * @return {string} syntax-highlighted string representation of a JSON
         * @see http://stackoverflow.com/questions/4810841/how-can-i-pretty-print-json-using-javascript
         */
        syntaxHighlight: function (json) {
            // taken from http://stackoverflow.com/questions/4810841/how-can-i-pretty-print-json-using-javascript
            if (typeof json != 'string') {
                json = JSON.stringify(json, undefined, 2);
            }
            json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
                var cls = 'number';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'key';
                    } else {
                        cls = 'string';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'boolean';
                } else if (/null/.test(match)) {
                    cls = 'null';
                }
                return '<span class="' + cls + '">' + match + '</span>';
            });
        },

        /**
         * Generates a GUID.
         * @return {string} a GUID
         * @see http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
         */
        guid: function () {
            // taken from http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }

            return (function () {
                return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
            }());
        },

        /**
         * Parses a string and converts it into an Integer.
         * @param {string} str string to parse
         * @return {int} integer
         * @throws Will throw an exception if given string is not an integer.
         */
        parseInt: function (str) {
            return parseInt(str, 10);
        }
    }
})(jQuery);

