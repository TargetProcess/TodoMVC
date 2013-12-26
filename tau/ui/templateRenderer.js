define([
     "Underscore"
    ,"jQuery"
], function(_, $) {

    $.extend($.tmpl.tag, {
        '@': {
            _default: { $1: "'type'", $2: "null" },
            open: [
                'var $__t = $item;',
                'while(!$__t.$tau && $__t.parent){',
                '$__t = $__t.parent',
                '}',
                '_=_.concat($__t.$tau.terms($2)[$1]);'
            ].join('')
        },

        'tauKey': {
            _default: { $1: "id", $2: "null" },
            open: [
                '_=_.concat(new String(window._.complexKey($2["data"], $1) || "").toString());'
            ].join('')
        }
    });
    return $;
});
