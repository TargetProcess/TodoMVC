define([
    "tau/libs/underscore"
    ,"tau/libs/jsonselect"
], function(_,JSONSelect) {


    var cloneDeep = function(obj){
        if (_.isArray(obj)) {
            return _.map(obj, cloneDeep);
        } else if (typeof obj === 'object' && obj !== null) {
            var result = {};
            _.each(obj, function (value, key) {
                result[key] = cloneDeep(value);
            });
            return result;
        } else {
            return obj;
        }
    };

    var mergeDeep = function(target) {
      var srcs = Array.prototype.slice.call(arguments, 1);

      if ('boolean' === typeof srcs[srcs.length-1]) {
        var xtraDeep = srcs.pop();
      }

      for (var i=0; i < srcs.length; i++) {
        var src = srcs[i];

        // walk src.
        _.each(src, function(value, key) {
          var tval = target[key];
          // no target
          if (tval === undefined) {
            target[key] = value;
          // merge arrays
          } if (xtraDeep) {
            if (Array.isArray(value) && Array.isArray(tval)) {
              target[key] = tval.concat(value);
            // merge hashes
            } else if ('object' === typeof value && 'object' === typeof tval) {
              mergeDeep(tval, value);
            // shove src onto target value array
            } else if (Array.isArray(tval)) {
              tval.append(value);
            // join into an array
            } else {
              target[key] = [tval, value];
            }
          } else { // !xtraDeep
            if ('object' === typeof value && 'object' === typeof tval) {
              mergeDeep(tval, value, xtraDeep);
            } else {
              target[key] = value;
            }
          }
        })
      };

      return target;
    };

    _.mixin({
        /**
         * Extension for _.keys method.
         * Retrieve all the names of properties from the object's prototype chain.
         * @param obj
         */
        keysExt : function(obj) {
            if (_.isArray(obj)) return _.keys(obj);

            var keys = [];
            for (var key in obj) {
                keys.push(key);
            }
            return keys;
        },

        findComplexField: function(fields, name) {
            var field = null;
            var self = this;
            _.each(fields, function(fld) {
                if (self.isSimple(fld)) {
                    return;
                }

                if (!fld.hasOwnProperty(name)) {
                    return;
                }
                field = fld;
            });

            return field;
        },

        concat:function(array){
            return _.flatten(_.compact(array));
        },

        getFieldName : function(field) {
            if (this.isSimple(field)) {
                return field;
            }

            var keys = _.select(_.keys(field), function(key) {
                return key !== "list";
            });

            if (keys.length > 1 || keys.length === 0) {
                throw 'Only one reference or list should be defined';
            }

            return keys[0];
        },

        isSimple: function(field) {
            return _.isString(field);
        },

        mergeFields : function(masterFields, fields, config) {

            var self = this;
            var appendMethod = config && config.prependFields ? "unshift" : "push";

            _.each(fields, function(field) {

                if (masterFields === field) {
                    return;
                }

                if (self.isSimple(field)) {
                    var masterEqs = _.select(masterFields, function(fld) {
                        return fld === field;
                    });
                    if (masterEqs.length === 0) {
                        masterFields[appendMethod](field);
                    }
                    return;
                }

                var fieldName = self.getFieldName(field);
                var masterField = self.findComplexField(masterFields, fieldName);

                if (masterField === null) {
                    masterFields[appendMethod](field);
                    return;
                }

                var toBeIncludedFields = field[fieldName];
                var masterFieldsInObj = masterField[fieldName];

                self.mergeFields(masterFieldsInObj, toBeIncludedFields);
            });

            return masterFields;
        },

        mergeArrayObjects : function(destination, source, config) {
            _.each(_(destination).keys(), function(key) {

                if (!_.isArray(destination[key])) {
                    return;
                }

                if (!_.isArray(source[key])) {
                    return;
                }

                if (config && _.isArray(config) && _(config).indexOf(key) < 0) {
                    return;
                }

                destination[key] = destination[key].concat(source[key]);
            });
        },

        /**
         * Extension for _.functions method.
         * Returns a sorted list of the names of every method in a target object's prototype chain.
         * @param targetObject
         */
        functionsExt : function(obj) {
            return _.filter(_.keysExt(obj),
                function(key) {
                    return _.isFunction(obj[key]);
                }).sort();
        },

        groupByComplex:function(arr, keyFunction) {
            var groupped = [];
            var keys = {};

            _(arr).each(function(val) {
                var key = keyFunction(val);
                if (!keys.hasOwnProperty(key)) {
                    var group = {
                        key:key,
                        items:[]
                    };
                    groupped.push(group);
                    keys[key] = group;
                }

                keys[key].items.push(val);
            });

            return groupped;
        },

        /**
         * Access to nested object data by keys like "nested.nestedKey.subnested"
         *
         * @param data
         * @param key
         */
        complexKey: function(object, key){

            var val = undefined;
            var keys = key.split('.');

            if (keys.length === 1) {
                return object[key];
            }

            _.forEach(keys, function(innerKey){
                val = object = object[innerKey];
                if (_.isUndefined(val) === true) {
                    return false;
                }
            });

            return val;
        },


        jsonSelect: function(jsonObject, selector) {
            return JSONSelect.match(selector, jsonObject);
        },

        inArray: function(value, array){
            return _.indexOf(array, value) > -1;
        },

        asString: function(val){
            return (new String(val || '')).toString();
        },

        toCamelCase: function(str) {
            var car = str.substr(0, 1);
            var cdr = str.substr(1);
            return (car.toLowerCase() + cdr);
        },

        UUID: function() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
        },

        cloneDeep: cloneDeep,
        deepClone: cloneDeep,

        mergeDeep: mergeDeep,
        deepMerge: mergeDeep,

        fixedPoint: function(x) { return x; }

    });

    // See http://www.irt.org/script/1031.htm
    _.MIN_INT = -9007199254740992;
    _.MAX_INT = -_.MIN_INT;

    return _;
});
