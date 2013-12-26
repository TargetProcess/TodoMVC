define([
    "Underscore"
    ,'tau/core/extension.base.stateful'
], function(_, Class) {

    var Extension = Class.extend({

        "bus afterRender":function(evtArgs) {
            this.element = evtArgs.data.element;
        },

        createComponents:function(componentsConfig, callback) {
            var creator = {
                bus:this.bus,
                config:componentsConfig,
                create:function() {
                    this.bus.on('componentsCreated', this.onComponentCreated, this);
                    this.bus.fire('createComponents', this.config, this);
                },

                onComponentCreated:function(evtArgs) {
                    if (evtArgs.caller !== this) {
                        return;
                    }
                    evtArgs.removeListener();
                    callback(evtArgs.data);
                }
            };

            creator.create();
        },

        isEntityInContext:function (evt) {
            var currentEntityId = this.config.context.entity.id;
            var entityFromContext = currentEntityId == (evt.data.entity || evt.data.assignable).id;
            return entityFromContext;
        }
    });

    return Extension;
});
