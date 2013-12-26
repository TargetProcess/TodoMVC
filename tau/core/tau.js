define([
    "Underscore"
], function(_) {
    var tau = tau || {};

    tau.empty = function() {
    };

    tau.ns = function(namespace) {
        var parts = namespace.split('.');
        var currentScope = window;
        for (var i = 0, len = parts.length; i < len; i++) {
            var name = parts[i];
            if (typeof currentScope[name] === 'undefined') {
                currentScope[name] = {};
            }
            currentScope = currentScope[name];
        }
    };

    tau.getQueryValueFromUrl = function(url, name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS, 'i');
        var results = regex.exec(url);

        if (results == null) {
            return "";
        }

        return results[1];
    };

    tau.getValueFromQueryString = function(name) {
        var url = window.location.href;
        return tau.getQueryValueFromUrl(url, name);
    };

    tau.getTokenParameterFromQueryString = function(sign){
        var token = tau.getValueFromQueryString('token');
        if(token != ''){
            return sign + 'token='+token;
        }
        return '';
    },

    tau.extendArgs = function(args, arg) {
        var result = args;
        result = [].slice.call(args);
        result.unshift(arg);
        return result;
    };

    tau.concat  = function(){
        return String.prototype.concat.apply('',arguments);
    };

    tau.createScopedCallbackIfRequired = function(callback) {
          if (typeof callback === "function") {
              return callback;
          }

        return tau.createScopedCallback(callback.fn, callback.scope);
    };

    tau.createScopedCallback = function(fn, scope) {
        if (typeof fn !== "function" && typeof fn.fn === "function") {
            fn = fn.fn;

            if (fn.scope) {
                scope = fn.scope;
            }
        }

        if (typeof fn === "function" && scope) {
            fn = _.bind(fn, scope);
        }

        return fn;
    };


    tau.getCallbacks = function(callbacksObj) {

        var callbacks = callbacksObj || {};

        if (_.isFunction(callbacksObj)) {
            callbacks = { success: callbacksObj };
        }

        if (!callbacks.success) {
            callbacks.success = tau.empty;
        }

        if (!callbacks.failure) {
            callbacks.failure = tau.empty;
        }

        var successFn = tau.createScopedCallback(callbacks.success, callbacks.scope);
        var failureFn = tau.createScopedCallback(callbacks.failure, callbacks.scope);

        return { success: successFn, failure: failureFn };
    };

    return tau;
});
