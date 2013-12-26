define([
    'tau/core/templates-factory'], function(templates) {
    var config = {
        name: 'container.table',
        markup: [
            '<table class="${cssClass} container-table">',
            '   <tr></tr>',
            '</table>'
        ],
        dependencies:[]
    };

    return templates.register(config);
});