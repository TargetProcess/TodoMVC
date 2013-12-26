define(['tau/core/bus', 'app.bus'], function (Bus, promise) {
    var globalBus = new Bus({ id: 'global', name: 'globalBus' });
    promise.resolve(globalBus);

    return {
        bus: null,

        reset: function () {
            // LEAVE FOR A WHILE SHOULD BE DELETED
        },

        get: function () {
            return globalBus;
        }
    };
});

