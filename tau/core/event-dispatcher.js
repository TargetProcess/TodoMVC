define([
    "Underscore"
    ,'tau/core/class'
], function(_, Class) {

    var EventDispatcher = Class.extend({
        init: function(components) {
            this.components = components;
            this.eventArgsQueue = {};
            this.dictionaryQueue = {};
        },

        listen: function(evtName, callback) {
            var self = this;

            if (!self.dictionaryQueue.hasOwnProperty(evtName)) {
                self.dictionaryQueue[evtName] = _(self.components).clone();
                self.eventArgsQueue[evtName] = [];
            }

            var listener = function(evt) {
                var sender = evt.sender;
                evt.removeListener();
                var index = _(self.components).indexOf(sender);
                self.eventArgsQueue[evt.name][index] = evt.data;
                // TODO: revisit and apply splice
                // self.dictionaryQueue[evt.name].splice(index, 1);
                self.dictionaryQueue[evt.name] = _(self.dictionaryQueue[evt.name]).without(sender);

                if (_.isEmpty(self.dictionaryQueue[evt.name])) {
                    var data = {
                        eventName: evt.name,
                        argsArr: self.eventArgsQueue[evt.name]
                    };
                    callback(data);
                }
            };

            _(self.components).each(function(component) {
                component.on(evtName, listener, null, {}, 1000);
            });
        }
    });

    return EventDispatcher;
});
