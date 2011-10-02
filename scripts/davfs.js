/**
 * davfs.js - XHTTPRequest High-level WebDAV Client API.
 *
 * @license Copyright 2011 The xhrdavclient library authors. All rights reserved.
 */

goog.provide('xhrdav.lib.DavFs');
goog.require('xhrdav.lib.Config');
goog.require('xhrdav.lib.Client');
goog.require('goog.net.XhrManager');
goog.require('xhrdav.lib.ResourceBuilder');

/**
 * high-level WebDAV client API Singleton
 *
 * @private
 * @constructor
 */
xhrdav.lib.DavFs = function() {
  /** @type {goog.net.XhrManager} */
  this.xhrMgr_ = null;
  /** @type {xhrdav.lib.Client} */
  this.client_ = null;

  this.initXhrMgr_();
};
goog.addSingletonGetter(xhrdav.lib.DavFs);

/**
 *  Init XhrManager with config.
 *
 * @private
 */
xhrdav.lib.DavFs.prototype.initXhrMgr_ = function() {
  var config = xhrdav.lib.Config.getInstance();
  var configXhrMgr = config.getXhrMgrConfig();

  if (goog.isDefAndNotNull(configXhrMgr) && !goog.object.isEmpty(configXhrMgr)) {
    this.xhrMgr_ = new goog.net.XhrManager(
        configXhrMgr.maxRetries || 1,
        configXhrMgr.headers || {},
        configXhrMgr.minCount || 1,
        configXhrMgr.maxCount || 10,
        configXhrMgr.timeoutInterval || 0);
  } else {
    this.xhrMgr_ = new goog.net.XhrManager();
  }
};

/**
 * Init with calling low-level client API.
 *
 * @param {Object=} opt_uri davclient Parameters(options: scheme, domain, port)
 * @return {xhrdav.lib.DavFs}
 */
xhrdav.lib.DavFs.prototype.initialize = function(opt_uri) {
  var config = xhrdav.lib.Config.getInstance();
  this.client_ = new xhrdav.lib.Client(opt_uri);
  this.client_.setXmlParseFunction(
    goog.getObjectByName(config.xmlParseFuncObj));
  return this;
};

/**
 * Get and Create Connection xhrdav.lib.Client.
 *
 * @param {boolean=} refresh Refresh connection object.
 * @param {Object=} opt_uri URI Parameters(options: scheme, domain, port)
 * @return {xhrdav.lib.Client}
 * @see #initialize
 */
xhrdav.lib.DavFs.prototype.getConnection = function(refresh, opt_uri) {
  if (!!refresh || goog.isNull(this.client_)) this.initialize(opt_uri);
  return this.client_;
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
  handler, processHandler, path, context, statusCode, content, headers) {
  var httpStatus = xhrdav.lib.HttpStatus;
  var args = processHandler(path, statusCode, content, headers);
  if (goog.isDefAndNotNull(context) && goog.isObject(context)) {
    handler.apply(context, args);
  } else {
    handler(args);
  }
};

/**
 * Error Handler
 *
 * @private
 * @param {string} path HTTP Requst path.
 * @param {number} statusCode HTTP Status code.
 * @param {Object} content Response body data.
 * @param {Object} headers Response headers.
 * @return {Array.<xhrdav.lib.Errors, string=>} Errors, new Location
 * @see xhrdav.lib.Errors
 */
xhrdav.lib.DavFs.prototype.simpleErrorHandler_ = function(
  path, statusCode, content, headers) {
  var config = xhrdav.lib.Config.getInstance();
  var httpStatus = xhrdav.lib.HttpStatus;
  var errors = new xhrdav.lib.Errors();

  var args = [];
  if (!goog.array.contains(
    [httpStatus.OK, httpStatus.CREATED, httpStatus.NO_CONTENT],
    statusCode)) {
    errors.setRequest({message: httpStatus.text[statusCode], path: path});
  }
  args.push(errors);
  if (statusCode == httpStatus.CREATED) {
    args.push(headers['Location']);
  }
  return args;
};

/**
 * Build Directory tree from multistatus
 *
 * @param {Object} content  multistatus response data.
 * @return {xhrdav.lib.Resource}  converted object for WebDAV resources.
 * @see xhrdav.lib.ResourceBuilder.createCollection
 */
xhrdav.lib.DavFs.getListDirFromMultistatus = function(content) {
  var builder = xhrdav.lib.ResourceBuilder.createCollection(content);
  return builder.serialize();
};

