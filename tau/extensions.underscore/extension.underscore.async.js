define([
    'tau/libs/underscore'
    ,'tau/libs/async/async'
], function(_, async) {

    _.mixin({
        parallel:   async.parallel,
        series:     async.series,
        waterfall:     async.waterfall
    });

});
