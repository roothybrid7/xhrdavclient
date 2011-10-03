/**
 * string.js - string prototype extensions
 *
 * @license Copyright 2011 The xhrdavclient library authors. All rights reserved.
 */

goog.provide('xhrdav.lib.string');
goog.require('goog.array');
goog.require('goog.functions');

/**
 * Letter type enum(use camelize param etc.)
 *
 * @enum {number}
 */
xhrdav.lib.string.LetterType = {
  LOWER: 0,
  UPPER: 1
};

/**
 * Capitalize string
 *
 * @return {string} Capitalized string.
 */
String.prototype.capitalize = function() {
  return (this.charAt(0).toUpperCase() + this.slice(1));
};

/**
 * Camelize string
 *
 * @param {number} firstLetter type(Lower OR Upper)
 * @return {string} Camelized string.
 */
String.prototype.camelize = function(firstLetter) {
  var self = this;
  var lType = xhrdav.lib.string.LetterType;
  if (!goog.isDefAndNotNull(firstLetter) || firstLetter > lType.UPPER) {
    firstLetter = lType.LOWER;
  }

  var str = '';
  if (firstLetter == lType.LOWER) {
    str = goog.array.reduce(this.split('_'), function(result, v, i) {
      return (result += (i == 0) ? v : v.$capitalize());
    }, '');
  } else if (firstLetter == lType.UPPER) {
    str = goog.array.reduce(this.split('_'), function(result, v, i) {
      return result += v.$capitalize();
    }, '');
  }
  str = goog.array.reduce(str.split('/'), function(result, v, i) {
    return (result += (i == 0) ? v : '.' + v.$capitalize());
  }, '');

  return str;
};

/* Entry point for closure compiler */
goog.exportSymbol('xhrdav.lib.string.LetterType', xhrdav.lib.string.LetterType);
goog.exportProperty(String.prototype, 'capitalize',
  String.prototype.capitalize);
goog.exportProperty(String.prototype, 'camelize',
  String.prototype.camelize);

