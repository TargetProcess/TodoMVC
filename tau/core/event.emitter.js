define([
    'tau/core/class'
    ,'tau/core/event'
], function (Class, event) {

    var fnNoop = function() {};

    var EventEmitter = Class.extend({

        init: function (config) {
            this.bus = config.bus;
            event.subscribeOn(this);
        },

        "bus refresh": function(evt) {
            this.lifeCycleCleanUp();
        },

        lifeCycleCleanUp: fnNoop,

        on: function() {
            this.bus.on.apply(this.bus, arguments);
        },

        fire: function() {
            return this.bus.fire.apply(this.bus, arguments);
        },

        "bus destroy": function() {
            this["on"] = fnNoop;
            this["fire"] = fnNoop;
            this.destroy();
        },

        resetSubscriptions: function() {
            event.unSubscribe(this);
            event.subscribeOn(this);
        },

        destroy: function() {
            var gb = this.bus.getGlobalBus();
            if (gb) {
                gb.removeAllListeners(this);
            }
            event.unSubscribe(this);

            delete this.bus;

            this.bus = {
                fire: fnNoop,
                on: fnNoop,
                removeListener:fnNoop
            }
        }
    });

    return EventEmitter;
});
