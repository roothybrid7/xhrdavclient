/**
 * string.js - string prototype extensions
 *
 * @license Copyright 2011 The xhrdavclient library authors.
 * All rights reserved.
 */

goog.provide('xhrdav.ext.string');
goog.require('goog.array');
goog.require('goog.functions');

/**
 * Letter type enum(use camelize param etc.)
 *
 * @enum {number}
 */
xhrdav.ext.string.LetterType = {
  LOWER: 0,
  UPPER: 1
};

/**
 * Capitalize string
 *
 * Example:
 *   "foo" # => "Foo", "fOO" # => "Foo"
 *
 * @return {string} Capitalized string.
 */
String.prototype.capitalize = function() {
  return (this.charAt(0).toUpperCase() + this.slice(1).toLowerCase());
};

/**
 * Dasherize stirng
 *
 * Example:
 *   "puni_puni" # => "puni-puni"
 * @return {string} converted string.
 */
String.prototype.dasherize = function() {
  return this.split('_').join('-');
};

/**
 * Camelize string
 *
 * Example:
 *   "foo_bar" #=> "FooBar"
 *   "foo" #=> "Foo"
 * options firstLetter: xhrdav.ext.string.LetterType.LOWER
 *   "foo_bar" #=> "fooBar"
 *   "Foo" #=> "foo"
 * options with_dasherize: true
 *   "content_type" #=> "Content-Type"
 *   "location" #=> "Location"
 *   "Content-Type" #=> "Content-Type"
 *
 * @param {{firstLetter: xhrdav.ext.string.LetterType, with_dasherize: boolean}} options
 *          ext options
 * @return {string} Camelized string.
 * @see xhrdav.ext.string.LetterType
 */
String.prototype.camelize = function(options) {
  var self = this;
  var lType = xhrdav.ext.string.LetterType;
  if (!goog.isDef(options)) options = {};
  if (!goog.isDefAndNotNull(options.firstLetter) ||
    options.firstLetter > lType.UPPER) {
    options.firstLetter = lType.UPPER;
  }

  var str = (!!options.with_dasherize) ? this.split('-').join('_') : this;
  var buf;
  if (options.firstLetter == lType.LOWER) {
    buf = goog.array.map(str.split('_'), function(v, i) {
      return ((i == 0) ? v.toLowerCase() : v.capitalize());
    });
  } else if (options.firstLetter == lType.UPPER) {
    buf = goog.array.map(str.split('_'), function(v, i) {
      return v.capitalize();
    });
  }

  str = (!!options.with_dasherize) ? buf.join('-') : buf.join('');
  str = goog.array.reduce(str.split('/'), function(result, v, i) {
    return (result += (i == 0) ? v : '.' + v.capitalize());
  }, '');

  return str;
};

/* Entry point for closure compiler */
goog.exportSymbol('xhrdav.ext.string.LetterType', xhrdav.ext.string.LetterType);
goog.exportProperty(String.prototype, 'capitalize',
  String.prototype.capitalize);
goog.exportProperty(String.prototype, 'dasherize',
  String.prototype.dasherize);
goog.exportProperty(String.prototype, 'camelize',
  String.prototype.camelize);
