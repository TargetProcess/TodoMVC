define(['tau/libs/jquery/jquery.ui'], function(jQuery) {

    /*
         Description:

             Point Scroller.
             Provides API for automatic scrolling of overflowed container based on pointer position.

         Options:

             'disabled' : [Boolean] Widget state.
             'refreshInterval' : [Number] Interval in [ms] to update scroll positions.
             'detectionRatio' : [Number] Scaling ratio of the container inner area that detects pointer and fires autoscrolling.
                 Recommended values are [0 .. 0.25].

         Dependencies:

             jquery.gid
     */

    (function($, namespace, moduleName) {

        var SCROLL_REFRESH_INTERVAL = 50;
        var SCROLL_DETECTION_RATIO = 0.1;



        var isElementOverflown = function($element, dimension) {
            var e = $element[0];
            var isXOverflown, isYOverflown;

            if (dimension == 'x') {
                isXOverflown = e.scrollWidth > e.clientWidth;
            }
            else if (dimension == 'y') {
                isYOverflown = e.scrollHeight > e.clientHeight;
            }

            return (isXOverflown || isYOverflown);
        };

        var getElementClientRect = function($element) {
            var e = $element[0];
            var rect = e.getBoundingClientRect();

            var w = e.clientWidth;
            var h = e.clientHeight;

            var l = rect.left + e.clientLeft;
            var t = rect.top + e.clientTop;
            var r = l + w;
            var b = t + h;

            return {
                left: l,
                top: t,
                right: r,
                bottom: b,
                width: w,
                height: h
            };
        };

        var squeezeRect = function(rect, ratio /* [0..0.25] */) {
            var delta = {
                x: rect.width * ratio,
                y: rect.height * ratio
            };

            rect.left += delta.x;
            rect.right -= delta.x;
            rect.top += delta.y;
            rect.bottom -= delta.y;

            rect.width -= delta.x * 2;
            rect.height -= delta.x * 2;

            return rect;
        };



        var Scroller = function(options) {
            this.__options = options;
        };

        Scroller.prototype = {

            constructor: Scroller,



            __scrollLeft: function($element, offset) {
                $element[0].scrollLeft -= offset;
            },



            __scrollTop: function($element, offset) {
                $element[0].scrollTop -= offset;
            },



            __scrollRight: function($element, offset) {
                $element[0].scrollLeft += offset;
            },



            __scrollDown: function($element, offset) {
                $element[0].scrollTop += offset;
            },



            __scroll: function() {
                var point = this.__options.pointProvider();

                if (point) {
                    var $element = this.__$element;

                    var scrollDetectionRect = squeezeRect(
                        getElementClientRect($element),
                        this.__options.detectionRatio
                    );

                    if (isElementOverflown($element, 'x')) {
                        if (point.x < scrollDetectionRect.left) {
                            this.__scrollLeft($element, scrollDetectionRect.left - point.x);
                        }
                        else if (point.x > scrollDetectionRect.right) {
                            this.__scrollRight($element, point.x - scrollDetectionRect.right);
                        }
                    }

                    if (isElementOverflown($element, 'y')) {
                        if (point.y < scrollDetectionRect.top) {
                            this.__scrollTop($element, scrollDetectionRect.top - point.y);
                        }
                        else if (point.y > scrollDetectionRect.bottom) {
                            this.__scrollDown($element, point.y - scrollDetectionRect.bottom);
                        }
                    }
                }
            },



            on: function($element) {
                if (!this.__intervalId) {
                    this.__$element = $element;
                    this.__intervalId = setInterval($.proxy(this, '__scroll'), this.__options.refreshRate);
                }
            },



            off: function() {
                if (this.__intervalId) {
                    clearInterval(this.__intervalId);
                    this.__intervalId = null;
                    this.__$element = null;
                }
            }

        };



        $.widget(namespace + '.' + moduleName, {

            options: {
                disabled: true,
                refreshInterval: SCROLL_REFRESH_INTERVAL,
                detectionRatio: SCROLL_DETECTION_RATIO
            },



            __setPoint: function(point) {
                this.__point = point;
            },



            __getPoint: function() {
                return this.__point;
            },



            __pointStart: function(evt, point) {
                this.__setPoint(point);
            },



            __pointChange: function(evt, point) {
                this.__setPoint(point);
            },



            __pointEnd: function() {
                this.__setPoint(null);
            },



            __on: function() {
                this.__scroller.on(this.element);
            },



            __off: function() {
                this.__scroller.off();
            },



            _create: function() {
                this.__scroller = new Scroller({
                    refreshRate: this.options.refreshInterval,
                    detectionRatio: this.options.detectionRatio,
                    pointProvider: $.proxy(this, '__getPoint')
                });

                this.__gidObserver = $.gid({
                    dragStart: $.proxy(this, '__pointStart'),
                    drag: $.proxy(this, '__pointChange'),
                    dragEnd: $.proxy(this, '__pointEnd')
                }).on(this.element);

                if (!this.options.disabled) {
                    this.__on();
                }
            },



            _setOption: function(name, value) {
                //$.Widget.prototype._setOption.apply(this, arguments);

                switch (name) {
                    case 'disabled':
                        this[value ? 'disable' : 'enable']();
                        break;
                }

                // TODO: handle other options change
            },



            enable: function() {
                if (this.options.disabled) {
                    this.options.disabled = false;

                    this.__on();
                }
            },



            disable: function() {
                if (!this.options.disabled) {
                    this.options.disabled = true;

                    this.__off();
                }
            },



            destroy: function() {
                this.__scroller.off();
                this.__gidObserver.off();

                this.__scroller = null;
                this.__gidObserver = null;

                $.Widget.prototype.destroy.call(this);
            }

        });

    })(jQuery, 'ui', 'pscroller');

});