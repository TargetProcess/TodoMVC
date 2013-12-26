define([
    'tau/libs/jquery/jquery'
], function($){

    var pluginName = 'notifyBar';

    $.fn[pluginName] = function(method) {


        var methods = {

            init : function(options) {

                this[pluginName].settings = $.extend(
                        {},
                        this[pluginName].defaults,
                        options
                );

                var settings = this[pluginName].settings;
                var $el;

                if (!this[pluginName].$el || this[pluginName].$el.length == 0) {

                    $el = $("<div class='jquery-notify-bar'><div class='jquery-notify-bar-inners'></div></div>");
                    this[pluginName].$el = $el;
                }

                $el = this[pluginName].$el;
                $el.one('click', function(){
                    var $el = $(this);
                    $el.clearQueue().slideUp(settings.animationSpeed);
                });


                return this.each(function() {
                    var $element = $(this), // reference to the jQuery version of the current DOM element
                         element = this;      // reference to the actual DOM element

                    if (!$el.parent().is($element)){
                        $el.prependTo($element);
                    }

                    $el.clearQueue();

                    if ($el.data('className')) {
                        $el.removeClass($el.data('className'));
                    }

                    $el.addClass(settings.className).data('className', settings.className);

                    var $inners = $el.find('.jquery-notify-bar-inners');
                    if (settings.$node) {
                        $inners.empty().append(settings.$node);
                    }
                    else {
                        $inners.html(settings.html);
                    }

                    if (!$el.is(':visible')) {
                                if(settings.disableAutoClose) {
                                    $el.slideDown(settings.animationSpeed);
                        }
                        else {
                                    $el.slideDown(settings.animationSpeed).delay(settings.delay).slideUp(settings.animationSpeed);
                                }
                    }
                });
            },

            remove: function() {
                var $el = $.fn[pluginName].$el;
                if ($el) {
                    $.fn[pluginName].$el = null;
                    $el.remove();
                }
            }

        };

        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error( 'Method "' +  method + '" does not exist in pluginName plugin!');
        }

    };

    $.fn[pluginName].defaults = {
        className:          '',
        $node:              null,
        html:               '',
        animationSpeed:     'fast',
        delay:              60000,
        disableAutoClose:   false
    };

    $.fn[pluginName].settings = {}

});
