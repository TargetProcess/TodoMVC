define([
    'Underscore',
    'tau/libs/require.js/i18n!tau/nls/tokens'
], function(_, tokens) {
    var gettext = function(t) {
        var r = tokens.hasOwnProperty(t) ? tokens[t] : t;
        r = _.isFunction(r) ? r() : r;
        return r;
    };

    gettext.gettext = gettext;

    return gettext;
});