define([
    'tau/libs/jquery/jquery.ui'
    ,'tau/libs/jquery/jquery.ui.position'
], function($) {

(function ( jQuery, window, document) {

    var _bubblesCache = {};
    /**
     * @class tauBubble
     * @extends Widget
     */
    $.widget("ui.tauBubble" , {

        //Options to be used as defaults
        options: {
            application:    null,
            within:         null,

            appendTo:   'body',
            alignTo:    null,

            zIndex:     null,

            onBeforeShow:           $.noop,
            onShow:                 $.noop,

            onHide:                 $.noop,

            onPositionConfig:       $.noop,
            onArrowPositionConfig:  $.noop,

            onResize:               $.noop,

            showOnCreation: false,
            closeOnEscape:  true,

            mode: 'bubble', // bubble|tooltip

            showEvent: 'click',
            hideEvent: 'click',

            className: '',

            content: '',

            stackName: 'default',
            delay: 0, // before show in milliseconds

            template: [
                '<div class="tau-bubble">',
                    '<div class="tau-bubble__arrow"         role="arrow"></div>',
                    '<div class="tau-bubble__inner"         role="content"></div>',
                '</div>'
            ].join(''),
            dontCloseSelectors:[]
        },

        _timeoutToken: null,

        toggle:function () {

            var self = this;
            if (!self.$popup || !self.$popup.is(':visible')) {
                self.show();
            }
            else {
                self.hide();
            }
        },


        show: function () {
            if (this.options.disabled) return;

            var self = this;

            this._initInstance();

            var $popup = self.$popup;
            var $target = self.$target;
            var opts = self.options;
            if(opts.zIndex != ''){
                opts.zIndex = opts.zIndex || ($target.zIndex()+1);

                $popup.zIndex(opts.zIndex);
            }
            $target.trigger('show.before', {});

            if (self.options.onBeforeShow.call(self, $popup) === false){
                return;
            }

            $popup.show();
            $popup.addClass('i-state_visible');

            self.adjustPosition();
            self.adjustSize();
            self.adjustPosition();

            self.options.onShow.call(self, $popup);

            _bubblesCache[opts.stackName] = _bubblesCache[opts.stackName] || [];

            // unsafe: self._bubblesCache length can changed within cycle
            for (var i = 0; i < _bubblesCache[opts.stackName].length; i++) {
                var cacheItem = _bubblesCache[opts.stackName][i];
                if (cacheItem != self) {
                    cacheItem.$target.trigger('externalClose', {});
                    cacheItem.hide();
                }
            }

            self._signUpForCloseEvents();


            if (!self._windowResizeDelegate) {
                self._windowResizeDelegate = _.bind(function() {
                    this.adjustPosition();
                }, this);
            }

            $(window).bind('resize', self._windowResizeDelegate);

            var evtData = {
                api: self,
                target: self.$target,
                popup : self.$popup
            };

            this._trigger('show');

            self.$target.trigger('show', evtData);
            self.$popup.trigger('show', evtData);
        },



        hide: function(evt) {
            var self = this;
            var $popup = self.$popup;

            if (!$popup || !$popup.is(':visible')) {
                return;
            }

            $popup.removeClass('i-state_visible');
            self.options.onHide.call(self, $popup);
            $popup.hide();

            if (self._documentKeyDown) {
                $(document).unbind('keydown', self._documentKeyDown);
                delete self._documentKeyDown;
            }

            if (self._documentClickDelegate) {
                $(document).unbind('click', self._documentClickDelegate);
                delete self._documentClickDelegate;
            }

            if (self._windowResizeDelegate) {
                $(window).unbind('resize', self._windowResizeDelegate);
                delete self._windowResizeDelegate;
            }

            self.$target.trigger('close', {
                event: evt
            });

            this._trigger('hide');
        },


        _create: function () {
            var opts = this.options;


            this.$target = this.element;

            this.$alignTo = this._getAlignTo();

            if (opts.showOnCreation == true) {
                this.show();
            }


            if (opts.showEvent == opts.hideEvent) {
                this.$target.bind(opts.showEvent + '.tauBubble' , $.proxy(this._onToggleEvent, this));
            } else {
                this.$target.bind(opts.showEvent + '.tauBubble', $.proxy(opts.delay > 0 ? this._onShowEventWithDelay : this._onShowEvent, this));
                this.$target.bind(opts.hideEvent + '.tauBubble', $.proxy(this._onHideEvent, this));
            }
        },
        _onShowEventWithDelay: function(evt){
            var that = this;

            this._clearTimeout();
            this._timeoutToken = setTimeout(function(){that._onShowEvent(evt)}, this.options.delay);
        },

        _clearTimeout: function(){
            if (this._timeoutToken){
                clearTimeout(this._timeoutToken);
            }
        },

        _onShowEvent: function(evt) {

            var $target = $(evt.target);
            if (evt.type == 'click' && ($target.is('a') || $target.parent().is('a'))) return true;

            var self = this;
            this.show();
        },

        _onHideEvent: function(evt) {
            this._clearTimeout();
            this.hide();
        },

        _onToggleEvent: function(evt) {
            if(evt.isPropagationStopped()){
                return;
            }

            var $target = $(evt.target);
            if ($target.is('a') || $target.parent().is('a')) return true;

            evt.stopPropagation();

            this.toggle();
        },


        _initInstance: function(e) {

            var self = this;
            var opts = this.options;

            var $application = this.$target.parents('.i-role-application:first');
            var act = "insertAfter";

            if (!$application.length) {
                $application = $('body');
                act = "appendTo";
            }
            if(opts.appendTo !== 'body') {
                $application = opts.appendTo;
                act = "appendTo";
            }

            this.options.application = this.options.application || $application;

            this.options.within = null;
            var hide = $.proxy(this.hide, this);
            var $popup = $(opts.template);
            if(this.options.showCloseButton){
                 var close = $('<div class="tau-bubble__control-close" role="close"></div>');
                 $popup.append(close);
                 close.click(hide);
            }

            $popup[act]($application);


            this.$popup = $popup;
            var contentElement = this.$popup.addClass(opts.className).find('[role=content]');

            if(opts.content){
                if(opts.content.jquery){
                    contentElement.append(opts.content);
                }
                else{
                    contentElement.html(opts.content);
                }
            }

            self.$arrow = $popup.find('[role=arrow]');


            _bubblesCache[opts.stackName] = _bubblesCache[opts.stackName] || [];
            if (!_.include(_bubblesCache[opts.stackName], self)) {
                _bubblesCache[opts.stackName].push(self);
            }






            $popup.mouseenter(function(e) {
                $popup.data('focus', true);
            });
            $popup.mouseleave(function(e) {
                $popup.data('focus', false);
            });

            if ($application) {
                $application.scroll(function() {
                    hide();
                    self.$target.trigger('externalClose', {});
                });
            }

            this._initInstance = function() {
            };
        },



        _onKeyDown : function(evt){

            if (evt.keyCode != $.ui.keyCode.ESCAPE) {
                return;
            }

            this.$target.trigger('externalClose', {});
            this.hide(evt);
        },


        _signUpForCloseEvents: function(){
            var self = this;

            if (self.options.closeOnEscape && !self._documentKeyDown) {
                self._documentKeyDown = function(ev) {
                    self._onKeyDown(ev);
                };
                $(document).keydown(self._documentKeyDown);
            }

            if (!self._documentClickDelegate) {
                self._documentClickDelegate = function(ev) {
                    self._onDocumentClick(ev);
                };
                $(document).on('mousedown',self._documentClickDelegate);
            }
        },


        widget: function() {
            return this.$popup || $();
        },

        adjustPosition: function() {

            var self = this;
            var $of = self._getAlignTo();
            var $popup = self.$popup;
            var $arrow = self.$arrow;

            var positionConfig = this._getPositionConfig();
            positionConfig = self.options.onPositionConfig(positionConfig) || positionConfig;

            $popup.position(positionConfig);

            var linkPosition = $of[0].getBoundingClientRect();
            var popupPosition = $popup[0].getBoundingClientRect();

            var arrowPositionConfig = {
                within:     self.options.within,
                of:         $of,
                collision:  "fit flip",
                offset:     "0 0"
            };

            var currentOrientation = "top";

            $arrow.attr('data-orientation', 'top');

            if (Math.floor(popupPosition.top) + 1 < Math.floor(linkPosition.top)) {
                currentOrientation = "bottom";
            }


            if (popupPosition.right <= linkPosition.left+1) {
                currentOrientation = "right";

            } else if (Math.floor(popupPosition.left) >= Math.floor(linkPosition.right)) {
                currentOrientation = "left";
            }

            var arrowConf = {
                "top": {
                    my:         "center top",
                    at:         "center bottom"
                },
                "bottom": {
                    my:         "center bottom",
                    at:         "center top"
                },
                "left": {
                    my:         "left center",
                    at:         "right center"
                },
                "right": {
                    my:         "right center",
                    at:         "left center"
                }
            };

            if (popupPosition.width <= linkPosition.width / 1.1) {
                arrowConf['top'] = {
                    my:         "center top",
                    at:         "left bottom",
                    offset:     "20 0"
                };

                arrowConf['bottom'] = {
                    my:         "center bottom",
                    at:         "left top",
                    offset:     "20 0"
                };
            }


            arrowPositionConfig = _.defaults(arrowConf[currentOrientation], arrowPositionConfig);
            $arrow.attr('data-orientation', currentOrientation);


            var c = 'i-orientation_' + $popup.attr('data-orientation');
            $popup.removeClass(c);
            $popup.addClass('i-orientation_' + currentOrientation);
            $popup.attr('data-orientation', currentOrientation);


            arrowPositionConfig = self.options.onArrowPositionConfig(arrowPositionConfig) || arrowPositionConfig;
            $arrow.position(arrowPositionConfig);
        },

        adjustSize: function(){
            var self = this;
            var $popup = this.$popup;

            if (!$popup) return;

            var $w = $('body')[0];

            var windowRect = {
                height: $w.clientHeight,
                width: $w.clientWidth
            };

            var popupRect = $popup[0].getBoundingClientRect();

            var correctRect = {
                height: windowRect.height - popupRect.top,
                width: windowRect.width - popupRect.left
            };

            self.options.onResize($popup, correctRect);
        },

        _getPositionConfig: function(){
            var self = this;
            var $of = self._getAlignTo();

            var opts = this.options;

            var positionConfig = {
                within: opts.within,
                of: $of,
                collision: 'fit flip'
            };



            switch (opts.mode) {
                case 'tooltip':
                    $.extend(positionConfig, {
                        my: "center top",
                        at: "center bottom",
                        offset: "0 0"
                    });
                    break;

                case 'bubble':
                default:
                    $.extend(positionConfig, {
                        my: "left top",
                        at: "left bottom",
                        offset:  "-30 0"
                    });
                    break;

            }

            return positionConfig;
        },

        _onDocumentClick: function(ev) {
            var self = this;

            var $elementClick = $(ev.target);

            var notClose = _.any(this.options.dontCloseSelectors, function(item) {
                if ($elementClick.closest(item).length) {
                    return true
                }
            });
            if (notClose) {
                return false;
            }
            if (!self.$popup.is(":visible")) {
                return;
            }
            if (!self.$popup.is(":visible")) {
                return;
            }

            var $clicked = $elementClick.parents().andSelf();

            if (
                $clicked.is(self.$target)
                    ||
                    $clicked.is(self.$popup)
                ) {
                return;
            }

            if (self._justActivated) {
                self._justActivated = false;
                return;
            }

            self._trigger('hide');
            self.$target.trigger('externalClose', {});
            self.hide();
        },

        _getAlignTo: function(){
            var $a = $(this.options.alignTo);
            return $a && $a.length ? $a : $(this.element);
        },


        activate: function() {
            this._justActivated = true;
            this.show();
        },

        destroy: function() {
            var self = this;
            var opts = self.options;
            var $target = self.$target;

            if (self.$popup) {
                self.hide();
                self.$popup.remove();
                self.$arrow.remove();
            }
            $target.unbind(opts.showEvent + '.tauBubble');
            $target.unbind(opts.hideEvent + '.tauBubble');

            _bubblesCache[opts.stackName] = _.without(_bubblesCache[opts.stackName], self);
        },

        empty: function() {
            var self = this;
            self.hide();
            self.$popup.find('[role=content]').empty();
        },
        /**
         * @inheritDoc
         * @param key
         * @param value
         * @private
         */
        _setOption: function(key, value) {
            if (key == 'content' && this.$popup) {
                this.$popup.find('[role=content]').html(value);
                this.adjustPosition();
                this.adjustSize();
                this.adjustPosition();

            }
            $.Widget.prototype._setOption.call( this, key, value );
        }


    });

})( jQuery, window, document );

});
