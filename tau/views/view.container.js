define([
    "Underscore"
    ,"jQuery"
    ,'tau/core/view-base'
    ,'tau/core/event-dispatcher'
    ,'tau/ui/templates/container/ui.template.container.list'
    ,'tau/ui/templates/container/ui.template.container.table'
    ,'tau/ui/templates/container/ui.template.container.replaceable'
], function(_, $, viewBase, EventDispatcher) {

    var containerView = viewBase.extend({

        init: function(config) {
            this._loaded = false;
            this._super(config);
        },

        completeInitializationWithoutChildren:function() {
            var self = this;
            self.fire('afterInit');
            self._fireChildrenRendered({ children: [], childrenEvtArgs: [] });

        },

        setDefaultConfig: function() {
            var self = this;
            self._super();

            _.defaults(self.config, {
                template: {
                    name: "container." + (self.config.layout || "list")
                }
            });
        },

        "bus componentCreated":function(evtArgs) {
            var component = evtArgs.data.component;
            this.fire('childComponentCreated', component);
            this.children.push(component);
        },

        _fireChildrenRendered:function (children) {
            this.fire("internalChildrenRendered", children);
        },

        "bus afterInit+internalChildrenRendered" : function(evts) {


            var data = this._getRenderConfig();

            this.fireBeforeRender({ data: data});
            this.doRender(data);

            var children = evts.internalChildrenRendered.data;

            _.extend(children, { config: this.config });
            this.fire("childrenRendered", children);
            this.fireAfterRender({ data: data});

        },

        initializeComponents:function (evtArgs) {
            var self = this;


            self.dispatcher = new EventDispatcher(self.children);

            var events = ['afterInit'];

            var reaction = function(data) {
                self.fire(data.eventName);
            };

            _(events).each(function(evtName) {
                self.dispatcher.listen(evtName, reaction);
            });

            self.dispatcher.listen("afterRender", function(evt) {
                var childrenEvtArgs = evt.argsArr;
                var data = {
                    children: self.children,
                    childrenEvtArgs: childrenEvtArgs
                };
                self._fireChildrenRendered(data);
            });

            var childrenConfigs = _(evtArgs.data).pluck('config');
            _(self.children).each(function(c, index) {
                c.fire('initialize', childrenConfigs[index]);
            });
        },

        "bus componentsCreated:last+sendEventToComponents":function(evt){
            var components = evt['componentsCreated'].data;
            var eventConfig = evt['sendEventToComponents'].data;
            _.each(components,function(config){
                config.component.fire(eventConfig.name, eventConfig.data);
            });
        },

        "bus componentsCreated":function(evtArgs) {
            this.fire('beforeComponentsInitialize', evtArgs.data);
            this.initializeComponents(evtArgs);
            this.fire('afterComponentsInitialize', evtArgs.data);
        },

        lifeCycleCleanUp:function() {
            this.destroyChildren();
        },

        "bus refresh": function(evt) {
            this.startLifeCycle(evt);
        },

        startLifeCycle:function (evt) {
            var self = this;

            self.setDefaultConfig();
            _.extend(self.config, (evt || {} ).data);

            self.fire("beforeInit", { config: self.config });

            var children = self.config.children;
            self.children = [];

            var loadDependencies = (_.isArray(children) && _.size(children) > 0) && self.config.visible;
            if (loadDependencies) {
                var components = self.config.children;
                var context = self.config.context || {};
                this.fire('createComponents', {
                    components: components,
                    context: context
                });
            }
            else {

                self.completeInitializationWithoutChildren();
            }
        },

        "bus initialize" : function(evt) {
            this.startLifeCycle(evt);
        },

        toggle: function($el, flag){

            var useAnimation = this.config.useAnimation !== false && !$.fx.off && ($el.parents('.tau-bubble:first').length == 0);

            if (useAnimation){
                if (flag) {
                    $el.slideDown(200);
                } else {
                    if (this._loaded) {
                        $el.slideUp(200);
                    } else {
                        this._super($el, flag);
                    }
                }
            } else {
                this._super($el, flag);
            }
        },
//
//        hideElement:function ($el) {
//            // TODO: wtf? :D
//            var inBubble = $el.parents('.tau-bubble:first').length > 0;
//
//            if (inBubble == false && this._loaded && !$.fx.off) {
//                this.element.slideUp(200);
//                return;
//            }
//
//
//            this._super($el);
//        },
//
//        showElement: function($el) {
//            // TODO: wtf? :D
//            // TODO: use events + extensions where necessary
//            var inBubble = this.element.parents('.tau-bubble:first').length > 0;
//            if (inBubble == false && !$.fx.off) {
//                this.element.slideDown(200);
//                return;
//            }
//
//
//            this._super($el);
//        },

        "bus show": function() {
            this._super();
            if (!this._loaded) {
                this.fire('initialize', {});
            } else {
                this.fire('show.completed', this)
            }
        },


        "bus show + internalChildrenRendered": function(){
            this.fire('show.completed');
        },


        _getRenderConfig:function () {
            var cfg = this.config;
            if (cfg.visible) {
                this._loaded = true;
            }
            return cfg;
        },

        destroyChildren:function () {
            var item = null;
            if (this.children && this.children.length) {
                while (item = this.children.pop()) {
                    item.destroy();
                }
            }


            this.children = null;
        },

        destroy: function() {
            this.dispatcher = null;

            this.destroyChildren();
            this._super();
        }
    });

    return containerView;
});
