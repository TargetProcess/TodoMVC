define(['tau/libs/jquery/jquery'], function(jQuery) {

    var supports = (function() {
        var div = document.createElement('div'),
                vendors = 'Khtml Ms O Moz Webkit'.split(' '),
                len = vendors.length;
        return function(prop) {
            if (prop in div.style) return true;
            prop = prop.replace(/^[a-z]/, function(val) {
                return val.toUpperCase();
            });
            while (len--) {
                if (vendors[len] + prop in div.style) {
                    // browser supports box-shadow. Do what you need.
                    // Or use a bang (!) to test if the browser doesn't.
                    return true;
                }
            }
            return false;
        };
    })();

    (function($) {

        $.isSupport = function(propertyName) {
            return supports(propertyName);
        };

    })(jQuery);

    return jQuery;
});