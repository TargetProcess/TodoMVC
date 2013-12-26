define(['tau/libs/jquery/jquery.ui'], function(jQuery) {
    /*
     @description
     'Tau Bubble' jQuery widget.

     @interface
     {
     show();
     hide();
     setContent(content);
     getContent();
     setPosition(position);
     getPosition();
     }
     */

    'use strict';

    (function($, widgetName) {

        var POSITIONS = {
            TOP: 'top',
            BOTTOM: 'bottom',
            AUTO: 'auto'
        };

        var MARKERS = {
            CONTENT: widgetName + '-content',
            PLACEHOLDER: widgetName + '-placeholder',
            ACTIVE: widgetName + '-active'
        };

        $.widget('ui.' + widgetName, {
            options: {
                content: '',
                position: POSITIONS.AUTO
            },

            _create: function() {
                this._createFrame();
                this.hide();
                this.setContent($(this.options.content));
                this.setPosition(this.options.position || POSITIONS.AUTO);
                this._initDOM();
            },

            _createFrame: function() {
                var $frame = $('<div/>').addClass(widgetName);
                var $contentWrapper = $('<div/>').addClass(MARKERS.CONTENT);

                $frame.append($contentWrapper);

                this._$frame = $frame;
                this._$contentWrapper = $contentWrapper;
            },

            show: function() {
                this.updatePosition();
                this.element.addClass(MARKERS.ACTIVE);
                this._trigger('show');
            },

            hide: function() {
                this._trigger('hide');
                this.element.removeClass(MARKERS.ACTIVE);
            },

            setContent: function(content) {
                this._$content = $(content).appendTo(
                        this._$contentWrapper.empty()
                        );
            },

            getContent: function() {
                return this._$content;
            },

            setPosition: function(position) {
                if (this._isValidPosition(position) && (position != this._$position)) {
                    var _position = this._$position = position;

                    if (_position == POSITIONS.AUTO) {
                        _position = this._calculatePosition();
                    }

                    this._setPositionMarker(_position);
                }
            },

            getPosition: function() {
                return this._$position;
            },

            updatePosition: function() {
                if (this.getPosition() == POSITIONS.AUTO) {
                    this._setPositionMarker(this._calculatePosition())
                }
            },

            _isValidPosition: function(position) {
                var isValid = false;

                $.each(POSITIONS, function(key, value) {
                    if (position == value) {
                        isValid = true;
                        return false;
                    }
                });

                return isValid;
            },

            _setPositionMarker: function(position) {
                var markersToClear = $.map(POSITIONS, function(p) {
                    if (p != position) {
                        return p;
                    }
                });

                this._$frame
                        .removeClass(markersToClear.join(' '))
                        .addClass(position)
            },

            _calculatePosition: function() {
                var viewportHeight = $(window).height();
                var placeholderHeight = this.element.outerHeight();
                var placeholderOffset = this.element.offset();

                var isPlaceholderInUpperSector = (2 * placeholderOffset.top + placeholderHeight) < viewportHeight;

                var position = POSITIONS.TOP;

                if (isPlaceholderInUpperSector) {
                    position = POSITIONS.BOTTOM;
                }

                return position;
            },

            _initDOM: function() {
                this.element
                        .addClass(MARKERS.PLACEHOLDER)
                        .append(this._$frame)
                        ;

            },

            destroy: function() {
                $.Widget.prototype.destroy.apply(this, arguments);
                this._$frame.remove();
                this.element.removeClass(MARKERS.PLACEHOLDER);
            }
        });

    })(jQuery, 'taububblepopup');

    return jQuery;
});
