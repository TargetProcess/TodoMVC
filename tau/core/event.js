define([
    'Underscore'
], function(_) {

    var getEventDescription = function(evtName) {
        var evt = { };
        var parts = evtName.split(':');
        evt.name = parts[0];

        if (parts.length > 1) {
            evt.rule = parts[1];
        }
        return evt;
    };

    var extractData = function(evt){
        var args = [];
        if (!evt.name){
            args = _.pluck(_.values(evt), 'data');
        } else {
            args = [evt.data];
        }

        return args;
    };


    var Event = function(){};

    Event.implementOn = function(targetObject) {
        var eventProto = Event.prototype;

        for (var prop in eventProto) {
            if (targetObject[ prop ] == undefined)
                targetObject[ prop ] = eventProto[ prop ];
        }

        return targetObject;
    };


    Event.signUpOnEvents = function (eventNameParts, targetObject, fnName, property, priority, ordered) {
        var dictionary = {};
        var eventNames = [];
        var evtDescriptors = {};
        var handler = function(evtArg) {

            if (ordered) {
                var index = eventNameParts.indexOf(evtArg.name);

                for (var j = 0; j < index; j ++) {
                    var eventNamePart = eventNameParts[j].replace(':last', '');
                    if (!dictionary.hasOwnProperty(eventNamePart)) {
                        return;
                    }
                }
            }

            dictionary[evtArg.name] = evtArg;

            if (_(dictionary).keys().length === eventNames.length) {
                var data = {};

                for (var i = 0, l = eventNames.length; i < l; i ++) {
                    var descriptor = evtDescriptors[eventNames[i]];
                    data[descriptor.name] = dictionary[descriptor.name];
                    if (descriptor.rule === 'last') {
                        continue;
                    }

                    delete dictionary[descriptor.name];
                }

                data = [data].concat(extractData(data));
                targetObject[fnName].apply(targetObject, data);
            }
        };

        for (var i = 0, l = eventNameParts.length; i < l; i ++) {
            var evtDescription = getEventDescription(eventNameParts[i]);
            var evtName = evtDescription.name;
            evtDescriptors[evtName] = evtDescription;
            eventNames.push(evtName);
            property.on(evtName, handler, targetObject, null, priority);
        }

    };

    Event.subscribeOn = function(targetObject) {

        var _targetObject = _(targetObject);

        _.forEach(_targetObject.keys(), function(propertyName) {

            var property = targetObject[propertyName];

            if (!property) {
                return;
            }

            if (_.isFunction(property['on'])) {
                var functionNames = _(targetObject).functionsExt();
                for (var i = 0, len = functionNames.length; i < len; i++) {
                    var fnName = functionNames[i];

                    var fnNameForProcessing = fnName.replace(/\s*\+\s*/g, "+").replace(/\s*>\s*/g, ">");

                    var parts = fnNameForProcessing.split(/\s+/);
                    var eventNameParts = parts[1];
                    var field = parts[0];
                    var priority;

                    if (parts.length < 2) {
                        continue;
                    }

                    if (parts.length > 2 && !isNaN(parts[2])) {
                        priority = parts[2];
                    }

                    var eventNamePartsConcatArr = eventNameParts.split("+");
                    var eventNamePartsOrderArr = eventNameParts.split(">");

                    if (eventNamePartsConcatArr.length > 1 && eventNamePartsOrderArr.length > 1) {
                        throw '+ and > can not be used for now together';
                    }

                    if (field == propertyName) {
                        if (eventNamePartsConcatArr.length > 1) {
                            Event.signUpOnEvents(eventNamePartsConcatArr, targetObject,
                                fnName, property, priority, false);
                        } else if (eventNamePartsOrderArr.length > 1) {
                            Event.signUpOnEvents(eventNamePartsOrderArr, targetObject,
                                fnName, property, priority, true);
                        }
                        else {
                            property.on(eventNameParts, targetObject[fnName], targetObject, null, priority);
                        }
                    }


                }
            }
        });
    };

    Event.unSubscribe = function(targetObject) {

        var _targetObject = _(targetObject);

        _.each(_targetObject.keys(), function(propertyName) {

            var propertyObject = targetObject[propertyName];
            if (propertyObject && _.isFunction(propertyObject['removeAllListeners'])) {
                propertyObject.removeAllListeners(targetObject);
            }

        });
    };

    Event.prototype = (function() {
        // Returns the private events object for a given object.
        var getPrivate = function(obj) {
            var _ = ( obj.getPrivate && obj.getPrivate() ) || obj._ || ( obj._ = {} );
            return _.events || ( _.events = {} );
        };

        var EventEntry = function(eventName) {
            this.name = eventName;
            this.listeners = [];
        };

        EventEntry.prototype = {};
        // Get the listener index for a specified function.
        // Returns -1 if not found.
        EventEntry.prototype.getListenerIndex = function(listenerFunction, scope) {
            for (var i = 0, listeners = this.listeners; i < listeners.length; i++) {
                if (listeners[i].fn == listenerFunction &&
                    (listeners[i].scopeObj === scope ||
                        (!listeners[i].scopeObj
                            && (arguments.length == 1 || !scope)
                            )
                        )
                    )
                    return i;
            }
            return -1;
        };

        var proto = {

            once: function(eventName, listenerFunction, scopeObj, listenerData, priority) {

                var rl = _.bind(function(f){
                    this.removeListener(eventName, f, scopeObj)
                }, this);

                var listenerFunctionOnce = function(){
                    listenerFunction.apply(this, _.toArray(arguments));
                    rl(listenerFunctionOnce);
                };

                this.on(eventName, listenerFunctionOnce, scopeObj, listenerData, priority)
            },

            on : function(eventName, listenerFunction, scopeObj, listenerData, priority) {

                if (_.isString(eventName) && eventName.indexOf('+') > 0){
                    var seq = eventName.split('+');
                    Event.signUpOnEvents(seq, this, listenerFunction, this, priority);
                    return;
                }

                // Get the event entry (create it if needed).
                if (_.isArray(eventName)) {
                    var callee = arguments.callee;
                    var self = this;
                    _.each(eventName, function(name) {
                        callee.call(self, name, listenerFunction, scopeObj, listenerData, priority);
                    });

                    return;
                }
                var events = getPrivate(this),
                    event = events[ eventName ] || ( events[ eventName ] = new EventEntry(eventName) );

                if (event.getListenerIndex(listenerFunction, scopeObj) < 0) {
                    // Get the listeners.
                    var listeners = event.listeners;

                    // Fill the scope.
                    if (!scopeObj)
                        scopeObj = this;

                    // Default the priority, if needed.
                    if (isNaN(priority))
                        priority = 10;

                    var me = this;

                    // Create the function to be fired for this listener.
                    var listenerFirer = function(caller, publisherData, stopFn, cancelFn,mutex) {
                        var ev =
                        {
                            name : eventName,
                            sender : this,
                            date: new Date(),
                            caller : caller,
                            data : publisherData,
                            listenerData : listenerData,
                            stop : stopFn,
                            cancel : cancelFn,

                            suspendMain:function(){
                                mutex &&  mutex.lock();
                            },

                            cancelMain:function(){
                                mutex &&  mutex.cancel();
                            },

                            resumeMain:function(){
                                mutex && mutex.unlock();
                            },

                            removeListener : function() {
                                me.removeListener(eventName, listenerFunction, scopeObj);
                            }
                        };

                        var args = [ev].concat(extractData(ev));
                        listenerFunction.apply(scopeObj, args);

                        return ev.data;
                    };
                    listenerFirer.fn = listenerFunction;
                    listenerFirer.scopeObj = scopeObj;
                    listenerFirer.priority = priority;

                    // Search for the right position for this new listener, based on its
                    // priority.
                    for (var i = listeners.length - 1; i >= 0; i--) {
                        // Find the item which should be before the new one.
                        if (listeners[ i ].priority <= priority) {
                            // Insert the listener in the array.
                            listeners.splice(i + 1, 0, listenerFirer);
                            return;
                        }
                    }

                    // If no position has been found (or zero length), put it in
                    // the front of list.
                    listeners.unshift(listenerFirer);
                }

                return this;
            },

            fire : (function() {
                // Create the function that marks the event as stopped.
                var stopped = false;
                var stopEvent = function() {
                    stopped = true;
                };

                // Create the function that marks the event as canceled.
                var canceled = false;
                var cancelEvent = function() {
                    canceled = true;
                };

                return function(eventName, data, caller,mutex) {
                    // Get the event entry.

                    var event = getPrivate(this)[ eventName ];
                    // Save the previous stopped and cancelled states. We may
                    // be nesting fire() calls.
                    var previousStopped = stopped,
                        previousCancelled = canceled;

                    // Reset the stopped and canceled flags.
                    stopped = canceled = false;

                    if (event) {
                        var listeners = event.listeners;

                        if (listeners.length) {
                            // As some listeners may remove themselves from the
                            // event, the original array length is dinamic. So,
                            // let's make a copy of all listeners, so we are
                            // sure we'll call all of them.
                            listeners = listeners.slice(0);

                            // Loop through all listeners.
                            for (var i = 0; i < listeners.length; i++) {
                                // Call the listener, passing the event data.
                                var retData = listeners[i].call(this, caller, data, stopEvent, cancelEvent, mutex);

                                if (typeof retData != 'undefined')
                                    data = retData;

                                // No further calls is stopped or canceled.
                                if (stopped || canceled)
                                    break;
                            }
                        }
                    }

                    var ret = canceled || ( typeof data == 'undefined' ? false : data );

                    // Restore the previous stopped and canceled states.
                    stopped = previousStopped;
                    canceled = previousCancelled;

                    return ret;
                };
            })(),


            fireOnce : function(eventName, data, editor) {
                var ret = this.fire(eventName, data, editor);
                delete getPrivate(this)[ eventName ];
                return ret;
            },


            removeListener : function(eventName, listenerFunction, scopeObj) {
                // Get the event entry.
                var event = getPrivate(this)[ eventName ];

                if (event) {
                    var index = event.getListenerIndex(listenerFunction, scopeObj);
                    if (index >= 0)
                        event.listeners.splice(index, 1);
                }
            },

            removeAllListeners:function(scope) {
                var events = getPrivate(this);
                for (var key in events) {
                    if (events[key].listeners) {
                        if (!scope) {
                            delete events[key].listeners;
                            delete events[key];
                        }
                        else{
                            var listeners = events[key].listeners;
                            var validListeners = [];
                            for(var i=0;i<listeners.length;i++){
                                if(listeners[i].scopeObj != scope){
                                    validListeners.push(listeners[i]);
                                }
                            }

                           events[key].listeners = validListeners;
                        }
                    }


                }
            },


            hasListeners : function(eventName) {
                var event = getPrivate(this)[ eventName ];
                return ( event && event.listeners.length > 0 );
            },

            getListeners: function() {
                var events = getPrivate(this);
                var listeners = [];

                for (var key in events) {
                    var items = events[key].listeners;
                    if (items && items.length > 0) {

                        var listenerDetails = [];

                        for(var i = 0; i < items.length; i++) {
                            var item = items[i];
                            var listener = { name: 'unknown', item: item };

                            if (item.scopeObj && item.scopeObj.bus && item.scopeObj.bus.name) {
                                listener.name = item.scopeObj.bus.name;
                            } else if (item.scopeObj && item.scopeObj.name) {
                                listener.name = item.scopeObj.name;
                            }

                            listenerDetails.push(listener);
                        }

                        listeners.push({ name: key, items: items, count: items.length, listeners: listenerDetails });
                    }
                }

                return listeners;
            },

            getListenersCount: function() {
                var events = getPrivate(this);
                var listenersCount = 0;

                for (var key in events) {
                    if (events[key].listeners) {
                        listenersCount += events[key].listeners.length;
                    }
                }

                return listenersCount;
            }
        };

        proto.addEventListener = proto.on;
        proto.unbind = proto.removeAllListeners;

        return proto;
    })();

    return Event;
});
