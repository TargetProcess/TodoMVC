define(["tau/libs/jquery/jquery"], function(jQuery) {
    (function($) {
        var isInputSupported = 'placeholder' in document.createElement('input'),
            isTextareaSupported = 'placeholder' in document.createElement('textarea'),
            togglePlaceholder = function() {
                var placeholder = $(this).nextAll('.placeholder');
                if ($(this).val()) {
                    placeholder.removeClass('show').addClass('hide');
                } else {
                    placeholder.addClass('show').removeClass('hide');
                }
            };
        function refresh() {
            if (isInputSupported && isTextareaSupported) {
                return this;
            }
            $(this).each(function() {
                togglePlaceholder.call(this);
            });
            return this;
        };
        $.fn.placeholder = function(options) {
            if(options == 'refresh') {
                refresh.call(this);
                return this;
            }
            options = $.extend({
                style: 'placeholder',
                template: '<label></label>'
            }, options);
            var interval = null,
                placeholder = $(options.template).addClass(options.style),
                delayPlaceholder = function() {
                    var self = this;
                    clearTimeout(interval);
                    interval = setTimeout(function() {
                        togglePlaceholder.call(self);
                    }, 0);
                };

            if (isInputSupported && isTextareaSupported) {
                return this;
            }

            $(this).each(function() {
                var input = $(this),
                    placeholder = $(options.template).addClass(options.style).addClass('placeholder').attr('for', this.id);
                placeholder.appendTo(input.parent());
                placeholder.text(input.attr('placeholder'));
                placeholder.click($.proxy(function() {
                    $(this).focus();
                }, this));
                togglePlaceholder.call(this);
            });


            $(this).on('keydown.placeholder keypress.placeholder input paste focus change', delayPlaceholder);


            return this;
        }
    }(jQuery))
});