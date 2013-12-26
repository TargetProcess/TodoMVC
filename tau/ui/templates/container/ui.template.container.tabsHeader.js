define([
    'tau/core/templates-factory'
], function(templates) {

    var config = {

        name: 'container.tabsHeader',
        markup: [
            '<div class="box table ui-helper-clearfix">',
                '<ul class="entity-tabs i-role-tabheaders">',
                '</ul>',
            '</div>'
        ]
    };

    return templates.register(config);
});
