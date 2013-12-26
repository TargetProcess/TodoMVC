define([
    "Underscore"
    ,"jQuery"
    ,'tau/core/event.emitter'
    ,"tau/core/templates-factory"
], function (_, $, Class, templates) {
    var view = Class.extend({

        name: 'view-base',

        init: function (config) {
            this._super(config);
            this.config = config || {};
        },

        destroy: function() {
            this._super();

            this.element && this.element.remove();
            delete this.element;
            delete this.config;
        },

        merge: function(newElement, selector) {
            var self = this;
            if (selector && self.element) {
                if (!$.isArray(selector)) {
                    selector = [selector];
                }

                var innerSelectors = _(selector).isArray() ? selector : [selector];
                var currentElement = this.element;
                _(innerSelectors).each(function(sel) {
                    var elementsToReplace = currentElement.find(sel);
                    var elementsToInsert = newElement.find(sel);

                    elementsToReplace.each(function(i) {
                        $(this).replaceWith(elementsToInsert.eq(i));
                    });
                });
            }
        },

        bindTemplate: function (data) {
            var tmplName = this.config.template.name;
            var newElement = templates.get(tmplName).bind(this.config, data);
            return newElement;
        },

        prepareElement: function (newElement) {
            return newElement;
        },

        updateElement: function(newElement, refreshSelector) {
            var self = this;
            if (self.element && refreshSelector) {
                self.merge(newElement, refreshSelector);
            }
            else {
                if (self.element) {
                    if (newElement.length) {
                        self.element.replaceWith(newElement);
                    } else {
                        self.element.remove();
                    }
                }

                self.element = newElement;
            }
        },

        doRender: function (data, refreshSelector) {
            var newElement = this.bindTemplate(data);
            newElement = this.prepareElement(newElement);
            this.updateElement(newElement, refreshSelector);
            !this.config.visible && this.hide();
        },

        fireAfterInit:function (refreshSelector) {
            this.fire("afterInit", { config: this.config, refreshSelector: refreshSelector });
        },

        initialize:function (refreshSelector) {
            var self = this;
            this.fireAfterInit(refreshSelector);
        },

        setDefaultConfig: function() {
            var self = this;
            _.defaults(self.config, {
                visible: true
            });
        },

        "bus refreshData" : function(args) {
            this.doRender(args.data);
            this.fire('elementRefreshedWithData', { element: this.element });
        },

        "bus refresh": function(evt) {
            this._super();
            var data = evt.data || {};
            var refreshSelector = data.refreshSelector;
            this.startLifeCycle(evt, refreshSelector);
        },

        "bus initialize": function(evt) {
            this.startLifeCycle(evt);
        },

        startLifeCycle : function(evt, refreshSelector) {
            var self = this;
            self.setDefaultConfig();
            _.extend(self.config, evt.data);
            self.fire("beforeInit", { config: self.config });
            this.initialize(refreshSelector);
        },

        "bus show": function() {
            this.show();
        },

        "bus hide": function() {
//            this.hide();
        },

        "bus show+afterRender:last": function(evt) {
            var $el = evt['afterRender'].data.element;
            this.showElement($el, true);
        },

        "bus hide+afterRender:last": function(evt) {
            var $el = evt['afterRender'].data.element;
            this.hideElement($el);
            this.config.visible = false;
        },


        show: function () {
            this.showElement(this.element);
            this.config.visible = true;
        },

        showElement:function ($el) {
            this.toggle($el, true);
        },



        hide: function () {
            this.hideElement(this.element);
            this.config.visible = false;
        },

        hideElement:function ($el) {
            this.toggle($el, false);
        },


        toggle: function($el, flag){
            if (this.config.visibilityClassName){
                $el.toggleClass(this.config.visibilityClassName, flag);
            } else {
                $el.toggle(flag);
            }
        },

        "bus applyTo": function(evt) {
            this.element = evt.data.element;
        },

        "bus afterInit+dataBind" : function(evts) {
            this.render(evts.dataBind.data, evts.afterInit.data);
        },

        render: function (data, settings) {
            this.fireBeforeRender({ data: data});
            this.doRender(data, settings.refreshSelector);
            this.fireAfterRender({ data: data});
        },

        fireBeforeRender:function (config) {
            config = config || {};
            this.fire("beforeRender", { data: config.data,  view: this, element: this.element });
        },

        fireAfterRender:function (config) {
            config = config || {};
            this.fire("afterRender", { data: config.data,  view: this, element: this.element });
        }
    });

    return view;
});
