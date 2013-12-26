define([
    'tau/core/templates-factory'
], function (templates) {
    var config = {
        name: 'todo-list-item',
        engine: 'jqote2',
        markup: [
            '<li class="<%=this.state?\'completed\':\'\'%>">',
                '<div class="view">',
                    '<input data-id="<%!this.id%>" class="toggle" type="checkbox" <%=this.state?\'checked\':\'\'%>>',
                    '<label><%!this.description%></label>',
                    '<button data-id="<%!this.id%>" class="destroy"></button>',
                '</div>',
                '<input class="edit" value="<%!this.description%>">',
            '</li>'
        ]
    };
    return templates.register(config);
});