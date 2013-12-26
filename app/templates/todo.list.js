define([
    'tau/core/templates-factory'
    , 'tau/libs/require.js/text!app/templates/todo.list.html'
    , 'app/templates/todo.list-item'
], function (templates, markup) {
    var config = {
        name: 'todo-list',
        engine: 'jqote2',
        markup: markup
    };
    return templates.register(config);
});
