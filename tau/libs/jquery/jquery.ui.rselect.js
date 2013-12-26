define(['tau/libs/jquery/jquery.ui'], function(jQuery) {

    /*
         Description:

             Rect Selecion.
             Provides API for creating rectangular selections on elements with graphic input devices.

         Options:

             'disabled' : [Boolean] Widget state.
             'trigger' : [String] CSS-selector of descendant elements (with direct binding) that can start rect selection.
                 If omitted the current widget element (with delegated binding) will start rect selection.
             'selectable' : [String] CSS-selector of descendant elements which can be selected/deselected.
             'selectionClass' : [String] Class to add/remove to/from selected/deselected elements.

         Events:

             'rs-start' : Triggered on current widget element when selection starts. Callback receives arguments:
                 'evt' : [Object] Event object.
                 'data' : [Object] Data hash.
                     {
                         selection : [jQuery] A collection with selected elements before current selection.
                     }
             'rs-end' : Triggered on current widget element when selection ends. Callback receives arguments:
                 'evt' : [Object] Event object.
                 'data' : [Object] Data hash.
                     {
                         selection : [jQuery] A collection with selected elements after current selection.
                         deselection : [jQuery] A collection with deselected elements after current selection.
                     }
             'rs-select' : Triggered on elements which were selected.
             'rs-deselect' : Triggered on elements which were deselected.
     */

    (function($, namespace, moduleName) {

        var DEFAULT_SELECTION_CLASS = 'r-selected';
        var SELECTION_AREA_CLASSNAME = 'rs-area';
        var SELECTION_HOLDER_CLASSNAME = 'rs-holder';
        var DRAG_INIT_RADIUS = 10;
        var SELECTABLE_SPLITTER = '>>';
        var EVENT_PREFIX = 'rs-';



        var InputObserver = function(options) {
            this.__options = options;

            this.__gidObserver = $.gid({
                dragStart: $.proxy(this, '__onDragStart'),
                drag: $.proxy(this, '__onDrag'),
                dragEnd: $.proxy(this, '__onDragEnd')
            });
        };

        InputObserver.prototype = {

            constructor: InputObserver,



            __eventToKeyDescriptor: function(evt) {
                var keyDescriptor = {
                    shift: evt.shiftKey,
                    ctrl: evt.ctrlKey,
                    meta: evt.metaKey,
                    alt: evt.altKey,
                    space: this.__keyDescriptor ? this.__keyDescriptor.space : false
                };

                if (evt.which == 32) {
                    switch (evt.type) {
                        case 'keydown':
                            keyDescriptor.space = true;
                            break;
                        case 'keyup':
                            keyDescriptor.space = false;
                            break;
                    }
                }

                return keyDescriptor;
            },



            __areKeyDescriptorsEqual: function(keyDescriptorA, keyDescriptorB) {
                var equal = true;

                for (var key in keyDescriptorA) {
                    if (keyDescriptorA[key] != keyDescriptorB[key]) {
                        equal = false;
                        break;
                    }
                }

                return equal;
            },



            __anyActiveKeys: function(keyDescriptor) {
                var activeKeys = false;

                for (var key in keyDescriptor) {
                    if (keyDescriptor[key]) {
                        activeKeys = true;
                        break;
                    }
                }

                return activeKeys;
            },



            __updateMode: function() {
                var keyDescriptor = this.__keyDescriptor;

                var rectMode = 'resize';

                if (keyDescriptor.space) {
                    rectMode = 'move';
                }

                var addKeyActive = keyDescriptor.shift || keyDescriptor.ctrl || keyDescriptor.meta;
                var subtractKeyActive = keyDescriptor.alt;

                var selectionMode = 'new';

                if (addKeyActive && !subtractKeyActive) {
                    selectionMode = 'add';
                }
                else if (subtractKeyActive && !addKeyActive) {
                    selectionMode = 'subtract';
                }
                else if (addKeyActive && subtractKeyActive) {
                    selectionMode = 'intersect';
                }

                this.__options.modeChange({
                    rect: rectMode,
                    selection: selectionMode
                });
            },



            __startSelection: function() {
                this.__options.selectionStart(this.__basePoint);
            },



            __showSelection: function() {
                this.__options.selectionShow(this.__basePoint, this.__guidePoint);
            },



            __updateSelection: function() {

                this.__options.selectionChange(this.__guidePoint);
            },



            __endSelection: function() {
                this.__options.selectionEnd(this.__guidePoint);
            },



            __bindKeyCapture: function() {
                $(window).on('keydown keyup', $.proxy(this, '__onKeyChange'));
            },



            __unbindKeyCapture: function() {
                $(window).off('keydown keyup', this.__onKeyChange);
            },



            __finalizeKeyCapture: function(evt) {
                if (!this.__anyActiveKeys(this.__keyDescriptor)) {
                    this.__unbindKeyCapture();
                    this.__unbindKeyCaptureFinalizer();
                }
            },



            __bindKeyCaptureFinalizer: function() {
                $(window).on('keyup', $.proxy(this, '__finalizeKeyCapture'));
            },



            __unbindKeyCaptureFinalizer: function() {
                $(window).off('keyup', this.__finalizeKeyCapture);
            },



            __onDragStart: function(evt, pointer) {
                this.__basePoint = pointer;

                this.__startSelection();

                this.__keyDescriptor = this.__eventToKeyDescriptor(evt);

                this.__bindKeyCapture();

                this.__updateMode();
            },



            __onDrag: function(evt, pointer) {

                if (!this.__$elements) {
                    return;
                }

                this.__guidePoint = pointer;

                if (!this.__dragInitialized) {
                    var dragXDelta = Math.abs(this.__guidePoint.x - this.__basePoint.x);
                    var dragYDelta = Math.abs(this.__guidePoint.y - this.__basePoint.y);

                    if ((dragXDelta > DRAG_INIT_RADIUS) && (dragYDelta > DRAG_INIT_RADIUS)) {
                        this.__dragInitialized = true;

                        this.__showSelection();

                        this.__$elements.on('scroll', $.proxy(this, '__updateSelection'));
                    }
                }
                else {
                    this.__updateSelection();
                }
            },



            __onDragEnd: function(evt, pointer) {
                this.__guidePoint = pointer;

                if (this.__dragInitialized) {
                    this.__dragInitialized = false;

                    this.__$elements.off('scroll', this.__updateSelection);
                }

                if (this.__anyActiveKeys(this.__keyDescriptor)) {
                    this.__bindKeyCaptureFinalizer();
                }
                else {
                    this.__unbindKeyCapture();
                }

                this.__endSelection();
            },



            __onKeyChange: function(evt) {
                evt.preventDefault();

                var newKeyDescriptor = this.__eventToKeyDescriptor(evt);

                if (!this.__areKeyDescriptorsEqual(this.__keyDescriptor, newKeyDescriptor)) {
                    this.__keyDescriptor = newKeyDescriptor;
                    this.__updateMode();
                }
            },



            on: function($elements, trigger) {
                this.__$elements = $elements;
                this.__gidObserver.on($elements, trigger, trigger ? true : false);
            },



            off: function() {
                this.__gidObserver.off();
                this.__$elements = null;
            }

        };



        var SelectionRect = function($placeholder) {
            this.__$placeholder = $placeholder;
            this.__mode = 'resize';
        };

        SelectionRect.prototype = {

            constructor: SelectionRect,



            __createElement: function() {
                var $element = $('<div/>').addClass(SELECTION_AREA_CLASSNAME);

                // IE fix to init element dimension
                getComputedStyle($element[0]);

                return $element;
            },



            __getElement: function() {
                if (!this.__$element) {
                    this.__$element = this.__createElement();
                }

                return this.__$element;
            },



            __toPlaceholderPoint: function(viewportPoint) {
                var placeholder = this.__$placeholder[0];
                var placeholderRect = placeholder.getBoundingClientRect();

                return {
                    x: viewportPoint.x - (placeholderRect.left + placeholder.clientLeft) + placeholder.scrollLeft,
                    y: viewportPoint.y - (placeholderRect.top + placeholder.clientTop) + placeholder.scrollTop
                };
            },



            __clipValue: function(value, min, max) {
                var v = value;

                if (v < min) {
                    v = min;
                }
                else if (v > max) {
                    v = max;
                }

                return v;
            },



            __clipRect: function(rect) {
                var placeholder = this.__$placeholder[0];

                var phWidth = placeholder.scrollWidth;
                var phHeight = placeholder.scrollHeight;

                var left = this.__clipValue(rect.left, 0, phWidth);
                var right = this.__clipValue(rect.left + rect.width, 0, phWidth);

                var top = this.__clipValue(rect.top, 0, phHeight);
                var bottom = this.__clipValue(rect.top + rect.height, 0, phHeight);

                return {
                    left: left,
                    top: top,
                    width: right - left,
                    height: bottom - top
                };
            },



            __drawRect: function(rect) {
                this.__getElement()
                    .css(this.__clipRect(rect));
            },



            __updateDimensions: function(guidePoint) {
                var rect = this.__rect;
                var basePoint = this.__basePoint;

                rect.left = Math.min(basePoint.x, guidePoint.x);
                rect.top = Math.min(basePoint.y, guidePoint.y);

                rect.width = Math.abs(guidePoint.x - basePoint.x);
                rect.height = Math.abs(guidePoint.y - basePoint.y);

                this.__drawRect(rect);
            },



            __updatePosition: function(guidePoint) {
                var currentGuidePoint = this.__guidePoint;

                var dx = guidePoint.x - currentGuidePoint.x;
                var dy = guidePoint.y - currentGuidePoint.y;

                var basePoint = this.__basePoint;

                basePoint.x += dx;
                basePoint.y += dy;

                var rect = this.__rect;

                rect.left += dx;
                rect.top += dy;

                this.__drawRect(this.__rect);
            },



            show: function(basePoint, guidePoint) {
                this.__basePoint = this.__toPlaceholderPoint(basePoint);

                this.__rect = {};

                this.__updateDimensions(this.__guidePoint = this.__toPlaceholderPoint(guidePoint));

                this.__$placeholder
                    .addClass(SELECTION_HOLDER_CLASSNAME)
                    .append(this.__getElement());
            },



            hide: function() {
                this.__getElement().detach();

                this.__$placeholder
                    .removeClass(SELECTION_HOLDER_CLASSNAME);
            },



            update: function(guidePoint) {
                var phGuidePoint = this.__toPlaceholderPoint(guidePoint);

                switch (this.__mode) {
                    case 'resize':
                        this.__updateDimensions(phGuidePoint);
                        break;
                    case 'move':
                        this.__updatePosition(phGuidePoint);
                        break;
                }

                this.__guidePoint = phGuidePoint;
            },



            setMode: function(mode) {
                this.__mode = mode;
            },



            get: function() {
                return this.__getElement()[0].getBoundingClientRect();
            }

        };



        var selector = {

            __isIntersect: function(rectA, rectB) {
                var xIntersect = (rectA.right >= rectB.left) && (rectA.left <= rectB.right);
                var yIntersect = (rectA.bottom >= rectB.top) && (rectA.top <= rectB.bottom);

                return (xIntersect && yIntersect);
            },



            getRectSelection: function(selectionRect, $context, selectable) {
                var $selection = $();

                // selection rect has dimensions
                if ((selectionRect.width > 0) && (selectionRect.height > 0)) {
                    var selectableStack = selectable.split(SELECTABLE_SPLITTER).reverse();
                    var self = this;

                    $selection = $context;

                    while (selectableStack.length > 0) {
                        $selection = $selection
                            .find(selectableStack.pop())
                            .filter(function() {
                                return self.__isIntersect(selectionRect, this.getBoundingClientRect());
                            });
                    }
                }

                return $selection;
            },



            __getNewSelection: function($oldSelection, $newSelection) {
                return $newSelection;
            },



            __getUnionSelection: function($oldSelection, $newSelection) {
                return $oldSelection.add($newSelection);
            },



            __getSubtractSelection: function($oldSelection, $newSelection) {
                return $oldSelection.not($newSelection);
            },



            __getIntersectSelection: function($oldSelection, $newSelection) {
                return $oldSelection.add($newSelection).filter(function() {
                    return ($oldSelection.is(this) && ($newSelection.is(this)));
                });
            },



            getActualSelection: function($oldSelection, $newSelection, mode) {
                switch (mode) {
                    case 'add':
                        return this.__getUnionSelection($oldSelection, $newSelection);
                    case 'subtract':
                        return this.__getSubtractSelection($oldSelection, $newSelection);
                    case 'intersect':
                        return this.__getIntersectSelection($oldSelection, $newSelection);
                    case 'new':
                    default:
                        return this.__getNewSelection($oldSelection, $newSelection);
                }
            }

        };



        $.widget(namespace + '.' + moduleName, {

            options: {
                disabled: false,
                trigger: '',
                selectable: '',
                selectionClass: DEFAULT_SELECTION_CLASS,
                start: $.noop,
                show: $.noop,
                end: $.noop
            },



            __on: function() {
                this.__inputObserver.on(this.element, this.options.trigger);
            },



            __off: function() {
                this.__inputObserver.off();
            },



            __onSelectionStart: function() {
                if (!this.__isSelectionActive) {
                    this.__isSelectionActive = true;

                    // cache old selection
                    var selectable = $.trim(this.options.selectable.replace(SELECTABLE_SPLITTER, ''));
                    this.__$oldSelection = this.element.find(selectable + '.' + this.options.selectionClass);

                    // callback
                    this._trigger('start', null, {
                        selection: this.__$oldSelection
                    });
                }
            },



            __onSelectionShow: function(basePoint, guidePoint) {
                if (!this.__selectionRect) {
                    return;
                }
                // draw rect
                this.__selectionRect.show(basePoint, guidePoint);

                // callback
                this._trigger('show');
            },



            __onSelectionChange: function(guidePoint) {
                if (!this.__selectionRect) {
                    return;
                }

                this.__selectionRect.update(guidePoint);
            },

            __onSelectionEnd: function() {
                if (this.__isSelectionActive) {
                    this.__isSelectionActive = false;

                    if (!this.__selectionRect) {
                        return;
                    }
                    // get selection rect
                    var selectionRect = this.__selectionRect.get();

                    // hide rect
                    this.__selectionRect.hide();

                    // get new selection
                    var $newSelection = selector.getRectSelection(selectionRect, this.element, this.options.selectable);

                    // compute actual selection
                    var $actualSelection = selector.getActualSelection(this.__$oldSelection, $newSelection, this.__selectionMode);

                    // clear obsolete selection
                    var $deselection = this.__$oldSelection.not($actualSelection);

                    $deselection
                        .removeClass(this.options.selectionClass)
                        .trigger(EVENT_PREFIX + 'deselect');

                    // mark actual selection
                    $actualSelection
                        .addClass(this.options.selectionClass)
                        .trigger(EVENT_PREFIX + 'select');

                    // clear old selection cache
                    this.__$oldSelection = null;

                    // callback
                    this._trigger('end', null, {
                        selection: $actualSelection,
                        deselection: $deselection
                    });
                }
            },



            __onModeChange: function(mode) {
                this.__selectionMode = mode.selection;
                this.__selectionRect.setMode(mode.rect);
            },



            _create: function() {
                this.widgetEventPrefix = EVENT_PREFIX;

                this.__inputObserver = new InputObserver({
                    selectionStart: $.proxy(this, '__onSelectionStart'),
                    selectionShow: $.proxy(this, '__onSelectionShow'),
                    selectionChange: $.proxy(this, '__onSelectionChange'),
                    selectionEnd: $.proxy(this, '__onSelectionEnd'),
                    modeChange: $.proxy(this, '__onModeChange')
                });

                this.__selectionRect = new SelectionRect(this.element);

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
                this.__selectionRect.hide();
                this.__inputObserver.off();

                this.__selectionRect = null;
                this.__inputObserver = null;

                $.Widget.prototype.destroy.call(this);
            }

        });

    })(jQuery, 'ui', 'rselect');

});