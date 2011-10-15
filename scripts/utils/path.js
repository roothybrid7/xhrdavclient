/**
 * path.js - modify path string function.
 *
 * @license Copyright 2011 The xhrdavclient library authors. All rights reserved.
 */

goog.provide('xhrdav.lib.utils.path');
goog.require('goog.string');
goog.require('goog.string.path');
goog.require('goog.array');

/**
 * Remove last slash from path string.
 *
 * @param {string} path
 * @return {string} converted new path.
 */
xhrdav.lib.utils.path.removeLastSlash = function(path) {
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
xhrdav.lib.utils.path.addLastSlash = function(path) {
  var converted = goog.string.endsWith(path, '/') ? path : path + '/';
  return converted;
};

/**
 * Split path.
 *
 * @param {string} path
 * @return {Array.<string>} split path list.
 */
xhrdav.lib.utils.path.split = function(path) {
  var pathlist = goog.array.filter(path.split('/'), function(v, i) {
    return (!goog.string.isEmptySafe(v));
  });
  if (pathlist.length == 0) pathlist.push('/');
  return pathlist;
};

/* Entry point for closure compiler */
goog.exportSymbol('xhrdav.lib.utils.path', xhrdav.lib.utils.path);
goog.exportSymbol('xhrdav.lib.utils.path.removeLastSlash',
  xhrdav.lib.utils.path.removeLastSlash);
goog.exportSymbol('xhrdav.lib.utils.path.addLastSlash',
  xhrdav.lib.utils.path.addLastSlash);
goog.exportSymbol('xhrdav.lib.utils.path.split',
  xhrdav.lib.utils.path.split);

