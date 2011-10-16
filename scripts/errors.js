/**
 * error.js - xhrdavclient error object
 *
 * This is a Error object for Request and WebDAV resources.
 *
 * @license Copyright 2011 The xhrdavclient library authors. All rights reserved.
 */

goog.provide('xhrdav.Errors');
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
xhrdav.Errors = function() {
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
xhrdav.Errors.prototype.hasRequest = function() {
  return !goog.object.isEmpty(this.request);
};

/**
 * Has property errors?(Multi-status response content, etc.)
 *
 * @return {boolean} has request error.
 */
xhrdav.Errors.prototype.hasProps = function() {
  return !goog.array.isEmpty(this.props);
};

/**
 * Serialize errors object.
 *
 * @param {xhrdav.Errors} errs Errors object.
 * @return {Object} serialized object(associated array).
 */
xhrdav.Errors.serialize = function(errs) {
//  return {request: errs.request(), props: errs.props()};
  return goog.json.parse(goog.json.serialize(errs));
};

/**
 * Serialize errors object.
 *
 * @return {Object} serialized object(associated array).
 */
xhrdav.Errors.prototype.serialize = function() {
//  return xhrdav.Errors.serialize(this);
  return goog.json.parse(goog.json.serialize(this));
};

/**
 * Clear all errors.
 */
xhrdav.Errors.prototype.clear = function() {
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
xhrdav.Errors.prototype.setRequest = function(requestErr) {
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
xhrdav.Errors.prototype.addProps = function(propsErr) {
  if (goog.object.getCount(propsErr) > 0) {
    goog.array.extend(this.props, propsErr);
  }
};

/* Entry point for closure compiler */
goog.exportSymbol('xhrdav.Errors', xhrdav.Errors);
goog.exportProperty(xhrdav.Errors.prototype, 'hasRequest',
  xhrdav.Errors.prototype.hasRequest);
goog.exportProperty(xhrdav.Errors.prototype, 'hasProps',
  xhrdav.Errors.prototype.hasProps);
goog.exportSymbol('xhrdav.Errors.serialize', xhrdav.Errors.serialize);
goog.exportProperty(xhrdav.Errors.prototype, 'serialize',
  xhrdav.Errors.prototype.serialize);
goog.exportProperty(xhrdav.Errors.prototype, 'clear',
  xhrdav.Errors.prototype.clear);
goog.exportProperty(xhrdav.Errors.prototype, 'setRequest',
  xhrdav.Errors.prototype.setRequest);
goog.exportProperty(xhrdav.Errors.prototype, 'addProps',
  xhrdav.Errors.prototype.addProps);
