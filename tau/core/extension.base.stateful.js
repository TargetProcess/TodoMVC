define([
    "Underscore"
    ,'tau/core/extension.base'
], function(_, Class) {

    var emptyFn = function() {};

    var isNotABusOrFunctionIterator = function(key) {
        return key !== 'bus' && !_.isFunction(this[key]);
    };

    var destroyPropertyIterator = function(key) {
        delete this[key];
    };


    var Extension = Class.extend({

        init:function(config) {

            this._super(config);
            this.config = config;

            if (config.context && config.context.configurator){
                var configurator = config.context.configurator;
                this.config.store = configurator.getStore();
            }

            this.store = this.config.store;
        },

        // should not be overwritten
        "bus    beforeInit": function(evtArgs, initConfig) {

            initConfig = initConfig || {};

            var configurator = null;
            if (this.config.context) {
                configurator = this.config.context.configurator;
            }

            if (initConfig.config) {
                this.config = _.extend(this.config, initConfig.config);
            }


            if (this.config.context) {
                configurator = this.config.context.configurator  ? this.config.context.configurator  : configurator;
                this.config.context.configurator = configurator;
            }

            if (configurator) {
                this.store = configurator.getStore();
                this.config.store = this.store;
            }

            this.onInit(this.config);
        },

        onInit: function(){

        },


        destroy: function() {

            this._super();

            var context = (this.config || {} ).context;
            delete this.config;
            //prevent future errors
            this.config = {
                context: context
            };

            this.store.unbind(this);
            delete this.store;
            this.store = {
                on: emptyFn,
                remove: emptyFn,
                get: emptyFn,
                find: emptyFn
            };


            var propNames = _.keys(this);
            _(propNames)
                .chain()
                .select(isNotABusOrFunctionIterator, this)
                .each(destroyPropertyIterator, this)
                .value();

        }
    });

    return Extension;
});
