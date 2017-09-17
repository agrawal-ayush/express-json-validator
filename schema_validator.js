"use strict"

var validator = require('./validate/validator.js');

module.exports = function schema_validator(schema) {
	return (req, res, next) => {
		var valid = validator.validate(Object.assign({},req.body), schema);
		if(valid.length == 0)
			next();
		else
			console.log(valid);
	}
}
