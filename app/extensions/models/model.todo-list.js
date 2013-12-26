define(['tau/components/extensions/component.extension.base'],
    function (ExtensionBase, ContextProvider) {
        return ExtensionBase.extend({
            refreshComponent : function (){
                this.fire('refresh');
            },
            "bus afterInit": function (e, data) {
                var self = this;
                var store = data.config.context.store;
                ['add','remove','update'].forEach(this.subscribeOnStore.bind(this,store));
                this.fire('dataBind',{items: store.getItems()});
            },
            subscribeOnStore:function(store, event) {
                store.removeListener(event,this.refreshComponent,this);
                store.on(event,this.refreshComponent,this);
            }
        });
    });
