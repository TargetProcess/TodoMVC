define([
    "Underscore"
    ,'tau/components/extensions/component.extension.base'
], function(_, ExtensionBase) {

    var Creator = ExtensionBase.extend({

        getDependencies: function(children) {
            var dependencies = [];
            _(children).each(function(config) {
                if (config.path) {
                    dependencies.push(config.path);
                }
                else if (config.type) {
                    var path = 'tau/components/component.' + config.type;
                    dependencies.push(path);
                }
                else {
                    throw 'Configuration error: type or path is missing';
                }
            });

            return dependencies;
        },

        childrenLoadedCallback: function(childrenConfigs, listenerData) {
            var self = this;
            var result = [];

            _(childrenConfigs).each(function(config) {
                if (!config.name) {
                    config.name = '';
                    if (config.type) {
                        config.name = config.type;
                    }

                    if (config.id) {
                        config.name += ':' + config.id;
                    }
                }

                var component;

                try {
                    var component = config.component.create(config);
                    self.fire('componentCreated', {component:component});
                    result.push({
                        config: config,
                        component: component
                    });
                } catch (e){
                    console.error(e);
                }

            });

            self.fire('componentsCreated', result, listenerData);
        },

        createDependenciesLoadedCallback: function(data, listenerData) {
            var self = this;
            var childrenConfigs = data.components;
            var parentContext = data.context;
            return function() {

                var components = arguments;

                _(childrenConfigs).each(function(config, index) {
                    config.component = components[index];
                    config.context = parentContext;
                });

                self.childrenLoadedCallback(childrenConfigs, listenerData);
            }
        },

        "bus createComponents":function(evtArgs) {
            var config = evtArgs.data;
            var listenerData = evtArgs.caller;
            var components = config.components;
            components = config.components = _.isArray(components) ? components : [components];
            var dependencies = this.getDependencies(components);
            require(dependencies, this.createDependenciesLoadedCallback(config, listenerData));
        }
    });

    return Creator;
});
