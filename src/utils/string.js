/**
 * string.js - string utility extensions.
 *
 * @license Copyright 2011 The xhrdavclient library authors.
 * All rights reserved.
 */

goog.provide('xhrdav.utils.string');
goog.require('goog.array');
goog.require('goog.functions');

/**
 * Letter type enum(use camelize param etc.)
 *
 * @enum {number}
 */
xhrdav.utils.string.LetterType = {
  LOWER: 0,
  UPPER: 1
};

/**
 * Capitalize string
 *
 * Example:
 *   "foo" # => "Foo", "fOO" # => "Foo"
 *
 * @param {string} text Source string.
 * @return {string} Capitalized string.
 */
xhrdav.utils.string.capitalize = function(text) {
  return (text.charAt(0).toUpperCase() + text.slice(1).toLowerCase());
};

/**
 * Dasherize stirng
 *
 * Example:
 *   "puni_puni" # => "puni-puni"
 * @param {string} text Source string.
 * @return {string} converted string.
 */
xhrdav.utils.string.dasherize = function(text) {
  return text.split('_').join('-');
};

/**
 * Camelize string
 *
 * Example:
 *   "foo_bar" #=> "FooBar"
 *   "foo" #=> "Foo"
 * options firstLetter: xhrdav.utils.string.LetterType.LOWER
 *   "foo_bar" #=> "fooBar"
 *   "Foo" #=> "foo"
 * options with_dasherize: true
 *   "content_type" #=> "Content-Type"
 *   "location" #=> "Location"
 *   "Content-Type" #=> "Content-Type"
 *
 * @param {string} text Source string.
 * @param {{firstLetter: xhrdav.utils.string.LetterType, with_dasherize: boolean}} options
 *          ext options
 * @return {string} Camelized string.
 * @see xhrdav.utils.string.LetterType
 */
xhrdav.utils.string.camelize = function(text, options) {
  var ns = xhrdav.utils.string,
      lType = ns.LetterType;
  if (!goog.isDef(options)) options = {};
  if (!goog.isDefAndNotNull(options.firstLetter) ||
    options.firstLetter > lType.UPPER) {
    options.firstLetter = lType.UPPER;
  }

  var str = (!!options.with_dasherize) ? text.split('-').join('_') : text;
  var buf;
  if (options.firstLetter == lType.LOWER) {
    buf = goog.array.map(str.split('_'), function(v, i) {
      return ((i == 0) ? v.toLowerCase() : ns.capitalize(v));
    });
  } else if (options.firstLetter == lType.UPPER) {
    buf = goog.array.map(str.split('_'), function(v, i) {
      return ns.capitalize(v);
    });
  }

  str = (!!options.with_dasherize) ? buf.join('-') : buf.join('');
  str = goog.array.reduce(str.split('/'), function(result, v, i) {
    return (result += (i == 0) ? v : '.' + ns.capitalize(v));
  }, '');

  return str;
};

/* Entry point for closure compiler */
goog.exportSymbol('xhrdav.utils.string.LetterType',
    xhrdav.utils.string.LetterType);
goog.exportSymbol('xhrdav.utils.string.capitalize',
    xhrdav.utils.string.capitalize);
goog.exportSymbol('xhrdav.utils.string.dasherize',
    xhrdav.utils.string.dasherize);
goog.exportSymbol('xhrdav.utils.string.camelize',
    xhrdav.utils.string.camelize);
