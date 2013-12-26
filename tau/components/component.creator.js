define([
    "Underscore"
    ,"tau/components/component-base"
    ,"tau/core/view-base"
    ,"tau/ui/ui.templateFactory"
    ,"tau/core/bus.reg"
], function(_, ComponentBase, ViewBase, templateFactory, busRegistry) {
    return {
        create:function(configCreator, componentConfig) {

            var config = componentConfig || {};
            configCreator = configCreator || {};
            _.defaults(config, {
                name: configCreator.name
            });

            if (configCreator.template) {
                config.template = configCreator.template;
            }

            if (config.template && config.template.markup) {
                config.template = templateFactory.register(config.template)
            }

            var component = new ComponentBase(config);

            config = component.config;
            var configurator = config.context.configurator;
            // TODO: refactor components to get store always from "config.context.configurator"
            // TODO: avoid adding additional property "store" to component config
           // _.defaults(config, { store: configurator.getStore() });

            var viewType = configCreator.ViewType || ViewBase;
            component.attach(viewType);

            if (configCreator.ModelType) {
                component.attach(configCreator.ModelType);
            }


            if (configCreator.extensions && configCreator.extensions.constructor == Array) {
                for (var i = 0; i < configCreator.extensions.length; i++) {
                    var extension = configCreator.extensions[i];
                    if (extension) {
                        if (extension.hasOwnProperty("type") && extension.hasOwnProperty("config")) {
                            component.attach(extension.type, extension.config);
                        } else {
                            component.attach(extension);
                        }
                    } else {
                        throw new Error('Extension [' + i +'] for component ' + config.name + ' is not defined');
                    }
                }
            }

            var componentBus = component.bus;

            busRegistry.register(componentBus);
            componentBus.on('destroy', function(){
                busRegistry.unregister(this);
            });

            return componentBus;
        }
    };
});
