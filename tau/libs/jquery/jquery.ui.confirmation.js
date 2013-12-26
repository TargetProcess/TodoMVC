define(["tau/libs/jquery/jquery.ui"], function(jQuery) {
    (function($, widgetName) {

        $.widget('ui.' + widgetName, {
            options: {
                message: 'Question?',
                okLabel: 'OK',
                cancelLabel: 'Cancel'
            },

            _create: function() {
                if ($.type(this.options.message) != 'string') {
                    throw new TypeError('Invalid confirmation message type. A "string" expected.');
                }

                this.element.addClass(widgetName + 'Host');
                this._$widget = this._bindBehaviour(this._createTemplate());
            },

            _createTemplate: function() {
                var $template = $('<div class="' + widgetName + '"/>');
                var $templateInner = $('<div class="inner"/>');
                var $message = $('<p/>').text(this.options.message);
                var $ok = $('<button type="button" class="ok button mr-5 danger">').text(this.options.okLabel);
                var $cancel = $('<button type="button" class="cancel button">').text(this.options.cancelLabel);

                return $template.append(
                        $templateInner.append($message, $ok, $cancel)
                        );
            },

            _bindBehaviour: function($template) {
                $template.click($.proxy(function(evt) {
                    evt.stopPropagation();
                    evt.preventDefault();

                    var $target = $(evt.target);

                    if ($target.is('.ok')) {
                        return this._trigger('ok');
                    }

                    if ($target.is('.cancel')) {
                        return this._trigger('cancel');
                    }
                }, this));

                return $template;
            },

            show: function() {
                this._$widget.appendTo(this.element);
                this._trigger('show');
            },

            hideConfirmationMessage: function() {
                this._$widget.find('.inner').hide();
            },

            hide: function() {
                this._$widget.detach();
                this._trigger('hide');
            },

            destroy: function() {
                $.Widget.prototype.destroy.apply(this, arguments);
                this._$widget.remove();
                this.element.removeClass(widgetName + 'Host');
            }
        });

    })(jQuery, 'confirmation');

    return jQuery;
});