define(["tau/libs/jquery/jquery.ui"], function(jQuery) {


(function( $, undefined ) {

$.widget("ui.tauSelectable", {

    widgetEventPrefix: "tauselectable",

    options: {
        items: "> *",
        triggerSelector: null,
        className: 'i-selected_true',
        dataName: 'tauselectable',
        ctrl:       false,
        forceSelection: false,
        selectOnMouseup: false,
        fireEvents: true
    },

    _create: function() {

        var o = this.options;

        var $el = this.element;
        var self = this;

        var map = {};

        if (o.ctrl) {


            var isCtrl = function(evt){
                return evt.ctrlKey || evt.metaKey;
            };

            // select-unselect on mousedown with ctrl, unselect all and select current on mouseup without ctrl
            map.mousedown = $.proxy(function(evt, item){

                var ctrl = isCtrl(evt);
                var isSelected = this._getData(item, 'selected');
                var $selected = this.getSelected();
                var $otherSelected = $selected.not(item);

                var alreadySelected = $selected.length;
                var isOnlySelected = isSelected && (alreadySelected == 1);

                this._setData(item, 'nextReset', false);

                if (ctrl) {
                    if (!(o.forceSelection && isOnlySelected)) {
                        this._toggle(item);
                    }
                } else {

                    if ($otherSelected.length) {

                        if (isSelected) {
                            this._setData(item, 'nextReset', true);
                        } else {
                            this.reset($otherSelected);
                            this._set(0, item);
                        }

                    } else {
                        if (o.forceSelection) {
                            this._set(0, item);
                        } else {
                            this._toggle(item);
                        }
                    }
                }
            }, this);

            map.mouseup = $.proxy(function(evt, item){

                var $selected = this.getSelected();
                var $otherSelected = $selected.not(item);

                if (this._getData(item, 'nextReset')) {
                    this.reset($otherSelected);
                    this._set(0, item);
                } else {
                    if (o.selectOnMouseup) {
                        var isSelected = !!this._getData(item, 'selected');

                        if (isSelected) {
                            this.raiseChanged($selected, isSelected, true);
                        }
                    }
                }

                this._setData(item, 'nextReset', false);
            }, this);

        } else {

            // select on mousedown if not selected, unselect on mouseup if was selected before prev mousedown
            map.mousedown = $.proxy(function(evt, item){

                if (this._getData(item, 'selected')){
                    this._setData(item, 'nextReset', true);
                } else {
                    this._toggle(item);
                }
            }, this);



            map.mouseup = $.proxy(function(evt, item){


                if (this._getData(item, 'selected') && this._getData(item, 'nextReset')) {
                    this._reset(0, item);
                    this._setData(item, 'nextReset', false);
                }

            }, this);
        }

        $el.delegate(o.items, 'mousedown', function(evt){

            if (o.triggerSelector && !$(evt.target).is(o.triggerSelector)) return;
            map.mousedown(evt, this);
        });

        $el.delegate(o.items, 'mouseup', function(evt){

            if (o.triggerSelector && !$(evt.target).is(o.triggerSelector)) return;
            map.mouseup(evt, this);
        });



    },


    getSelected: function(){

        var o = this.options;
        return this.element.find(':data(' + o.dataName + ')').filter(function(evt){
            return $.data(this, o.dataName).selected;
        });
    },

    select: function(cb){
        var o = this.options;
        var $el = this.element.find(o.items);

        $el = $el.filter(cb);

        if ($el.length) {
            $el.each($.proxy(this._set, this));
        }
    },


    unselect: function(cb){
        var o = this.options;
        var $el = this.element.find(o.items).filter(cb);

        if ($el.length) {
            $el.each($.proxy(this._reset, this));
        }
    },

    reset: function($cards, $except){
        $except = $except || $();
        var o = this.options;

        var ce = o.fireEvents;
        o.fireEvents = false;

        var $toReset = $();
        if ($cards) {
            $toReset = $cards.not($except);
        } else {
            $toReset = this.element.find(o.items).not($except);
        }

        $toReset.each($.proxy(this._reset, this));
        o.fireEvents = ce;

        if (o.fireEvents){
            this.raiseChanged($toReset, false);
        }
    },


    raiseChanged: function($item, isSelected, mouseUp) {
        mouseUp = mouseUp || false;

        var raiseChangedOnlyForMouseup = isSelected && this.options.selectOnMouseup;
        if (raiseChangedOnlyForMouseup) {
            if (!mouseUp) { return; }
        }

        this._trigger('changed', {}, {
            item: $item,
            selected: isSelected
        });
    },

    _toggle: function(el, isSelected) {

        var o = this.options;
        var $el = $(el);

        var d = $el.data(o.dataName) || {};

        var shouldBeSelected = (arguments.length == 2) ? !!isSelected : !d.selected;


        if (d.className && d.className != o.className) {
            $el.removeClass(d.className);
        }

        //if (shouldBeSelected != !!d.selected) {

            $el.toggleClass(o.className, shouldBeSelected);

            d.selected = shouldBeSelected;
            d.className = o.className;

            if (!shouldBeSelected) {
                d.nextReset = false;
            }

            $el.data(o.dataName, d);

            if (o.fireEvents){
                this.raiseChanged($el, shouldBeSelected);
            }
        //}
    },

    _reset: function(i, el){
        this._toggle(el, false)
    },

    _resetForce: function(i, el){
        this._toggle(el, false, true)
    },


    _set: function(i, el){
        this._toggle(el, true)
    },

    _setData: function(el, name, val){

        var dataName = this.options.dataName;

        var d = $.data(el, dataName) || {};
        d[name] = val;
        $.data(el, dataName, d);
    },

    _getData: function(el, name){

        var dataName = this.options.dataName;

        var d = $.data(el, dataName) || {};
        return d[name];

    }

});

}(jQuery));

});
