define(['tau/components/extensions/component.extension.base'],
    function (ExtensionBase, ContextProvider) {
        return ExtensionBase.extend({
            "bus afterRender + afterInit": function (e, data, initData) {
                 var $element = data.element;
                 $element.filter('input').keypress(function(e){
                     if(e.keyCode === $.ui.keyCode.ENTER && this.value) {
                         initData.config.context.store.add({description:this.value});
                         this.value = '';
                     }
                 });
            }
        });
    });
