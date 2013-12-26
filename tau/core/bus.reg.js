define([
    'Underscore'
    ,'tau/core/bus.collection'
], function(_, BusCollection) {

    var registry = new BusCollection();

    window['tau'] = window['tau'] || { };

    _.extend(window['tau'], {
        buses: registry
    });

    return registry;
});

