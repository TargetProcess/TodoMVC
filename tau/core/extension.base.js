define([
    "Underscore"
    ,'tau/core/event.emitter'
], function(_, Class) {

    var Extension = Class.extend({
        resetLifecycle:true,
        lifeCycleCleanUp: function(){
            if (this.resetLifecycle){
                this.resetSubscriptions();
            }
        },

        _extractOptions: function(initConfig, defaults){

            var options = {};

            if (_.isObject(initConfig)){
                if (initConfig.hasOwnProperty('options')) {
                    options = _.deepClone(initConfig.options || {});
                } else if (!initConfig.hasOwnProperty('type') && !initConfig.hasOwnProperty('name') && !initConfig.hasOwnProperty('component') && !initConfig.hasOwnProperty('context')) {
                    options = _.deepClone(initConfig);
                }
            }

            options = _.deepMerge(defaults, options);

            return options;

        }
    });

    return Extension;
});
