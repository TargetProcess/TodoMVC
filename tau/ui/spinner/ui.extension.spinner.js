define([
    "tau/components/extensions/component.extension.base"
], function(ExtensionBase) {

    return ExtensionBase.extend({
        options:{
            spinnerClass: 'ui-spinner'
        },

        "bus beforeInit": function(evtArgs) {
            var self = this;
            if (this.config.spinner !== false){
                self.element && self.element.addClass(self.options.spinnerClass);
            }

        },

        "bus afterRender": function(evt) {
            var self = this;
            self.element = evt.data.element;
            if (this.config.spinner !== false){
                self.element.removeClass(self.options.spinnerClass);
            }
        }
    });
});
