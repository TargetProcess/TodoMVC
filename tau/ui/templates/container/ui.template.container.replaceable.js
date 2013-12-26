define([
    'tau/core/templates-factory'
], function(templates) {

    var config = {
        name: 'container.replaceable',
        engine:'jqote2',
        markup: [
            '<div>',
            '</div>'
        ]
    };

    return templates.register(config);
});
