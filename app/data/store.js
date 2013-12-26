define(['tau/core/class','tau/core/event'], function (Class, event) {
    var Store = Class.extend({
        itemsKey:'todoItems',
        stateKey:'todoState',
        init:function() {
          var items = window.localStorage.getItem(this.itemsKey);
          if(items) {
              this.items = JSON.parse(items);
          }
          this.currentStateShow = JSON.parse(window.localStorage.getItem(this.stateKey));
        },
        currentStateShow:null,
        items: [
            {
                id: 1,
                description: 'Create a TodoMVC template',
                state: 1
            },
            {
                id: 2,
                description: 'Rule the web',
                state: 0
            }
        ],
        save:function() {
            window.localStorage.setItem(this.itemsKey,JSON.stringify(this.items));
            this.fire('save');
        },
        changeApplicationState:function(state) {
            this.currentStateShow = state;
            this.currentStateShow = window.localStorage.setItem(this.stateKey,JSON.stringify(state));
            this.fire('changeState');
        },
        getItems:function() {
          var items = this.items;
          if(this.currentStateShow) {
              items = this.getItemsByState(this.currentStateShow);
          }
          return items;
        },
        getItemsByState:function(state) {
                var items = _.filter(this.items,function(item){
                    return item.state === state;
                }.bind(this));
            return items;
        },
        add: function (item) {
            var lastElement = this.items[this.items.length - 1] || {id:1};
            item.id = lastElement.id + 1;
            this.items.push(item);
            this.fire('add');
            this.save();
        },
        update:function(id, data) {
            var item = _.find(this.items,function(item){
                return item.id === id;
            });
            _.extend(item,data);
            this.fire('update');
            this.save();
        },
        remove: function(id) {
            this.items = _.without(this.items, _.find(this.items,function(item){
                return item.id === id;
            }));
            this.fire('remove');
            this.save();
        }
    });
    event.implementOn(Store.prototype);
    return new Store();
})