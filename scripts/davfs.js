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
 * @private
 * @constructor
 */
xhrdav.lib.DavFs = function() {
};
goog.addSingletonGetter(xhrdav.lib.DavFs);

/**
 * Init with calling low-level client API.
 *
 * Example: Create WebDAV Client Instance.
 *   var fs = xhrdav.lib.DavFs.getInstance().initialize();
 *   => fs#client_ = new xhrdav.lib.Client();
 *   # Reinitialize
 *   fs.initialize();
 *
 * @param {Object=} options davclient Parameters(options: scheme, domain, port)
 * @return {xhrdav.lib.DavFs}
 */
xhrdav.lib.DavFs.prototype.initialize = function(options) {
  var config = xhrdav.lib.Config.getInstance();
  /** @type {xhrdav.lib.Client} */
  this.client_ = new xhrdav.lib.Client(options);
  this.client_.setXmlParseFunction(
    goog.getObjectByName(config.xmlParseFuncObj));
  return this;
};

/**
 * Get and Create Connection xhrdav.lib.Client.
 *
 * @param {boolean=} refresh Refresh connection object.
 * @param {Object=} options URI Parameters(options: scheme, domain, port)
 * @return {xhrdav.lib.Client}
 */
xhrdav.lib.DavFs.prototype.connection = function(refresh, options) {
  if (refresh) {
    var config = xhrdav.lib.Config.getInstance();
    this.client_ = new xhrdav.lib.Client(options);
    this.client_.setXmlParseFunction(
      goog.getObjectByName(config.xmlParseFuncObj));
  }
  return this.client_;
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
xhrdav.lib.DavFs.prototype.responseHandler_ = function(
  handler, processHandler, path, statusCode, content, headers) {
  var httpStatus = xhrdav.lib.HttpStatus;
  var args = processHandler(path, statusCode, content, headers);
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
xhrdav.lib.DavFs.prototype.simpleErrorHandler_ = function(
  path, statusCode, content, headers) {
  var config = xhrdav.lib.Config.getInstance();
  var httpStatus = xhrdav.lib.HttpStatus;
  var errors = config.getErrors();

  errors.clear();
  if (!goog.array.contains(
    [httpStatus.OK, httpStatus.CREATED, httpStatus.NO_CONTENT],
    statusCode)) {
    errors.setRequest({msg: httpStatus.text[statusCode], path: path});
  }
  return (errors.hasRequest()) ? errors : null;
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
    goog.bind(this.responseHandler_, this, handler, this.simpleErrorHandler_, path),
    options, debugHandler);
};

/* Entry Point for closure compiler */
goog.exportSymbol('xhrdav.lib.DavFs.getInstance', xhrdav.lib.DavFs.getInstance);
goog.exportProperty(xhrdav.lib.DavFs.prototype, 'initialize',
  xhrdav.lib.DavFs.prototype.initialize);
goog.exportProperty(xhrdav.lib.DavFs.prototype, 'connection',
  xhrdav.lib.DavFs.prototype.connection);
goog.exportProperty(xhrdav.lib.DavFs.prototype, 'listDir',
  xhrdav.lib.DavFs.prototype.listDir);
goog.exportProperty(xhrdav.lib.DavFs.prototype, 'write',
  xhrdav.lib.DavFs.prototype.write);

