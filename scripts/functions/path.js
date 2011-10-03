/**
 * path.js - modify path string function.
 *
 * @license Copyright 2011 The xhrdavclient library authors. All rights reserved.
 */

goog.provide('xhrdav.lib.functions.path');
goog.require('goog.string');
goog.require('goog.string.path');
goog.require('goog.array');

/**
 * Remove last slash from path string.
 *
 * @param {string} path
 * @return {string} converted new path.
 */
xhrdav.lib.functions.path.removeLastSlash = function(path) {
  var converted;
  if (path.match(/^(.+)\/$/)) {
    converted = RegExp.$1;
  } else {
    converted = path;
  } // Preserve GET
  return converted;
};

/**
 * Add last slash to path string.
 *
 * @param {string} path
 * @return {string} converted new path.
 */
xhrdav.lib.functions.path.addLastSlash = function(path) {
  var converted = goog.string.endsWith(path, '/') ? path : path + '/';
  return converted;
};

/* Entry point for closure compiler */
goog.exportSymbol('xhrdav.lib.functions.path', xhrdav.lib.functions.path);
goog.exportSymbol('xhrdav.lib.functions.path.removeLastSlash',
  xhrdav.lib.functions.path.removeLastSlash);
goog.exportSymbol('xhrdav.lib.functions.path.addLastSlash',
  xhrdav.lib.functions.path.addLastSlash);

