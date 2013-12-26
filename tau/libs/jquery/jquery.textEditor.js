define(['tau/libs/jquery/jquery.ui'], function (jq) {
    'use strict';

    var getCursorPos = function (editableDiv) {
        var caretPos = 0, containerEl = null, sel, range;
        if (window.getSelection) {
            sel = window.getSelection();
            if (sel.rangeCount) {
                range = sel.getRangeAt(0);
                if (range.commonAncestorContainer.parentNode == editableDiv) {
                    caretPos = range.endOffset;
                }
            }
        } else if (document.selection && document.selection.createRange) {
            range = document.selection.createRange();
            if (range.parentElement() == editableDiv) {
                var tempEl = document.createElement("span");
                editableDiv.insertBefore(tempEl, editableDiv.firstChild);
                var tempRange = range.duplicate();
                tempRange.moveToElementText(tempEl);
                tempRange.setEndPoint("EndToEnd", range);
                caretPos = tempRange.text.length;
            }
        }
        return caretPos;
    };

    var getSelectionPos = function (editableDiv) {

        if (window.getSelection) {
            var sel = window.getSelection();
            if (sel.rangeCount) {
                var range = sel.getRangeAt(0);
                if (range.commonAncestorContainer.parentNode == editableDiv) {
                    var selection = { start:range.startOffset, end: range.endOffset};
                    return selection;
                }
                else if (range.commonAncestorContainer == editableDiv) {
                    var selection = { start:0, end: range.toString().length};
                    return selection;
                }

            }
        }
    };

    (function ($, pluginName) {

        if (pluginName in $) {
            throw new Error('jQuery already has the "' + pluginName + '" property.');
        }


        var bindNamespacedEvents = function ($element, eventMap) {
            for (var eventType in eventMap) {
                $element.bind(eventType + '.' + pluginName, eventMap[eventType]);
            }
        };


        var unbindNamespacedEvents = function ($element, eventMap) {
            for (var eventType in eventMap) {
                $element.unbind(eventType + '.' + pluginName, eventMap[eventType]);
            }
        };

        var TextEditor = function ($element, options) {
            this.setOptions(options);
            this.initElement($element);

            if (this.enabled) {
                this.bindEvents(options);
            }
        };

        TextEditor.prototype = {
            constructor: TextEditor,

            initElement: function ($element) {
                this.$element = $element
                    .addClass(this.className);
            },

            setOptions: function (options) {
                var _options = options || {};
                this.onSave = $.isFunction(_options.onSave) ? _options.onSave : $.noop;
                this.onEditStart = $.isFunction(_options.onEditStart) ? _options.onEditStart : $.noop;
                this.onEditEnd = $.isFunction(_options.onEditEnd) ? _options.onEditEnd : $.noop;
                this.maxLength = _options.maxLength || null;
                this.mask = _options.mask ? new RegExp(_options.mask) : false;
                this.restoreText = (typeof(_options.restoreText) == "undefined") ? true : _options.restoreText;

                this.enabled = options.enabled || true;
                this.className = options.className || 'editableText';
                this.classNameActive = options.className || 'active';
            },


            enable: function() {
                if (!this.enabled) {
                    this.enabled = true;
                    this.bindEvents(this);
                }
            },

            disable: function() {
                if (this.enabled) {
                    this.enabled = false;
                    this.deactivate();
                    this.unbindEvents(this);
                }
            },

            bindEvents: function (options) {
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


            unbindEvents: function (options) {
                options = options || {};
                var self = this;

                if (options.resetOnBlur) {
                    self.onBlur = function() {
                        this._cancelEdit();
                    }
                }

                unbindNamespacedEvents(self.$element, {
                    //'focus': $.proxy(this, 'onFocus'),
                    'blur': $.proxy(self, 'onBlur'),
                    'keydown': $.proxy(self, 'mapKeys'),
                    'keypress': $.proxy(self, 'mapKeys'),
                    'click': $.proxy(self, 'onFocus')
                    //'mouseleave': $.proxy(this, 'onMouseLeave')
                });

            },

            onFocus: function (evt) {
                if (evt) {
                    evt.stopPropagation();
                }

                if (!this.isActive()) {
                    this.activate();
                    this.onEditStart();
                    this.storeInitialText();
                }
            },

            _performSave: function (noCheck) {
                if (!noCheck && !this.isActive()) {
                    this.deactivate();
                    return;
                }
                this.deactivate();
                this.saveText();
                this.onEditEnd();
            },

            _cancelEdit: function() {
                if (!this.isActive()) {
                    return;
                }

                this.deactivate();
                this.restoreInitialText();
                this.onEditEnd();
            },

            onBlur: function () {
                this._performSave();
            },

            onEnter: function (event) {
                event.preventDefault();
                this._performSave(true);
                this.$element.blur();
            },

            onEscape: function (event) {
                event.preventDefault();
                event.stopPropagation();
                this._cancelEdit();
                this.$element.blur();
            },

            onKeyDefault: function (event) {

                var str = this._getValue();
                var k = event.which;
                if (event.ctrlKey || event.altKey || event.metaKey || k<32) {//Ignore
                    return true;
                }


                var charValue = String.fromCharCode(k);
                var pos = getCursorPos(this.$element[0]);


                var strParts = [str.substring(0, pos),charValue,str.substring(pos)];
                var newVal = strParts.join('');
                if (!this.mask.test(newVal)) {
                    event.preventDefault();
                }



            },

            activate: function () {
                this.$element
                    .prop('contentEditable', true)
                    .data('testEditorActive', true)
                    .addClass(this.classNameActive)
                    .focus()
                    ;
            },

            deactivate: function () {
                this.$element
                    .prop('contentEditable', false)
                    .data('testEditorActive', false)
                    .removeClass(this.classNameActive)
                    ;
            },

            isActive: function () {
                return this.$element.data('testEditorActive') || false;
            },

            setInitialText: function (text) {
                this.initialText = text;
            },

            getInitialText: function () {
                return this.initialText;
            },

            storeInitialText: function () {
                this.setInitialText(this._getValue());
            },

            restoreInitialText: function () {
                this._setValue(this.getInitialText())
            },

            trimText: function (text) {
                return _.trim(text);
            },

            normalizeText: function (text) {
                var normalizedText = this.trimText(text);

                if (normalizedText.length == 0 && this.restoreText === true) {
                    normalizedText = this.getInitialText();
                }

                return normalizedText;
            },

            saveText: function () {
                var changedText = this.normalizeText(this._getValue());
                this._setValue(changedText)

                if (changedText != this.getInitialText()) {
                    this.onSave(changedText);
                }
            },

            mapKeys: function (event) {
                switch (event.which) {
                    case 13: // ENTER
                        this.onEnter(event);
                        break;
                    case 27: // ESCAPE
                        this.onEscape(event);
                        break;
                    default:
                        if (event.type == 'keypress' && this.mask) {
                            this.onKeyDefault(event);
                        }
                        break;
                }
            },

            _getValue: function(){
                return this.$element.is('input') ? this.$element.val(): this.$element.text();
            },

            _setValue: function(v){
                return this.$element.is('input') ? this.$element.val(v): this.$element.text(v);
            }
        };


        $.fn[pluginName] = function (options) {
            return this.each(function (index, element) {
                var $element = $(element);
                $element.data(pluginName, new TextEditor($element, options));
            });
        };

        $[pluginName] = function (element, options) {
            return $(element)[pluginName](options);
        };

    })(jq, 'textEditor');

    return jq.fn.textEditor;

});
