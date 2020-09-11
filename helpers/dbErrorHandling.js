'use strict';

/*
    Get Unique error field name
*/

const uniqueMessage = (error) => {
  let output;
  try {
    let fieldName = error.message.split('.$')[1];
    field = field.split('dub key')[0];
    field = field.substring(0, field.lastIndexOf('_'));
    req.flash('error', [
      {
        message: `An account with this ${field} alredy exist`,
      },
    ]);

    output =
      fieldName.charAt(0).ToUpperCase() + field.slice(1) + 'alredy exists';
  } catch (err) {
    output = 'alredy exists';
    console.error(err);
  }

  return output;
};

/*
  Get the error message from error object
*/

exports.errorHandler = (error) => {
  let message = '';

  if (error.code) {
    switch (error.code) {
      case 400:
        console.log(error.response.body);
        break;
      case 403:
        console.log(error.response.body);
        break;
      case 11000:
      case 11001:
        message = uniqueMessage(error);
        break;
      default:
        message = 'Something went wrong';
        console.log(error)
    }
  } else {
    for (let errorName in error.errorors) {
      if (error.errorors[errorName].message) {
        message = error.errorors[errorName].message;
      }
    }
  }
  return message;
};
