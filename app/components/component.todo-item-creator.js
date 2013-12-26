define([
    'tau/components/component.creator'
    ,'app/extensions/behaviors/extension.todo-item-creator'
    ,'app/templates/todo.creator-item'
], function(ComponentCreator, Ext, template){

    return {

        create: function(config) {

            var creatorConfig = {
                extensions:[
                    Ext
                ],
                template:template
            };

            var componentBus = ComponentCreator.create(creatorConfig, config);
            componentBus.fire('dataBind')
            return componentBus;
        }
    };
});
