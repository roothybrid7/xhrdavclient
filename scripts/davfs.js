/**
 * davfs.js - XHTTPRequest High-level WebDAV Client API.
 *
 * @license Copyright 2011 The xhrdavclient library authors. All rights reserved.
 */

goog.provide('xhrdav.lib.DavFs');
goog.require('xhrdav.lib.Config');
goog.require('xhrdav.lib.Client');

/**
 * high-level WebDAV client API Singleton
 *
 * @constructor
 */
xhrdav.lib.DavFs = function() {
};
goog.addSingletonGetter(xhrdav.lib.DavFs);

xhrdav.lib.DavFs.Instance = xhrdav.lib.DavFs.getInstance();

/**
 * Init with calling low-level client API.
 *
 * @param {Object=} options URI Parameters(options: scheme, domain, port)
 * @return {xhrdav.lib.DavFs}
 */
xhrdav.lib.DavFs.prototype.initialize = function(options) {
  /** @type {xhrdav.lib.Client} */
  this.client_ = new xhrdav.lib.Client(options);
  return this;
};

/**
 * listing collection
 *
 * @param {string} path
 * @param {Function} handler
 * @param {Object=} options
 * @param {Function=} debugHandler
 */
// TODO: 結果をcacheに格納、cacheにあったらcacheを返す
// TODO: Cacheはpathごとにもつ
//    cache['/'] = goog.ds.XmlDataSource(response, null, 'root');
//    cache['/foo'] = goog.ds.XmlDataSource(response, rootTree, name);
xhrdav.lib.DavFs.prototype.listDir = function(path, handler, options, debugHandler) {
  if (!goog.isDefAndNotNull(options)) options = {};
  options.depth = 1;  // listing directory
  this.client_.propfind(path, handler, options, debugHandler);
};

/**
 * WebDAV Response process handler(callback)
 *
 * @private
 * @param {Function} handler callback client.
 * @param {Function} processHandler
 * @param {number} statusCode HTTP Status code.
 * @param {Object} content Response body data.
 * @param {Object} headers Response headers.
 */
xhrdav.lib.DavFs.prototype.responseHandler_ = function(handler, processHandler, statusCode, content, headers) {
  var httpStatus = xhrdav.lib.HttpStatus;
  var args = processHandler(statusCode, content, headers);
  handler(args);
};

/**
 * Error Handler
 *
 * @private
 * @param {number} statusCode HTTP Status code.
 * @param {Object} content Response body data.
 * @param {Object} headers Response headers.
 * @return {Array} Errors array.
 */
xhrdav.lib.DavFs.prototype.simpleErrorHandler_ = function(statusCode, content, headers) {
  var httpStatus = xhrdav.lib.HttpStatus;
  var errors = [];
  if (!goog.array.contains(
    [httpStatus.OK, httpStatus.CREATED, httpStatus.NO_CONTENT],
    statusCode)) {
    errors.push(httpStatus.text[statusCode]);
  }
  return errors;
};

/**
 * Write data to WebDAV server
 *
 * @param {string} path upload file path.
 * @param {Object} content file content.
 * @param {Function(Array)} handler callback handler function.
 * @param {Object=} options Request options.
 * @param {Function=} debugHandler
 */
xhrdav.lib.DavFs.prototype.write = function(
  path, content, handler, options, debugHandler) {
  this.client_.put(path, content,
    goog.bind(this.responseHandler_, this, handler, this.simpleErrorHandler_),
    options, debugHandler);
};

/* Entry Point for closure compiler "ADVANCED_OPTIMIZATIONS" option */
goog.exportSymbol('xhrdav.lib.DavFs.getInstance', xhrdav.lib.DavFs);
goog.exportProperty(xhrdav.lib.DavFs.prototype, 'initialize',
  xhrdav.lib.DavFs.prototype.initialize);
goog.exportProperty(xhrdav.lib.DavFs.prototype, 'listDir',
  xhrdav.lib.DavFs.prototype.listDir);
goog.exportProperty(xhrdav.lib.DavFs.prototype, 'write',
  xhrdav.lib.DavFs.prototype.write);

