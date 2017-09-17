var validator = {};
var errors_object = [];
var required = "required";
var type = "type";
var length = "length";
var maximum = "maximum";
var minimum = "minimum";
var pattern = "pattern";

validator.validate = function (inputObject, schema) {
  for (var property in inputObject) {
    //check if required property is set is false, or if required property is not present will consider it as false by default
    var propertyType = schema.properties[property].type.toLowerCase();
    if(schema.properties[property].hasOwnProperty(required) === false || schema.properties[property].required.toString().toLowerCase() === false) {

      //if input does not have this property will just continue looping 
      if(inputObject.hasOwnProperty(property) === false) {
        continue;
      } else if(inputObject.hasOwnProperty(property) === true){
        //ToDo : validate inner object, if the property is present despite being specified as not required.
        validator.validate_type(inputObject, schema, property, propertyType);
      }
    }

    //check if required property is set to true
    else if(schema.properties[property].hasOwnProperty(required) === true || schema.properties[property].required.toString().toLowerCase() === "true") {

      //since required is true we check for property if it is present in input
      if (schema.properties.hasOwnProperty(property) && inputObject.hasOwnProperty(property)) {
        validator.validate_type(inputObject, schema, property, propertyType);
      } else {
        errors_object.push(property+" not found");
      }
    }
  }

  return errors_object;
}

validator.validate_type = function(inputObject, schema, property, propertyType) {
  switch(propertyType) {
    case "string":
      validator.isString(inputObject, schema, property);
      break;
    case "number":
      validator.isNumber(inputObject, schema, property, propertyType);
      break;
    case "integer":
      validator.isNumber(inputObject, schema, property, propertyType);
      break;
    case "boolean":
      validator.isBoolean(inputObject, schema, property);
      break;
    case "array":
      validator.isArray(inputObject, schema, property);
      break;
    case "object":
      validator.isNestedObject(inputObject, schema, property);
    default:
      break;
  }
  return;
}

validator.isString = function(inputObject, schema, property) {
  if(typeof inputObject[property] === "string") {
    //length check
    if(schema.properties[property].hasOwnProperty(length)) {
      if(!(inputObject[property].length <= schema.properties[property].length)) {
        errors_object.push(property+" should be of length "+ schema.properties[property].length +" or lower");
      }   
    }
    //pattern check
    if(schema.properties[property].hasOwnProperty(pattern)) {
      var re = new RegExp(pattern);
      if(!(re.test(inputObject[property]))) {
        errors_object.push(property+" should match "+ schema.properties[property].pattern);
      }
    }
  } else {
    errors_object.push(property+" is not a string");
  }
  return;
}

validator.isNumber = function (inputObject, schema, property, propertyType) {
  //integer
  if(propertyType === "integer" && typeof inputObject[property] === "number") {
    if(!(inputObject[property] >= 0)) {
      errors_object.push(property+" is not an integer");
    }
    //maximum check
    if(schema.properties[property].hasOwnProperty(maximum)) {
      if(!(inputObject[property] <= schema.properties[property].maximum)) {
        errors_object.push(property+" can have a maximum value of "+ schema.properties[property].maximum);
      }   
    }
    //minimum check
    if(schema.properties[property].hasOwnProperty(minimum)) {
      if(!(inputObject[property] >= schema.properties[property].minimum)) {
        errors_object.push(property+" should have a minimum value of "+schema.properties[property].minimum);
      }   
    }

  }

  else if(propertyType === "number" && typeof inputObject[property] === "number") {
   if(!(typeof inputObject[property] === "number")) {
      errors_object.push(property+" is not a number");
    }
    //maximum check
    if(schema.properties[property].hasOwnProperty(maximum)) {
      if(!(inputObject[property] <= schema.properties[property].maximum)) {
        errors_object.push(property+" can have a maximum value of "+ schema.properties[property].maximum);
      }   
    }

    //minimum check
    if(schema.properties[property].hasOwnProperty(minimum)) {
      if(!(inputObject[property] >= schema.properties[property].minimum)) {
        errors_object.push(property+" should have a minimum value of "+schema.properties[property].minimum);
      }   
    } 
  }

  else {
    errors_object.push(property+" is not a number");
  }

  return;
}

validator.isBoolean = function(inputObject, schema, property) {
  if(!(typeof inputObject[property] === "boolean")) {
    errors_object.push(property +" not of type boolean");
  }
  return;
}

validator.isArray = function(inputObject, schema, property) {
  if(Array.isArray(inputObject[property])) {
    var arrayItemType = schema.properties[property].items.type;
    for(var i = 0; i< inputObject[property].length; i++) {
      var element = inputObject[property][i];
      if((typeof element).toString().toLowerCase() === arrayItemType.toString().toLowerCase()) {
        continue;
      } else {
        errors_object.push(property+" does not have array elements of type "+ arrayItemType);
        break;
      }
    }
  } else {
    errors_object.push(property+" is not an array");      
  }
  return;
}

validator.isNestedObject = function(inputObject, schema, property) {
  validator.validate(inputObject[property], schema.properties[property]);
  return;
}

module.exports = validator;