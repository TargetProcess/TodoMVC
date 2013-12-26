define([
    'tau/libs/jquery/jquery',
    'tau/libs/jquery/jquery.ui.tauBubble'
], function(jQuery) {
    (function($, window, document) {
        /**need for parent widget*/
        var _bubblesCache = {};
        /**
         * @class tauConfirm
         * @extends tauBubble
         */
        $.widget("ui.tauConfirm", $.ui.tauBubble, {
            options: {
                template: [
                    '<div class="tau-bubble tau-warning-bubble">',
                        '<div class="tau-bubble__arrow"  role="arrow"></div>',
                        '<div class="tau-bubble__inner tau-container">',
                            '<div role="content">',

                            '</div>',
                            '<div class="tau-buttons">',
                                '<button type="button" class="tau-btn tau-primary i-role-actionok">Yes, I\'m sure</button>',
                                '<button type="button" class="tau-btn i-role-actioncancel">No</button>',
                            '</div>',
                        '</div>',
                    '</div>'
                ].join(''),
                stackName:'confirm',
                callbacks: {
                    success: $.noop,
                    cancel: $.noop,
                    always: $.noop
                },
                arrowPositionConfig:null
            },
            _create: function() {
                $.ui.tauBubble.prototype._create.call(this);
            },
            /**
             * @override
             * @inheritDoc
             */
            _setOption: function(key, value) {
                if(key === 'callbacks') {
                   value = $.extend(this.options.callbacks,value);
                }
                $.ui.tauBubble.prototype._setOption.call(this, key, value);
            },
            /**
             * set handler for widget
             * @private
             */
            _setHandler: function() {
                this.$popup.on('click', '.i-role-actionok', $.proxy(function() {
                    this.hide();
                    this.options.callbacks.success.call(this, this);
                    this.options.callbacks.always.call(this, this);
                }, this));
                this.$popup.on('click', '.i-role-actioncancel', $.proxy(function() {
                    this.hide();
                    this.options.callbacks.cancel.call(this, this);
                    this.options.callbacks.always.call(this, this);
                }, this));
            },
            _initInstance: function() {
                $.ui.tauBubble.prototype._initInstance.call(this);
                this._setHandler();
            }
        });

    })(jQuery, window, document);

});