/**
 * Processing Reponse Multi-Status Data
 *
 * @param {string} path HTTP Request path.
 * @param {number} statusCode HTTP Status code.
 * @param {Object} content Response body data.
 * @param {Object} headers Response headers.
 * @return {Array.<xhrdav.lib.Errors, xhrdav.lib.Response>}
 * @see xhrdav.lib.Errors
 */
xhrdav.lib.DavFs.prototype.processMultistatus_ = function(
  path, statusCode, content, headers) {
  var config = xhrdav.lib.Config.getInstance();
  var httpStatus = xhrdav.lib.HttpStatus;
  var errors = new xhrdav.lib.Errors();

  var args = [];
  if (statusCode == httpStatus.MULTI_STATUS) {
    content = xhrdav.lib.DavFs.getListDirFromMultistatus(content);
  } else {
    errors.setRequest({message: httpStatus.text[statusCode], path: path});
  }
  args.push(errors);
  args.push(content);

  return args;
};

/**
 * listing collection
 *
 * @param {string} path
 * @param {Function} handler callback handler function.
 * @param {Object=} opt_headers Request headers options.
 * @param {Object=} opt_params  Request query paramters.
 * @param {Object=} context Callback scope.
 * @param {Function=} debugHandler
 */
xhrdav.lib.DavFs.prototype.listDir = function(
  path, handler, opt_headers, opt_params, context, debugHandler) {
  var opt_request = {
    xhrId: goog.string.createUniqueString(), xhrMgr: this.xhrMgr_,
    headers: opt_headers || {}, query: opt_params || {}};

  opt_request.headers['Depth'] = 1;  // listing directory
  this.client_.propfind(path,
    goog.bind(this.responseHandler_, this,
      handler, this.processMultistatus_, path, context),
    opt_request, debugHandler);
};

/**
 * Create directory (collection)
 *
 * @param {string} path Create dierctory path.
 * @param {Function} handler callback handler function.
 * @param {Object=} opt_headers Request headers options.
 * @param {Object=} opt_params  Request query paramters.
 * @param {Object=} context Callback scope.
 * @param {Function=} debugHandler
 */
xhrdav.lib.DavFs.prototype.mkdir = function(
  path, handler, opt_headers, opt_params, context, debugHandler) {
  var opt_request = {
    xhrId: goog.string.createUniqueString(), xhrMgr: this.xhrMgr_,
    headers: opt_headers || {}, query: opt_params || {}};

  this.client_.mkcol(path,
    goog.bind(this.responseHandler_, this,
      handler, this.simpleErrorHandler_, path, context),
    opt_request, debugHandler);
};

/**
 * Write data to WebDAV server
 *
 * @param {string} path upload file path.
 * @param {Object} content file content.
 * @param {Function} handler callback handler function.
 * @param {Object=} opt_headers Request headers options.
 * @param {Object=} opt_params  Request query paramters.
 * @param {Object=} context Callback scope.
 * @param {Function=} debugHandler
 */
xhrdav.lib.DavFs.prototype.write = function(
  path, content, handler, opt_headers, opt_params, context, debugHandler) {
  var opt_request = {
    xhrId: goog.string.createUniqueString(), xhrMgr: this.xhrMgr_,
    headers: opt_headers || {}, query: opt_params || {}};
  this.client_.put(path, content,
    goog.bind(this.responseHandler_, this,
      handler, this.simpleErrorHandler_, path, context),
    opt_request, debugHandler);
};

/* Entry Point for closure compiler */
goog.exportSymbol('xhrdav.lib.DavFs.getInstance', xhrdav.lib.DavFs.getInstance);
goog.exportProperty(xhrdav.lib.DavFs.prototype, 'initialize',
  xhrdav.lib.DavFs.prototype.initialize);
goog.exportProperty(xhrdav.lib.DavFs.prototype, 'getConnection',
  xhrdav.lib.DavFs.prototype.getConnection);
goog.exportSymbol('xhrdav.lib.DavFs.getListDirFromMultistatus',
  xhrdav.lib.DavFs.getListDirFromMultistatus);
goog.exportProperty(xhrdav.lib.DavFs.prototype, 'listDir',
  xhrdav.lib.DavFs.prototype.listDir);
goog.exportProperty(xhrdav.lib.DavFs.prototype, 'write',
  xhrdav.lib.DavFs.prototype.write);

