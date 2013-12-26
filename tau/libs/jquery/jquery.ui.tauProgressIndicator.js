define([
    'tau/libs/jquery/jquery.ui'
], function($) {

    var DATA_KEY = 'progress-indicator-originalPosition';

    $.widget("ui.tauProgressIndicator", {
        _create: function() {
        },

        show: function(options) {

            options = options || {};
            var $placeholder = this.element;
            
            var isNoLoader = $placeholder.children('.tau-loader').length == 0;

            if (isNoLoader) {

                var originalPosition = $placeholder.css('position');

                if (!$placeholder.is('body') && originalPosition.toLowerCase() === 'static') {
                    $placeholder
                            .data(DATA_KEY, originalPosition)
                            .css('position', 'relative')
                }

                var $indicator = $('<div />')
                        .addClass('tau-loader')
                        .appendTo($placeholder);

                if (options.hover) {
                    var hoverCss = {
                        'background-color': 'white',
                        'opacity': 0.5,
                        'z-index': ($indicator.css('z-index') - 1),
                        'position': 'absolute',
                        'top': 0,
                        'left': 0,
                        'height': '100%',
                        'width': '100%'
                    };
                    $('<div />')
                        .addClass('i-role-loader-hover')
                        .css(hoverCss)
                        .appendTo($placeholder);
                }

                var parentTagName = $placeholder.get(0).tagName || '';
                if (parentTagName.toLowerCase() === 'body') {
                    //$indicator.css('position', 'fixed');
                }

                $indicator.sprite(
                    {
                        autoplay: true,

                        url: true,
                        frames: 10,
                        width: 560,
                        height: 56
                    }
                );
            }
        },

        hide: function() {

            var $placeholder = this.element;

            $placeholder.children('.tau-loader,.i-role-loader-hover').remove();
            var originalPosition = $placeholder.data(DATA_KEY);
            if (!$placeholder.is('body') && originalPosition) {
                $placeholder.css('position', originalPosition);
            }
        }
    });
});
