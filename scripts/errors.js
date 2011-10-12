/**
 * error.js - xhrdavclient error object
 *
 * This is a Error object for Request and WebDAV resources.
 *
 * @license Copyright 2011 The xhrdavclient library authors. All rights reserved.
 */

goog.provide('xhrdav.lib.Errors');
goog.require('goog.array');
goog.require('goog.object');
goog.require('goog.json');

/**
 * xhrdavclient error object
 *
 * Structure: Json/Hash repr
 *    {request: {message: 'Forbidden', path: '/mydav/foo/'},
 *     props: [
 *       {message: 'Not Found', path: '/mydav/foo/a.png'},
 *       {message: 'Locked', path: '/mydav/foo/b.txt'}
 *     ]}
 *
 * @constructor
 */
xhrdav.lib.Errors = function() {
  /** @type {Object} */
  this.request = {};
  /** @type {Array.<Object>} */
  this.props = [];
};

/**
 * Has request error?
 *
 * @return {boolean} has request error.
 */
xhrdav.lib.Errors.prototype.hasRequest = function() {
  return !goog.object.isEmpty(this.request);
};

/**
 * Has property errors?(Multi-status response content, etc.)
 *
 * @return {boolean} has request error.
 */
xhrdav.lib.Errors.prototype.hasProps = function() {
  return !goog.array.isEmpty(this.props);
};

/**
 * Serialize errors object.
 *
 * @param {xhrdav.lib.Errors} errs Errors object.
 * @return {Object} serialized object(associated array).
 */
xhrdav.lib.Errors.serialize = function(errs) {
//  return {request: errs.request(), props: errs.props()};
  return goog.json.parse(goog.json.serialize(errs));
};

/**
 * Serialize errors object.
 *
 * @return {Object} serialized object(associated array).
 */
xhrdav.lib.Errors.prototype.serialize = function() {
//  return xhrdav.lib.Errors.serialize(this);
  return goog.json.parse(goog.json.serialize(this));
};

/**
 * Clear all errors.
 */
xhrdav.lib.Errors.prototype.clear = function() {
  goog.object.clear(this.request);
  goog.array.clear(this.props);
};

/**
 * Set request error.
 *
 * Structure:
 *    {status: 403,
 *     message: 'Forbidden', path: '/mydav/foo/'}
 *
 * @param {Object=} requestErr Request error object(associate array).
 */
xhrdav.lib.Errors.prototype.setRequest = function(requestErr) {
  if (goog.object.getCount(requestErr) > 0) this.request = requestErr;
};

/**
 * Add property error.
 *
 * Structure:
 *     [{status: 404, message: 'Not Found', path: '/mydav/foo/a.png'},
 *      {status: 423, message: 'Locked', path: '/mydav/foo/b.txt'}]
 *
 * @param {Object} propsErr property error.
 */
xhrdav.lib.Errors.prototype.addProps = function(propsErr) {
  if (goog.object.getCount(propsErr) > 0) {
    goog.array.extend(this.props, propsErr);
  }
};

/* Entry point for closure compiler */
goog.exportSymbol('xhrdav.lib.Errors', xhrdav.lib.Errors);
goog.exportProperty(xhrdav.lib.Errors.prototype, 'hasRequest',
  xhrdav.lib.Errors.prototype.hasRequest);
goog.exportProperty(xhrdav.lib.Errors.prototype, 'hasProps',
  xhrdav.lib.Errors.prototype.hasProps);
goog.exportSymbol('xhrdav.lib.Errors.serialize', xhrdav.lib.Errors.serialize);
goog.exportProperty(xhrdav.lib.Errors.prototype, 'serialize',
  xhrdav.lib.Errors.prototype.serialize);
goog.exportProperty(xhrdav.lib.Errors.prototype, 'clear',
  xhrdav.lib.Errors.prototype.clear);
goog.exportProperty(xhrdav.lib.Errors.prototype, 'setRequest',
  xhrdav.lib.Errors.prototype.setRequest);
goog.exportProperty(xhrdav.lib.Errors.prototype, 'addProps',
  xhrdav.lib.Errors.prototype.addProps);

