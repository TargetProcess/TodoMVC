define(['tau/libs/jquery/jquery', 'tau/libs/jquery/jquery.isSupport'], function(jQuery) {

    (function($) {

        $.fn.extend({

            animateWithCss: function(options) {

                var defaults = {
                    cssClassName: '',
                    complete: $.noop
                };

                var o = $.extend(defaults, options);

                var $defer = $.Deferred();
                $defer.done(o.complete);

                return this.each(function() {
                    var $el = $(this);

                    $el.removeClass(o.cssClassName).addClass(o.cssClassName);

                    var timeout =
                            parseFloat($el.css('MozAnimationDuration') || $el.css('WebkitAnimationDuration') || 1, 10)
                            *
                            parseFloat($el.css('MozAnimationIterationCount') || $el.css('WebkitAnimationIterationCount') || 1, 10)
                            *
                            1000;

                    _.delay(_.bind(function($d) {
                        this.removeClass(o.cssClassName);
                        $d && $d.resolve();
                    }, $el, $defer), timeout);
                });
            }
        });
    })(jQuery);

    return jQuery;
});