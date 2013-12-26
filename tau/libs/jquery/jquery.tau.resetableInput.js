define(['tau/libs/jquery/jquery'], function (jQuery) {

    (function ($, pluginName) {

       if (pluginName in $.fn) {
           throw new Error('The "' + pluginName + '" jQuery plugin is already defined.');
       }

        var show = function($el) {
            $el.css('visibility', 'visible');
        };

        var hide = function($el) {
            $el.css('visibility', 'hidden');
        };

        var iterator = function(options) {

            var $input = $(this);

            if (!$input.is('input[type="text"]')) {
                return $(this);
            }

            options = $.extend({
                cssClass:'',
                template:'<button type="button" tabindex="-1"></button>',
                onAttach: function($input, $button) {
                    var $wrapper = $('<span class="tau-resetable-input"></span>');
                    $wrapper.insertBefore($input);
                    $input.detach();
                    $wrapper
                        .append($input)
                        .append($button);
                }
            }, options);

            var $reseter = $(options.template).addClass(options.cssClass);
            hide($reseter);

            options.onAttach($input, $reseter);

            $input.addClass('i-role-resetable-target');
            $reseter.addClass('i-role-resetable-trigger');

            var timeout = null;
            var toggleButton = function () {
                $input.val() ? show($reseter): hide($reseter);
            };

            var onActivate = function() {
                clearTimeout(timeout);
                timeout = setTimeout(toggleButton, 0);
            };

            var onDeactivate = function() {
                clearTimeout(timeout);
                hide($reseter);
            };

            var $parent = $input.parent();
            var $selector = '.i-role-resetable-target,.i-role-resetable-trigger';
            var handlers = {
                'mouseenter': onActivate,
                'mouseleave': onDeactivate
            };

            var initSubscription = function() {
                $parent.on(handlers, $selector);
            };

            var resetSubscription = function() {
                $parent.off(handlers, $selector);
                $parent.on(handlers, $selector);
            };

            var removeSubscription = function() {
                $parent.off(handlers, $selector);
            };

            var onFocus = function() {
                onActivate();
                removeSubscription();
            };

            var onBlur = function() {
                onDeactivate();
                resetSubscription();
            };

            $input.on({
                'keydown': onActivate,
                'input': onActivate,
                'focus': onFocus,
                'blur': onBlur
            });

            initSubscription();

            $reseter.on('mousedown', function (evt) {
                if(evt.which != 1){
                    return;
                }

                hide($(this));
                $input
                    .val('')
                    .focus()
                    .trigger($.Event('keydown', { keyCode: 8 }))
                    .trigger($.Event('keyup', { keyCode: 8 }))
                    .trigger($.Event('keypress', { keyCode: 8 }))
                    .trigger('input')
                    .trigger('clear');
                evt.preventDefault();
                return false;
            });

            return $(this);
        };

        $.fn[pluginName] = function(options) {

            if (!$.browser.msie) {
                this.each(function() {
                    iterator.call(this, options);
                });
            }

            return this;
        };

    } (jQuery, 'tauResetableInput'));
});