define([
    'tau/libs/jquery/jquery.ui'
], function($) {

(function ( jQuery, window, document) {

    $.widget("ui.tauPopup" , {

        //Options to be used as defaults
        options: {

            appendTo:   'body',
            content: '',

            overlayTemplate: [
                '<div class="ui-popup-overlay"></div>'
            ].join(''),
            popupTemplate: [
                '<div class="ui-popup">',
                    '<div class="close"></div>',
                '</div>'
            ].join('')
        },

        _create: function () {

            var opts = this.options;

            var $appendTo = $(opts.appendTo);

            this.$overlay = $(opts.overlayTemplate);
            this.$container = $(opts.popupTemplate);

            this.$overlay.appendTo($appendTo);
            this.$container.appendTo($appendTo);
        },

        show: function () {

            var opts = this.options;
            var $appendTo = $(opts.appendTo);

            $appendTo.data('savedOverflow', $appendTo.css('overflow'));
            $appendTo.css('overflow', 'hidden');

            this.$overlay.toggleClass('ui-popup-overlay_active_true', true);
            this.$container.toggleClass('ui-popup_active_true', true);


            this.$overlay.on('click', _.bind(function(e){
                if (this.$overlay.is(e.target)) {
                    this.hide();
                }
            }, this));

            this.$container.children('.close').on('click', _.bind(function(e){
                this.hide();
            }, this));
//
//            $(document).on('keydown.tauPopup', _.bind(function(e){
//                if (e.keyCode == $.ui.keyCode.ESCAPE) {
//                    this.hide();
//                }
//            }, this));

        },

        hide: function(){

            var opts = this.options;

            this.$overlay.toggleClass('ui-popup-overlay_active_true', false);
            this.$container.toggleClass('ui-popup_active_true', false);

            var $appendTo = $(opts.appendTo);
            $appendTo.css('overflow', $appendTo.data('savedOverflow'));

            this.$overlay.off('click');
            this.$container.children('.close').off('click');

//            $(document).off('keydown.tauPopup');

            this._trigger('hide');
        },

        destroy: function(){

            this.hide();
            this.$overlay.remove();
            this.$container.remove();

        },

        widget: function() {
            return this.$container;
        }

    });

})( jQuery, window, document );

});
