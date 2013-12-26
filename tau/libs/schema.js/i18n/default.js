define(function(require, exports, module) {
module.exports = {
	validation_error: {
	  de: function() {
		return "Diese Instanz ist nicht gültig";
	  },
	  en: function() {
		return "This instance is not valid";
	  }
	},
	validation_error_type: {
	  de: function() {
		return "Ungültiger Typ";
	  },
	  en: function() {
		return "Invalid type";
	  }
	},
	validation_error_minLength: {
	  de: function(validation) {
		return "Der Text muss mindestens " + validation.schema.minLength + " Zeichen haben.";
	  },
	  en: function(validation) {
		return "Text must be longer than " + validation.schema.minLength + " symbols";
	  }
	},
    validation_error_maxLength: {
      en: function(validation) {
        return "Text must be shorter than " + validation.schema.maxLength + " symbols";
      }
    },
    validation_error_minimum: {
      en: function(validation) {
        return "Number must be greater than " + validation.schema.minimum + "";
      }
    },

    validation_error_maximum: {
      en: function() {
        return "Please, enter a reasonable number.";
      }
    },
    validation_error_pattern: {
      en: function() {
        return "Incorrect value";
      }
    },
    validation_error_optional: {
      en: function() {
        return "Required field";
      }
    }


};
});
