define([
    'Underscore'
    , 'tau/components/component.container'
    ,'app/templates/todo'
], function (_, ComponentContainer, template) {

    return {
        create: function (config) {
            var path = 'app/components/'
            var creatorConfig = {
                extensions: [
                ].concat(config.extensions || []),
                template: template
            };

            creatorConfig.layout = 'selectable';
            creatorConfig.children = [
                {
                    type: 'component.todo-item-creator',
                    name: 'creator',
                    selector:'#header'
                },
                {
                    type: 'component.todo-list',
                    name: 'list',
                    selector:'#main'
                }
            ];
            creatorConfig.children.forEach(function(item){
               item.path = path + item.type;
            });

            return ComponentContainer.create(_.extend(config, creatorConfig));
        }
    };
});