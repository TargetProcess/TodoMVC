define([
    'Underscore'
    , 'tau/core/event'
], function (_, event) {
    var eventQueued = function () {
        event.call(this, arguments);
    };
    _.extend(eventQueued, event);
    _.extend(eventQueued.prototype, event.prototype);
    var eventQueue = null;

    var unlockDelegate = function(mutex) {
        var afterArguments = cloneArray(mutex.originalArguments);
        afterArguments[0] = 'after_' + afterArguments[0];
        afterArguments[1] = afterArguments[1] || {};
        afterArguments[2] = afterArguments[2] || {};

        if (!eventQueue || eventQueue.length == 0) {
            event.prototype.fire.apply(mutex.scope, mutex.originalArguments);
            event.prototype.fire.apply(mutex.scope, afterArguments);
        }
        else {

            eventQueue.push({arguments:mutex.originalArguments,scope:mutex.scope});
            eventQueue.push({arguments:afterArguments,scope:mutex.scope});

        }
    };

    function cloneArray(arguments) {
        var args = [];

        _.each(arguments, function(v) {
            args.push(v);
        });
        return args;
    }

    eventQueued.prototype.fire = function (eventName, data, caller) {
        var originalArguments = cloneArray(arguments);

        var beforeArguments = cloneArray(originalArguments);
        beforeArguments[0] = 'before_' + beforeArguments[0];
        beforeArguments[1] = beforeArguments[1] || {};
        beforeArguments[2] = beforeArguments[2] || {};

        var afterArguments = cloneArray(originalArguments);
        afterArguments[0] = 'after_' + afterArguments[0];
        afterArguments[1] = afterArguments[1] || {};
        afterArguments[2] = afterArguments[2] || {};

        beforeArguments[3] = {
            lockCount:0,
            canceled:false,
            originalArguments:originalArguments,
            scope:this,
            unlockedDelegate:function() {
            },

            setUnlockDelegate:function(delegate) {
                this.unlockedDelegate = delegate;
            },

            isCanceled:function() {
                return this.canceled;
            },

            isLocked:function() {
                return this.lockCount > 0;
            },

            cancel:function() {
                this.canceled = true;
            },

            lock:function() {
                this.lockCount ++;
            },

            unlock:function() {
                this.lockCount--;
                if (this.lockCount == 0) {

                    this.unlockedDelegate(this);

                    delete this.originalArguments;
                    delete this.scope;
                }
            }
        };

        if (_.isNull(eventQueue)) {
            eventQueue = [];

            eventQueue.push({arguments:beforeArguments,scope:this});
            eventQueue.push({arguments:originalArguments,scope:this});
            eventQueue.push({arguments:afterArguments,scope:this});

            while (eventQueue.length > 0) {
                var args = eventQueue[0].arguments;
                var scope = eventQueue[0].scope;

                eventQueue.splice(0, 1);
                event.prototype.fire.apply(scope, args);
                var mutex = args && args[3];

                if (mutex && (mutex.isLocked() || mutex.isCanceled())) {

                    eventQueue.splice(0, 2);

                    if (mutex.isCanceled() == false) {
                        mutex.setUnlockDelegate(unlockDelegate);
                    }
                }

            }

            eventQueue = null;
        }
        else {
            eventQueue.push({arguments:beforeArguments,scope:this});
            eventQueue.push({arguments:originalArguments,scope:this});
            eventQueue.push({arguments:afterArguments,scope:this});
        }
    };

    return eventQueued;
});
