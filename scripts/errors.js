/**
 * error.js - xhrdavclient error object
 *
 * @license Copyright 2011 The xhrdavclient library authors. All rights reserved.
 */

goog.provide('xhrdav.lib.Errors');
goog.require('goog.array');
goog.require('goog.object');

/**
 * xhrdavclient error object
 *
 * Structure: Json/Hash repr
 *    {request: {msg: 'Forbidden', path: '/mydav/foo/'},
 *     props: [
 *       {msg: 'Not Found', path: '/mydav/foo/a.png'},
 *       {msg: 'Locked', path: '/mydav/foo/b.txt'}
 *     ]}
 *
 * @private
 * @constructor
 */
xhrdav.lib.Errors = function() {
  this.request_ = {};
  this.props_ = [];
};
goog.addSingletonGetter(xhrdav.lib.Errors);

/**
 * Has request error?
 *
 * @return {boolean} has request error.
 */
xhrdav.lib.Errors.prototype.hasRequest = function() {
  return !goog.object.isEmpty(this.request_);
};

/**
 * Has property errors?(Multi-status response content, etc.)
 *
 * @return {boolean} has request error.
 */
xhrdav.lib.Errors.prototype.hasProps = function() {
  return !goog.array.isEmpty(this.props_);
};

/**
 * Serialize errors object.
 *
 * @param {xhrdav.lib.Errors} errs Errors object.
 * @return {Object} serialized object(associated array).
 */
xhrdav.lib.Errors.serialize = function(errs) {
  return {request: errs.request(), props: errs.props()};
};

/**
 * Serialize errors object.
 *
 * @return {Object} serialized object(associated array).
 */
xhrdav.lib.Errors.prototype.serialize = function() {
  return xhrdav.lib.Errors.serialize(this);
};

/**
 * Clear all errors.
 */
xhrdav.lib.Errors.prototype.clear = function() {
  goog.object.clear(this.request_);
  goog.array.clear(this.props_);
};

/**
 * Get request error.
 *
 * Structure:
 *    {msg: 'Forbidden', path: '/mydav/foo/'}
 *
 * @return {Object} Request error.
 */
xhrdav.lib.Errors.prototype.request = function() {
  return this.request_;
};

/**
 * Set request error.
 *
 * @param {Object=} requestErr Request error object(associate array).
 */
xhrdav.lib.Errors.prototype.setRequest = function(requestErr) {
  if (goog.object.getCount(requestErr) > 0) this.request_ = requestErr;
};

/**
 * Get property errors.
 *
 * Structure:
 *     [{msg: 'Not Found', path: '/mydav/foo/a.png'},
 *      {msg: 'Locked', path: '/mydav/foo/b.txt'}]
 *
 * @return {Array} property errors.
 */
xhrdav.lib.Errors.prototype.props = function() {
  return this.props_;
};

/**
 * Add property error.
 *
 * @param {Object} propsErr property error.
 */
xhrdav.lib.Errors.prototype.addProps = function(propsErr) {
  if (goog.object.getCount(propsErr) > 0) this.props_ = propsErr;
};

/* Entry point for closure compiler */
goog.exportSymbol('xhrdav.lib.Errors.getInstance', xhrdav.lib.Errors.getInstance);
goog.exportProperty(xhrdav.lib.Errors.prototype, 'hasRequest',
  xhrdav.lib.Errors.prototype.hasRequest);
goog.exportProperty(xhrdav.lib.Errors.prototype, 'hasProps',
  xhrdav.lib.Errors.prototype.hasProps);
goog.exportSymbol('xhrdav.lib.Errors.serialize', xhrdav.lib.Errors.serialize);
goog.exportProperty(xhrdav.lib.Errors.prototype, 'serialize',
  xhrdav.lib.Errors.prototype.serialize);
goog.exportProperty(xhrdav.lib.Errors.prototype, 'clear',
  xhrdav.lib.Errors.prototype.clear);
goog.exportProperty(xhrdav.lib.Errors.prototype, 'request',
  xhrdav.lib.Errors.prototype.request);
goog.exportProperty(xhrdav.lib.Errors.prototype, 'setRequest',
  xhrdav.lib.Errors.prototype.setRequest);
goog.exportProperty(xhrdav.lib.Errors.prototype, 'props',
  xhrdav.lib.Errors.prototype.props);
goog.exportProperty(xhrdav.lib.Errors.prototype, 'addProps',
  xhrdav.lib.Errors.prototype.addProps);

