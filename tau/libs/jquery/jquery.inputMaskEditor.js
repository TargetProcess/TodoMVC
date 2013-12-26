define(['tau/libs/jquery/jquery.ui'], function(jq) {

    (function($, pluginName) {

        if (pluginName in $) {
            throw new Error('jQuery already has the "' + pluginName + '" property.');
        }


        var getSelection = function(el) {
            var start = 0, end = 0, normalizedValue, range,
                textInputRange, len, endRange, statusSelection = false;

            if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
                start = el.selectionStart;
                end = el.selectionEnd;
            } else {
                range = document.selection.createRange();

                if (range && range.parentElement() == el) {
                    len = el.value.length;
                    normalizedValue = el.value.replace(/\r\n/g, "\n");

                    // Create a working TextRange that lives only in the input
                    textInputRange = el.createTextRange();
                    textInputRange.moveToBookmark(range.getBookmark());

                    // Check if the start and end of the selection are at the very end
                    // of the input, since moveStart/moveEnd doesn't return what we want
                    // in those cases
                    endRange = el.createTextRange();
                    endRange.collapse(false);

                    if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
                        start = end = len;
                    } else {
                        start = -textInputRange.moveStart("character", -len);
                        start += normalizedValue.slice(0, start).split("\n").length - 1;

                        if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
                            end = len;
                        } else {
                            end = -textInputRange.moveEnd("character", -len);
                            end += normalizedValue.slice(0, end).split("\n").length - 1;
                        }
                    }
                }
            }
            if ((start - end) != 0) {
                statusSelection = true;
            }
            return {
                start: start,
                end: end,
                statusSelection: statusSelection
            };
        };

        var bindNamespacedEvents = function($element, eventMap) {
            for (var eventType in eventMap) {
                $element.bind(eventType + '.' + pluginName, eventMap[eventType]);
            }
        };


        var unbindNamespacedEvents = function($element, eventMap) {
            for (var eventType in eventMap) {
                $element.unbind(eventType + '.' + pluginName, eventMap[eventType]);
            }
        };

        var InputMaskEditor = function($element, options) {
            this.setOptions(options);
            this.initElement($element);
            this.bindEvents(options);

        };

        InputMaskEditor.prototype = {
            constructor: InputMaskEditor,

            initElement: function($element) {
                this.$element = $element
                    .addClass(this.className);
            },

            setOptions: function(options) {
                var _options = options || {};
                this.onSave = $.isFunction(_options.onSave) ? _options.onSave : $.noop;
                this.onEditStart = $.isFunction(_options.onEditStart) ? _options.onEditStart : $.noop;
                this.onEditEnd = $.isFunction(_options.onEditEnd) ? _options.onEditEnd : $.noop;
                this.maxLength = _options.maxLength || 255;
                this.mask = _options.mask ? new RegExp(_options.mask) : false;
                this.restoreText = (typeof(_options.restoreText) == "undefined") ? true : _options.restoreText;

                this.enabled = options.enabled || true;
                this.className = options.className || 'editableText';
                this.classNameActive = options.className || 'active';
            },


            bindEvents: function(options) {
                options = options || {};
                var self = this;

                if (options.resetOnBlur) {
                    self.onBlur = function() {
                        this._cancelEdit();
                    }
                }

                bindNamespacedEvents(self.$element, {
                    //'focus': $.proxy(this, 'onFocus'),
                    'blur': $.proxy(self, 'onBlur'),
                    'keydown': $.proxy(self, 'mapKeys'),
                    'keypress': $.proxy(self, 'mapKeys'),
                    'click': $.proxy(self, 'onFocus')
                    //'mouseleave': $.proxy(this, 'onMouseLeave')
                });

                if (!$.browser.msie) {
                    $(window).blur(function() {
                        self.$element.blur();
                    });
                }
            },


            unbindEvents: function(options) {
                options = options || {};
                var self = this;

                if (options.resetOnBlur) {
                    self.onBlur = function() {
                        this._cancelEdit();
                    }
                }

                unbindNamespacedEvents(self.$element, {
                    'blur': $.proxy(self, 'onBlur'),
                    'keydown': $.proxy(self, 'mapKeys'),
                    'keypress': $.proxy(self, 'mapKeys'),
                    'click': $.proxy(self, 'onFocus')
                });

            },


            onKeyDefault: function(event) {
                var k = event.which;
                if (event.ctrlKey || event.altKey || event.metaKey || k < 32) {//Ignore
                    return true;
                }

                var charValue = String.fromCharCode(k);
                var value = event.target.value;
                var selectionParam = getSelection(event.target);
                if (selectionParam.statusSelection) {
                    value = value.substring(0, selectionParam.start) + charValue + value.substring(selectionParam.end);
                } else {
                    value += charValue;
                }
                if (!this.mask.test(value)) {
                    return event.preventDefault();
                }

            },


            trimText: function(text) {
                return _.trim(text);
            },

            normalizeText: function(text) {
                var normalizedText = this.trimText(text);

                if (normalizedText.length == 0 && this.restoreText === true) {
                    normalizedText = this.getInitialText();
                }

                return normalizedText;
            },

            mapKeys: function(event) {
                switch (event.which) {
                    case 13: // ENTER
//                        this.onEnter(event);
                        break;
                    case 27: // ESCAPE
//                        this.onEscape(event);
                        break;
                    default:
                        if (event.type == 'keypress' && this.mask) {
                            this.onKeyDefault(event);
                        }
                        break;
                }
            }
        };


        $.fn[pluginName] = function(options) {
            return this.each(function(index, element) {
                var $element = $(element);
                $element.data(pluginName, new InputMaskEditor($element, options));
            });
        };

        $[pluginName] = function(element, options) {
            return $(element)[pluginName](options);
        };

    })(jq, 'inputMaskEditor');

    return jq.fn.inputMaskEditor;

});
