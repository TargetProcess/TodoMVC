define(['tau/libs/jquery/jquery'], function(jQuery) {
    if (!Object.create) return;
    /*
         Description:

             Graphic Input Device observer.
             Provides API to abstract from mouse and touch devices.

         Parameters:

             <options> : [Object] Options hash.
                 options.dragStart : [Function] Event callback.
                 options.drag : [Function] Event callback.
                 options.dragEnd : [Function] Event callback.

             All event callbacks take arguments:
                 evt : [Object] Event object.
                 pointer : [Object] Pointer coordinates in viewport:
                     pointer.x : Number
                     pointer.y : Number

         Returns:

             [Object] GID-observer object instance:
                 {
                     on($elements, delegateSelector, isDirect) : Enables listening for device events on specified elements.
                     off() : Disables listening for device events.
                 }
     */

    (function($, moduleName) {

        if (moduleName in $) {
            throw new Error('The "' + moduleName + '" module is already defined.');
        }



        var gidDetector = {
            mouse: ('onmousedown' in document),
            touch: ('ontouchstart' in document)
        };



        var GIDObserver = function(options) {
            this.__setOptions(options);
        };

        GIDObserver.prototype = {

            constructor: GIDObserver,



            __setOptions: function(options) {
                var _options = $.isPlainObject(options) ? options : {};

                this.__options = {
                    dragStart: $.isFunction(_options.dragStart) ? _options.dragStart : $.noop,
                    drag: $.isFunction(_options.drag) ? _options.drag : $.noop,
                    dragEnd: $.isFunction(_options.dragEnd) ? _options.dragEnd : $.noop
                };
            },



            _getOptions: function() {
                return this.__options;
            },



            _isPointerInClientArea: function(pointer, element) {
                var boundingRect = element.getBoundingClientRect();

                var areaLeft = boundingRect.left + element.clientLeft;
                var areaTop = boundingRect.top + element.clientTop;
                var areaRight = areaLeft + element.clientWidth;
                var areaBottom = areaTop + element.clientHeight;

                var inX = (pointer.x >= areaLeft) && (pointer.x <= areaRight);
                var inY = (pointer.y >= areaTop) && (pointer.y <= areaBottom);

                return (inX && inY);
            },



            _bind: function(eventName, handler) {
                this.__$elements.on(eventName, this.__delegateSelector, handler);
            },



            _unbind: function(eventName, handler) {
                this.__$elements.off(eventName, this.__delegateSelector, handler);
            },



            _isValidEvent: function(evt) {
                return (this.__isDirect ? (evt.currentTarget == evt.target) : true);
            },



            _bindDragEventHandler: function() {
                // abstract method
            },



            _unbindDragEventHandler: function() {
                // abstract method
            },



            __bindEventHandlers: function() {
                this._bindDragEventHandler();
            },



            __unbindEventHandlers: function() {
                this._unbindDragEventHandler();
            },



            on: function($elements, delegateSelector, isDirect) {
                if (!this.__enabled) {
                    this.__enabled = true;

                    this.__delegateSelector = delegateSelector;
                    this.__isDirect = isDirect;
                    this.__$elements = $elements;

                    this.__bindEventHandlers();
                }

                return this;
            },



            off: function() {
                if (this.__enabled) {
                    this.__enabled = false;

                    this.__unbindEventHandlers();

                    this.__$elements = null;
                }

                return this;
            }

        };



        if (gidDetector.mouse) {

            var MouseObserver = function(options) {
                GIDObserver.call(this, options);
            };

            MouseObserver.prototype = $.extend(Object.create(GIDObserver.prototype), {

                constructor: MouseObserver,



                __onDragStart: function(evt) {
                    if (this._isValidEvent(evt)) {
                        var pointer = {
                            x: evt.clientX,
                            y: evt.clientY
                        };

                        if (this._isPointerInClientArea(pointer, evt.target)) {

                            $('body').addClass('textSelectionDisabled');

                            //Don't prevent events in this way... it brokes functionality
                            //evt.preventDefault();

                            if ($.browser.msie) {
                                $('input:focus').blur();
                                //TODO: remove if in future for 10+
                                evt.preventDefault();
                            }

                            this._getOptions().dragStart(evt, pointer);

                            $(window).on({
                                'mousemove': $.proxy(this, '__onDrag'),
                                'mouseup': $.proxy(this, '__onDragEnd')
                            });
                        }
                    }
                },



                __onDrag: function(evt) {
                    evt.preventDefault();

                    this._getOptions().drag(evt, {
                        x: evt.clientX,
                        y: evt.clientY
                    });
                },



                __onDragEnd: function(evt) {
                    evt.preventDefault();
                    $('body').removeClass('textSelectionDisabled');

                    this._getOptions().dragEnd(evt, {
                        x: evt.clientX,
                        y: evt.clientY
                    });

                    $(window).off({
                        'mousemove': this.__onDrag,
                        'mouseup': this.__onDragEnd
                    });
                },



                _bindDragEventHandler: function() {
                    this._bind('mousedown', $.proxy(this, '__onDragStart'));
                },



                _unbindDragEventHandler: function() {
                    this._unbind('mousedown', this.__onDragStart);
                }

            });

        }



        if (gidDetector.touch) {

            var TouchObserver = function(options) {
                GIDObserver.call(this, options);
            };

            TouchObserver.prototype = $.extend(Object.create(GIDObserver.prototype), {

                constructor: TouchObserver,



                __onDragStart: function(evt) {
                    if (this._isValidEvent(evt)) {
                        var allTouches = evt.originalEvent.touches;

                        if (allTouches.length == 1) {
                            var theTouch = allTouches[0];

                            var pointer = {
                                x: theTouch.clientX,
                                y: theTouch.clientY
                            };

                            if (this._isPointerInClientArea(pointer, evt.target)) {
                                evt.preventDefault();

                                this.__touchId = theTouch.identifier;

                                this._getOptions().dragStart(evt, pointer);

                                $(window).on({
                                    'touchmove': $.proxy(this, '__onDrag'),
                                    'touchend': $.proxy(this, '__onDragEnd')
                                });
                            }
                        }
                    }
                },



                __onDrag: function(evt) {
                    var theTouch = evt.originalEvent.changedTouches[0];

                    if (theTouch.identifier == this.__touchId) {
                        evt.preventDefault();

                        this._getOptions().drag(evt, {
                            x: theTouch.clientX,
                            y: theTouch.clientY
                        });
                    }
                },



                __onDragEnd: function(evt) {
                    var theTouch = evt.originalEvent.changedTouches[0];

                    if (theTouch.identifier == this.__touchId) {
                        evt.preventDefault();

                        this._getOptions().dragEnd(evt, {
                            x: theTouch.clientX,
                            y: theTouch.clientY
                        });

                        $(window).off({
                            'touchmove': this.__onDrag,
                            'touchend': this.__onDragEnd
                        });
                    }
                },



                _bindDragEventHandler: function() {
                    this._bind('touchstart', $.proxy(this, '__onDragStart'));
                },



                _unbindDragEventHandler: function() {
                    this._unbind('touchstart', this.__onDragStart);
                }

            });

        }



        var gidObserverFactory = {

            create: function(options) {
                var gidObserver = null;

                if (gidDetector.touch) {
                    gidObserver =  new TouchObserver(options);
                }
                else if (gidDetector.mouse) {
                    gidObserver = new MouseObserver(options);
                }

                return gidObserver;
            }

        };



        $[moduleName] = function(options) {
            return gidObserverFactory.create(options);
        };

    })(jQuery, 'gid');

});
