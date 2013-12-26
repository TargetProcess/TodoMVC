define([
    "Underscore"
    ,"jQuery"
    ,"tau/components/extensions/component.extension.base"
], function(_, $, ExtensionBase) {

    return ExtensionBase.extend({

        "bus childrenRendered+afterRender": function(evt) {
            var self = this;
            self.element = evt.afterRender.data.element;
            var childrenArgs = evt.childrenRendered.data.childrenEvtArgs;

            self.config.layout = self.config.layout || 'list';
            var options = self.config;

            var methodName = ['_add',options.layout,'item'].join(' ');
            options.childrenContainerSelector = options.childrenContainerSelector || (options.layout === 'list' ? null : '> tbody > tr');

            _.each(childrenArgs, function(data) {
                var $child = data.element;
                var args = { element : $child, data: data };
                self.fire('append.child.element', args);
                self[methodName](args.element, data.view ? data.view.config : {});
            });

            if (self.element) {
                evt.afterRender.data.element = self.element; // hack, should be more explicit if we want replace element completely
            }
        },

        "_add list item":function (data) {
            var element = data.jquery ? data : data.element;
            var $target = this.config.childrenContainerSelector ? this.element.find(this.config.childrenContainerSelector) : this.element;
            $target.append(element);
        },

        getTableItemContainer:function () {
            var self = this;
            var options = self.config;
            var row = self.element.find(options.childrenContainerSelector+':last');
            if(options.hasOwnProperty('columnCount') ){
                var itemsCount = row.children('td').size();
                if(itemsCount >=options.columnCount){
                    row = $('<tr></tr>');
                    self.element.children('tbody').append(row);
                }
            }
            return row;
        },
        "_add table item":function (data) {
            var self = this;
            var element = data.jquery ? data : data.element;
            var options = self.config;
            var row = this.getTableItemContainer();
            var index = row.children('td').length;
            var cssClass = (options.cellsCssClass && options.cellsCssClass[index]) || '';
            $('<td></td>')
                .addClass(cssClass)
                .append(element)
                .appendTo(row);
        },

        "_add selectable item":function (componentEl, componentConfig) {

            var $source = componentEl;

            var $el = this.element;

            var selector = componentConfig.selector || '[role=main]';
            var $target = $el.filter(selector);
            if ($target.length == 0){
                $target = $el.find(selector);
            }


            if ($target.length == 0) {
                console.log($el);
                console.error('No element for selector "' + selector +  '"');
            } else {
                $target.eq(0).append($source);
            }
        },

        "_add replaceable item":function (data) {

            var $childElement = data.jquery ? data : data.element;
            var $containerElement = this.element;
            if ($containerElement.parent().length) {
                $containerElement.replaceWith($childElement)
            } else {
                this.element = $childElement;
            }
        }

    });
});
