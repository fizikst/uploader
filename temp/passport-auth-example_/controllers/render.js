'use strict';

/**
 * Module dependencies.
 */
var log            = require('winston-wrapper')(module);
var config         = require('nconf');

// End of dependencies.


/**
 * Обертка над res.render().
 */
module.exports = function(template, variables) {
  return function (req, res) {
    res.render(template, variables);
  };
};