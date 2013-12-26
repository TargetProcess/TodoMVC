define([
    "Underscore"
    ,"tau/core/class"
    ,"tau/core/termProcessor"
], function(_, Class, TermProcessor) {
    var TauExtension = Class.extend({
        init: function(config) {
            this.termProc = new TermProcessor(config.terms);
        },

        terms: function(entityType) {
            return this.termProc.getTerms(entityType);
        },

        text_implode: function(text){

            var processed = new String(text);

            if (_.isString(text)) {
                processed = text;
            } else if (_.isArray(text)) {
                var tmp = _.clone(text);
                var last = tmp.pop();
                processed = _.filter([tmp.join(', '), last], function(s){
                    return s != false;
                }).join(' &amp; ');
            }

            return processed;
        },

        key: function(data, key){

        }
    });

    return TauExtension;
});
