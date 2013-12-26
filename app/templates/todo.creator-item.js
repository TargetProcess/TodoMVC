define([
    'tau/core/templates-factory'
], function (templates) {
    var config = {
        name: 'todo',
        engine: 'jqote2',
        markup: [
            '<h1>todos</h1>',
            '<input id="new-todo" placeholder="What needs to be done?" autofocus>'
        ]
    };
    return templates.register(config);
});