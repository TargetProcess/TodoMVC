define(["tau/libs/jquery/jquery.ui"], function(jQuery) {

(function( $, undefined ) {



$.widget("ui.tauSortable", {

    widgetEventPrefix: "tausortable",
    //active: false,

    options: {
        groups: '',
        items: '> *',


        helper: function(){
            var $h = $(this).clone().removeAttr('id').wrap('<div class="tau-sortable__helper" />').parent();
            return $h;
        },

        distance: 50,

        scroll: true,
        zIndex: 9999,
        scrollSensitivity:  100,
        cursor:             'move',


        draggedClassName: 'tau-sortable__placeholder',
        processToGroup: null,

        useSelectable: false
    },
    dndOptions: {},

    _create: function() {

        var o = this.options;

        var dndOptions = {};

        $.extend(true, dndOptions, this.options);

        this.dndOptions = dndOptions;

        var self = this;

        self.interval = function(){};

        var $selectable = false;

        if (o.useSelectable) {
            $selectable = $(o.useSelectable);
        }

        var globals =  $.ui.tauSelectable;

        dndOptions.start = function(event, ui){

            globals.active = true;

            var $dragged        =  $(event.target);
            self.currentGroup   = $dragged.parents(o.groups).first();
            var handler         = _.bind(self._updateLocation, self, $dragged, ui);

            self.interval = _.throttle(handler, 100);

            ui.group    = self.currentGroup;
            ui.item     = event.target;
            ui.sender   = self.element;

            if (ui && ui.helper){
                $.data(ui.helper, 'helper', true);
            }

            $dragged.addClass(o.draggedClassName);


            var $all = $dragged;

            if ($selectable) {

                var $selected = $selectable.tauSelectable('getSelected');
                var $rest = $selected.not($dragged).not(':data(helper)');
                $rest.hide();

                $all = $all.add($rest);
            }

            self._applyDndData($all, 'source');

            if ($all.length > 1 && ui && ui.helper) {
                ui.helper.addClass('tau-sortable__helper_multiple_true');
                ui.helper.children().attr('data-batch_count', _.asString($all.length));
            }

            ui.items = $all;

            self._trigger("start", event, ui);

        };

        dndOptions.drag = function(event, ui){

            self._updatePosition(event, ui);
            self.interval();
        };


        dndOptions.stop = function(event, ui){

            var $dragged        =  $(event.target);

            ui.item     = event.target;
            ui.sender   = self.element;

            self._updatePosition(event, ui);
            self._updateLocation($dragged, ui);

            ui.group    = self.currentGroup;

            $dragged.removeClass(o.draggedClassName);

            var $all = $dragged;

            if ($selectable) {

                var $selected = $selectable.tauSelectable('getSelected');
                var $rest = $selected.not($dragged);

                $all = $all.add($rest);

                if (ui && ui.helper){
                    ui.helper.removeClass('tau-sortable__helper_multiple_true');
                    ui.helper.children().removeAttr('data-batch_count');
                }

                var i = 0;

                $dragged.show();

                var _applyDndData = _.bind(self._applyDndData, self);

                _applyDndData($dragged, 'target');
                _applyDndData($dragged, 'order', i++);


                var $lastDragged = $dragged;

                $rest.each(function(){

                    var $card = $(this);

                    $card.insertAfter($lastDragged);
                    $lastDragged = $card;

                    $card.show();

                    _applyDndData($card, 'target');
                    _applyDndData($card, 'order', i++);

                });
            }

            ui.items = $all;

            self._trigger("stop", event, ui);
            self._triggerToConnected("stop", event, ui);
            globals.active = false;

        };


        var $el = this.element;

        $el.addClass('tau-sortable');

        if (jQuery.type(o.items) === 'string') {
            $el.delegate(o.items, 'mouseenter.tausortable', function(){
                if (!globals.active) {
                    $(this)
                            .draggable(self.dndOptions)
                    ;
                }
            });
        } else {
            $(o.items).bind('mouseenter.tausortable', function(){
                if (!globals.active) {
                    $(this)
                            .draggable(self.dndOptions)
                    ;
                }
            });
        }
    },

    _within: function($el, pos) {

        /*
        var offset = $el.offset();

        var rect = {
            top:        Math.round(offset.top)-5,
            left:       Math.round(offset.left)-5,
            bottom:     Math.round(offset.top + $el.outerHeight(true)) + 5,
            right:      Math.round(offset.left + $el.outerWidth(true)) + 5

        };

        */
        var el = $el[0];

        var r = el.getBoundingClientRect();
        var rect = {};
        var c = getComputedStyle(el);

        rect.left   = r.left    - (Math.round(parseFloat(c.marginLeft)) + 5);
        rect.right  = r.right   + (Math.round(parseFloat(c.marginRight)) + 5);
        rect.top    = r.top     - (Math.round(parseFloat(c.marginTop)) + 5);
        rect.bottom = r.bottom  + (Math.round(parseFloat(c.marginBottom)) + 5);



        return (pos.x >= rect.left && pos.x <= rect.right) && (pos.y <= rect.bottom && pos.y >= rect.top);
    },

    _processToGroup: function($dragged, $fromGroup, $toGroup){
        var $ch = $toGroup.children();

        if (this.options.processToGroup) {
            this.options.processToGroup.call(this, $dragged, $fromGroup, $toGroup);
        } else {

            if ($ch.length) {
                $ch.eq(0).append($dragged)
            } else {
                $toGroup.append($dragged);
            }

        }


    },


    _updateCurrentGroup: function($dragged, ui){

        var $currentGroup = this.currentGroup;

        if (!this._within($currentGroup, this.cursorPosition)) {

            var $newGroup = this._findNewGroup();

            if ($newGroup.length) {

                var nUi = $.extend(ui, {
                    group:  $currentGroup
                });

                this._trigger('groupleft', null, nUi);

                this._triggerToConnected('groupleft', null, nUi);

                this._processToGroup($dragged, $currentGroup, $newGroup);
                this.currentGroup = $newGroup;

                nUi = $.extend(ui, {
                    group:  $newGroup
                });


                this._trigger('groupentered', null, nUi);
                this._triggerToConnected('groupentered', null, nUi);




                this._trigger('groupchanged', null, {
                    item:       $dragged,
                    groupFrom:  $currentGroup,
                    groupTo:    $newGroup
                });

                this._triggerToConnected('groupchanged', null, {
                    item:       $dragged,
                    groupFrom:  $currentGroup,
                    groupTo:    $newGroup
                });

            }
        }
    },

    _updateLocation: function($el, ui){

        this._updateCurrentGroup($el, ui);
        this._updateSorting($el, ui);
    },



    _updateSorting: function($dragged, ui) {

        var $item = this._findNewItem($dragged);

        if ($item.length > 0) {
            if ($dragged.index() < $item.index()) {
                $dragged.insertAfter($item);
            } else {
                $dragged.insertBefore($item);
            }

            this._trigger('changed', null, ui);

            this._triggerToConnected('changed', null, ui);


        } else {
            if (!this._within($dragged, this.cursorPosition)) {
                this._processToGroup($dragged, this.currentGroup, this.currentGroup);

                this._trigger('changed', null, ui);

                this._triggerToConnected('changed', null, ui);

            }
        }
    },

    _updatePosition: function(evt, ui){
        this.cursorPosition = {
            x: evt.pageX,
            y: evt.pageY
        };
    },

    _findNewGroup: function(){

        var $groups = $(this.options.groups);
        var pos = this.cursorPosition;

        var $group = $();

        for (var i=0,n=$groups.length; i<n; i++) {

            if (this._within($groups.eq(i), pos)) {
                $group = $groups.eq(i);
                break;
            }
        }

        return $group;
    },


    _findNewItem: function($dragged){

        var $items = this.currentGroup.find(this.options.items)
                .not($dragged)
                ;
        var pos = this.cursorPosition;

        var $item = $();

        for (var i=0,n=$items.length; i<n; i++) {

            if (this._within($items.eq(i), pos)) {
                $item = $items.eq(i);
                break;
            }
        }

        return $item;
    },


    _applyDndData: function($cards, name, val){

        $cards.each(function(){

            var $card = $(this);

            var data = _.defaults($card.data('boardDnd') || {}, {
                uid:    _.uniqueId('boardDnd'),
                source: {},
                target: {},
                order:  null
            });

            if (name == 'source' || name == 'target') {

                var $parentCell = $card.parent();
                var $prevCard = $card.prev();
                var $nextCard = $card.next();


                var cd = $card.data();
                data[name] = {

                    index: $card.index(),

                    cellElementId: $parentCell.attr('id'),

                    x: $parentCell.data('x') || null,
                    y: $parentCell.data('y') || null,

                    sliceId: cd.id,
                    entityType: cd.entityType,

                    entityId: cd.id,
                    elementId: $card.attr('id'),

                    beforeEntityId: $prevCard.data('id'),
                    beforeElementId: $prevCard.attr('id'),

                    afterEntityId:  $nextCard.data('id'),
                    afterElementId: $nextCard.attr('id')
                };

            } else {
                data[name] = val;
            }

            $card.data('boardDnd', data);

        });
    },

    _resetDndData: function($cards){

        $cards.each(function(){

            var $card = $(this);

            var data = _.defaults({}, {
                uid:    _.uniqueId('boardDnd'),
                source: {},
                target: {},
                order:  null
            });

             $card.data('boardDnd', data);

        });
    },

    _triggerToConnected: function(){

        var o = this.options;
        var $el = this.element

        if (o.connectedSortable) {
            var $otherSortable = this.currentGroup.parents(':data(tauSortable)');
            if ($otherSortable.is($el) == false) {
                var d = $otherSortable.data('tauSortable');
                d._trigger.apply(d, _.toArray(arguments));
            }
        }
    },


    destroy: function() {

        var o = this.options;
        var $items;
        if (jQuery.type(o.items) === 'string') {
            $items = this.element.find(o.items +':data(draggable)');
            this.element.undelegate(o.items, 'mouseenter.tausortable');

        } else {
            $items = $(o.items).filter(':data(draggable)');
            $(o.items).unbind('mouseenter.tausortable');
        }

        $items.draggable('destroy');

        $.Widget.prototype.destroy.call(this);
    }


});

$.extend($.ui.tauSelectable, {
	active: false
});

}(jQuery));

});
