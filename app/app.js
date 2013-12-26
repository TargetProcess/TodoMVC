define(['app/components/component.todo','app/data/store'],function(componentList, store){
    var list = componentList.create({context:{store:store}});
    list.initialize();
    list.on('afterRender',function(evt, element){
        var $element = element.element;
        $element.appendTo('body');
    });
});
