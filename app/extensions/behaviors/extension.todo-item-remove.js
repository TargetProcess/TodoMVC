define(['tau/components/extensions/component.extension.base'],
    function (ExtensionBase, ContextProvider) {
        return ExtensionBase.extend({
            "bus afterRender + afterInit": function (e, data, initData) {
                 var $element = data.element;
                 $element.on('click','.destroy',function(e){
                     var id = $(e.currentTarget).data('id');
                     initData.config.context.store.remove(id);
                 });
            }
        });
    });
