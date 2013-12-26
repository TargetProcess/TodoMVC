define([
    "Underscore"
    ,"jQuery"
    ,"tau/nls/translator"
], function (_, $, T) {

    var jqote2customFunctions = {
        sub: function(subTemplateName, subTemplateData) {
            var arr = _.isArray(subTemplateData) ? subTemplateData : [subTemplateData];
            var out = [];
            for (var i = 0, len = arr.length; i < len; i++) {
                out.push(templatesFactory.get(subTemplateName).render(null, arr[i]));
            }
            return out.join('');
        },

        // aliases / shortcuts
        translate: T,
        T: T
    };

    var templatesFactory = {
        templates: {},
        initialized:{},

        get: function(name) {
            var tmplConfig = this.templates[name];
            if (!tmplConfig) {
                throw ["Template '", name, "' was not registered."].join('');
            }
            return this[tmplConfig.engine + '.get'](name);
        },

        "jquery.get": function(name) {
            var self = this;

            if (!$.template.hasOwnProperty(name)) {
                throw ["jQuery template '", name, "' was not found."].join('');
            }

            return {
                bind: function(cfg, bindData) {
                    var extRef = {};
                    var templateConfig = self.templates[name];
                    var customTags = templateConfig.tags || [];
                    for (var i = 0; i < customTags.length; i++) {
                        var tag = customTags[i];
                        tag.register(cfg, extRef);
                    }

                    var tmpl = $.template[name];
                    return $.tmpl(tmpl, bindData, extRef);
                }
            }
        },

        "jqote2.get": function(name) {
            var self = this;

            var templateConfig = self.templates[name];
            if (!templateConfig.jqotecmpl) {
                throw ["Template '", name, "' was not compiled."].join('');
            }

            return {
                render: function(cfg, bindData) {
                    var customFunctions = templateConfig.customFunctions || {};
                    _(customFunctions).extend(jqote2customFunctions);

                    if (_.isFunction(templateConfig.pre)) {
                        bindData = templateConfig.pre(bindData)
                    }

                    var dom = templateConfig.jqotecmpl.call(bindData, 0, 0, [bindData], customFunctions);

                    if (_.isFunction(templateConfig.post)) {
                        dom = templateConfig.post(dom, bindData)
                    }

                    return dom;

                },

                bind: function(cfg, bindData) {
                    var tmpl = this.render(cfg, bindData);
                    return $(tmpl);
                },

                bindPure: function(cfg, bindData) {
                    return this.render(cfg, bindData);
                }
            }
        },

        registerRecursively: function(name, _customTagsRef) {
            var self = this;

            _customTagsRef = _customTagsRef || { tags:[] };

            var templateConfig = null;

            if (!$.template.hasOwnProperty(name)) {

                templateConfig = this.templates[name];
                if (!templateConfig) {
                    throw ["Template '", name, "' was not found."].join('');
                }

                if (templateConfig.tags) {
                    _customTagsRef.tags = _customTagsRef.tags.concat(templateConfig.tags);
                }

                $.each(templateConfig.dependencies, function(i, templateName) {
                    self.registerRecursively(templateName, _customTagsRef);
                });

                templateConfig.tags = _customTagsRef.tags;

                var markup = templateConfig.markup;

                $.template(name, markup);
            }
            else {
                templateConfig = templateConfig || this.templates[name];
                if (templateConfig.tags) {
                    _customTagsRef.tags = _customTagsRef.tags.concat(templateConfig.tags);
                }
            }
        },

        "jquery.register" : function(config) {
            this.registerRecursively(config.name);
        },

        "jqote2.register" : function(config) {
            config.jqotecmpl = $.jqotec(config.markup);
        },

        register : function(config) {
            var self = this;
            config.dependencies = config.dependencies || [];
            config.markup = _.isArray(config.markup) ? config.markup.join('') : config.markup;
            config.engine = config.engine || 'jquery';
            self.templates[config.name] = config;

            self[config.engine + '.register'](config);

            return {
                name: config.name,
                options: config.options || {},
                get: function() {
                    return self.get(config.name);
                }
            }
        }
    };
    return templatesFactory;
});
