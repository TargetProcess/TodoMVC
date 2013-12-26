define([
    'Underscore'
    ,'tau/libs/jquery/jquery'
    ,'tau/core/class'
    ,'tau/core/event'
], function(_, $, Class, Event) {

    var Collection = Class.extend({

        init: function(){

            this.buses = {};
        },

        register: function(bus){

            this.buses[bus.id] = bus;
            this.fire('create', {
                bus: bus
            });
        },

        count: function(excludeGlobalBus) {

            var keys = _.keys(this.buses);
            if (excludeGlobalBus) {
                keys = _.without(keys, 'global');
            }
            return keys.length;
        },

        size: function(){
            return this.count();
        },

        stats: function() {
            var counts = {};

            _.forEach(this.buses, function(bus, key){

                if (!counts.hasOwnProperty(bus.name)) {
                    counts[bus.name] = 0;
                }
                counts[bus.name]++;
            });

            _.forEach(counts, function(v, key) {
                console.log(key + " : " + v);
            });
        },

        unregister: function(bus){

            if (bus.id === 'global') {
                return;
            }

            delete this.buses[bus.id];
            this.fire('destroy', {
                bus: bus
            });
        },

        getByName: function(name, f){

            var def = $.Deferred();

            var cond = function(bus){
                return bus.name === name;
            };

            var bus = _.find(this.buses, cond);

            if (!bus) {
                var listener = _.bind(function(def, evt){

                    var bus = evt.data.bus;

                    if (cond(bus)) {
                        this.removeListener('create', listener, this);
                        def.resolve(bus);
                    }
                }, this, def);

                this.on('create', listener, this);
            } else {
                def.resolve(bus);
            }
            // bc old mashups
            if (f){
                def.done(f);
            }
            return def;
        },

        onCreate: function(bus) {
            this.register(bus);
        },

        onDestroy: function(bus) {
            this.unregister(bus);
        },

        logCount: function() {
            console.log("#count: " + this.count());
        },

        clear: function(){
            this.buses = {};
        }
    });

    Event.implementOn(Collection.prototype);

    return Collection;

});

