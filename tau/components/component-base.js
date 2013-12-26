define([
    "Underscore"
    ,"tau/core/class"
    ,"tau/core/bus"
], function(_, Class, Bus) {

    return Class.extend({

        init: function(config) {

            this.config = _.extend({}, config);

            this.config.context = this.config.context || {};

            this.bus = new Bus({
                name:           this.config.name,
                globalBus:      new Bus({name:'global'})
            });

            _.defaults(this.config, {
                bus: this.bus
            });

            return this;
        },

        attach: function(ExtensionClass, attachmentConfig) {

            attachmentConfig = attachmentConfig || {};

            var excludes = this.config.disabledExtensionCategories;

            if (excludes) {
                var category = ExtensionClass.prototype.category;
                if (category && _.indexOf(excludes, category) >= 0) {
                    return this;
                }
            }

            var config = _.clone(this.config);

            if (!attachmentConfig.hasOwnProperty('onCreate')) {
                config = _.extend(config, attachmentConfig);
            }

            var a = new ExtensionClass(config);

            attachmentConfig.onCreate && attachmentConfig.onCreate(a);
            return this;
        }
    });
});
