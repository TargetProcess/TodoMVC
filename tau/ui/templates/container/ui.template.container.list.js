define([
    'tau/core/templates-factory'], function(templates) {
    var config = {
        name: 'container.list',
        //engine:'jqote2',
        markup: [
            '<div class="tau-container ${cssClass}">',
            '</div>'
        ],
        dependencies:[]
    };

    return templates.register(config);
});
