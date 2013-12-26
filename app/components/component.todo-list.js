define([
    'tau/components/component.creator'
    ,'app/extensions/models/model.todo-list'
    ,'app/extensions/behaviors/extension.todo-item-remove'
    ,'app/extensions/behaviors/extension.todo-item-toggle'
    ,'app/templates/todo.list'
], function(ComponentCreator, Model, Remover, Toggler,template){

    return {

        create: function(config) {

            var creatorConfig = {
                extensions:[
                    Model,
                    Remover,
                    Toggler
                ],
                template:template
            };

            var componentBus = ComponentCreator.create(creatorConfig, config);
            return componentBus;
        }
    };
});
