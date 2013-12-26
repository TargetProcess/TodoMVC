define(['libs/modernizr/modernizr'], function(Modernizr) {

    var HIDPR_THRESHOLD = 2;

    Modernizr.addTest('hidpr', function() {
        return (window.devicePixelRatio >= HIDPR_THRESHOLD);
    });

});