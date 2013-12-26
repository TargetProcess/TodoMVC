define(['jQuery'], function (jQuery) {

    /**
     * jQuery plugin for getting selection or replace a text in input field and textarea
     *
     * Dual licensed under the MIT or GPL Version 2 licenses.
     *
     * @version 0.1
     * @author Oleg Slobodskoi (jsui.de)
     */

    (function ($) {

        /**
         * Extend jQuery's prototype
         * @param {string} [text]
         */
        $.fn.fieldSelection = function (text) {
            var ret;
            this.each(function () {
                this.focus();
                ret = text ? replace(this, text || '') : get(this);
            });
            return ret || this;
        };

        /**
         * Get selection
         * @param {Object} elem
         */
        function get(elem) {
            var data = {start: 0, end: elem.value.length, length: 0};

            // dom 3
            if (elem.selectionStart >= 0) {
                data.start = elem.selectionStart;
                data.end = elem.selectionEnd;
                data.length = data.end - data.start;
                data.text = elem.value.substr(data.start, data.length);
                // IE
            } else if (elem.ownerDocument.selection) {
                var r = elem.ownerDocument.selection.createRange();
                if (!r) return data;
                var tr = elem.createTextRange(),
                    ctr = tr.duplicate();

                tr.moveToBookmark(r.getBookmark());
                ctr.setEndPoint('EndToStart', tr);
                data.start = ctr.text.length;
                data.end = ctr.text.length + r.text.length;
                data.text = r.text;
                data.length = r.text.length;
            }

            return data;
        }

        /**
         * Replace selection
         * @param {Object} elem
         * @param {string} text
         */
        function replace(elem, text) {
            // dom 3
            if (elem.selectionStart >= 0) {
                var start = elem.selectionStart,
                    end = elem.selectionEnd,
                    pos,
                    scrollTop = elem.scrollTop,
                    scrollLeft = elem.scrollLeft;

                elem.value = elem.value.substr(0, start) + text + elem.value.substr(end);
                pos = start + text.length;
                elem.selectionStart = pos;
                elem.selectionEnd = pos;
                // settings selection selection resets scroll position in FF, so restore it
                elem.scrollTop = scrollTop;
                elem.scrollLeft = scrollLeft;
                // IE
            } else if (elem.ownerDocument.selection) {
                var range = elem.ownerDocument.selection.createRange();
                range.text = text;
                range.move('character', 0);
                range.select();
            } else {
                // browser not supported - set at the end
                elem.value += text;
                // scroll to the end of textarea to show inserted
                elem.scrollTop = 100000;
            }
        }

    })(jQuery);


    define("MashupManager/jquery/fieldSelection", [], function() {
        return $;
    });

    return $;
});