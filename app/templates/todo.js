define([
    'tau/core/templates-factory'
    ,'tau/libs/require.js/text!app/templates/todo.html'
], function(templates, markup) {
    var config = {
        name:   'todo-item-creator',
        engine: 'jqote2',
        markup: markup
    };
    return templates.register(config);
});