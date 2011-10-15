/**
 * davfs.js - XHTTPRequest High-level WebDAV Client API.
 *
 * This is a High-level WebDAV client API for File system.
 * Path base request.
 * Resource base request: @see xhrdav.lib.ResourceController
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
 * Get XhrManager of davfs for monitoring, progress, abort, etc.
 *
 * Example:
 *   var davFs = xhrdav.lib.DavFs.getInstance();
 *   var xhrMgr = davFs.getXhrManager();
 *
 *   var onComplete = function(file, e) {
 *     console.log('Uploaded ' + file.name); };
 *
 *   var delay = new goog.async.ConditionalDelay(function() {
 *       var sendingCount = xhrMgr.getOutstandingCount();
 *       console.log('Sending... ' + sendingCount);
 *       return (sendingCount == 0); });
 *   delay.onSuccess = function() { alert('Update files on completely!!'); };
 *   delay.onFailure = function() {
 *     alert('Failed to upload files by timeout'); };
 *
 *   delay.start(500, 5000);
 *   goog.array.forEach(files, function(file, i) {
 *     fs.upload(WEBDAV_ROOT + file.name, file,
 *       goog.bind(onComplete, this, file), null, null, this);
 *   }
 *
 * @return {goog.net.XhrManager}
 */
xhrdav.lib.DavFs.prototype.getXhrManager = function() {
  return this.xhrMgr_;
};

/**
 * Init with calling low-level client API.
 *
 * @private
 * @param {{scheme:string=, domain:stirng=, port:nubmer=}=} opt_uri
 *     davclient Parameters(opt_uri: scheme, domain, port)
 */
xhrdav.lib.DavFs.prototype.initClient_ = function(opt_uri) {
  var config = xhrdav.lib.Config.getInstance();
  this.client_ = new xhrdav.lib.Client(opt_uri);
  this.client_.setXmlParseFunction(
    goog.getObjectByName(config.xmlParseFuncObj));
};

/**
 * Get and Create Connection xhrdav.lib.Client.
 *
 * @param {boolean=} refresh Refresh connection object.
 * @param {{scheme:string=, domain:stirng=, port:nubmer=}=} opt_uri
 *     davclient Parameters(opt_uri: scheme, domain, port)
 * @return {xhrdav.lib.Client}
 * @see #initialize
 */
// TODO: For multi davclient('default', 'main', 'share', 'tmp', etc.)
// this#getConnection(false, null) #=> 'default' davclient
// this#getConnection(false, 'share');
xhrdav.lib.DavFs.prototype.getConnection = function(refresh, opt_uri) {
  if (!!refresh || goog.isNull(this.client_)) this.initClient_(opt_uri);
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
 * Content read Handler
 *
 * @private
 * @param {string} path HTTP Requst path.
 * @param {number} statusCode HTTP Status code.
 * @param {Object} content Response body data.
 * @param {Object} headers Response headers.
 * @return {Array.<xhrdav.lib.Errors, string=>} Errors, new Location
 * @see xhrdav.lib.Errors
 */
xhrdav.lib.DavFs.prototype.contentReadHandler_ = function(
  path, statusCode, content, headers) {
  var config = xhrdav.lib.Config.getInstance();
  var httpStatus = xhrdav.lib.HttpStatus;
  var errors = new xhrdav.lib.Errors();

  var args = [];
  if (statusCode != httpStatus.OK) {
    errors.setRequest({status: statusCode, message: httpStatus.text[statusCode], path: path});
  }
  args.push(errors);
  args.push(content);

  return args;
};

/**
 * Exists Handler
 *
 * @private
 * @param {string} path HTTP Requst path.
 * @param {number} statusCode HTTP Status code.
 * @param {Object} content Response body data.
 * @param {Object} headers Response headers.
 * @return {Array.<xhrdav.lib.Errors, boolean>} Errors, new Location
 * @see xhrdav.lib.Errors
 */
xhrdav.lib.DavFs.prototype.existsHandler_ = function(
  path, statusCode, content, headers) {
  var config = xhrdav.lib.Config.getInstance();
  var httpStatus = xhrdav.lib.HttpStatus;
  var errors = new xhrdav.lib.Errors();

  var args = [];
  if (!goog.array.contains(
    [httpStatus.OK, httpStatus.CREATED, httpStatus.NO_CONTENT],
    statusCode)) {
    errors.setRequest({status: statusCode, message: httpStatus.text[statusCode], path: path});
  }
  args.push(errors);
  args.push(errors.hasRequest() ? false : true);
  return args;
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
    errors.setRequest({status: statusCode, message: httpStatus.text[statusCode], path: path});
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
 * @param {Object=} opt_helper Returning resource controller.
 * @return {(xhrdav.lib.Resource|xhrdav.lib.ResourceController|Object)}
 *         converted object for WebDAV resources.
 * @see xhrdav.lib.ResourceBuilder.createCollection
 */
xhrdav.lib.DavFs.getListDirFromMultistatus = function(content, opt_helper) {
  if (!goog.isDefAndNotNull(opt_helper)) opt_helper = {};
  var builder = xhrdav.lib.ResourceBuilder.createCollection(content);
  return (!!opt_helper.hasCtrl) ?
    builder.getResources() : builder.serialize(opt_helper.asModel);
};

/**
 * Update(move, copy) request handler.
 *
 * @param {string} method Method name of xhrdav.lib.Client instance.
 * @param {string} path Update src file path.
 * @param {string} dstPath Update destination path.
 * @param {Function} handler  callback handler function.
 * @param {Object=} opt_headers Request headers options.
 * @param {Object=} opt_params  Request query paramters.
 * @param {Object=} context Callback scope.
 * @param {Function=} onXhrComplete onXhrComplete callback function
 */
xhrdav.lib.DavFs.prototype.updateRequestHandler_ = function(
  method, path, dstPath, handler, opt_request, context, onXhrComplete) {
  var api = goog.getObjectByName(method, this.getConnection());

  api.call(this.getConnection(), path, dstPath,
    goog.bind(this.responseHandler_, this,
      handler, this.simpleErrorHandler_, path, context),
    opt_request, onXhrComplete);
};

/**
 * Propfind request(listDir, getProps) handler.
 *
 * @param {string} method Method name of xhrdav.lib.Client instance.
 * @param {string} path propfind request path.
 * @param {Function} handler  callback handler function.
 * @param {Object=} opt_headers Request headers options.
 * @param {Object=} opt_params  Request query paramters.
 * @param {Object=} context Callback scope.
 * @param {{hasCtrl:boolean, asModel:boolean}=} opt_helper  response options.
 * @param {Function=} onXhrComplete onXhrComplete callback function
 */
xhrdav.lib.DavFs.prototype.propfindRequestHandler_ = function(
  path, handler, opt_request, context, opt_helper, onXhrComplete) {
  var dataHandler = goog.bind(this.processMultistatus_, this, opt_helper);
  this.getConnection().propfind(path,
    goog.bind(this.responseHandler_, this, handler, dataHandler, path, context),
    opt_request, onXhrComplete);
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
  opt_helper, path, statusCode, content, headers) {
  var config = xhrdav.lib.Config.getInstance();
  var httpStatus = xhrdav.lib.HttpStatus;
  var errors = new xhrdav.lib.Errors();

  var args = [];
  if (statusCode == httpStatus.MULTI_STATUS) {
    content = xhrdav.lib.DavFs.getListDirFromMultistatus(content, opt_helper);
  } else {
    errors.setRequest({status: statusCode, message: httpStatus.text[statusCode], path: path});
  }
  args.push(errors);
  args.push(content);

  return args;
};

/**
 * Create Request paramters.
 *
 * @param {boolean} isMgr Add XhrManager object for request.
 * @param {Object=} opt_headers
 * @param {Object=} opt_params
 * @return {Object}
 */
xhrdav.lib.DavFs.prototype.createRequestParameters_ = function(
  isMgr,
  opt_headers, opt_params) {
  var opt_request = {headers: opt_headers || {}, query: opt_params || {}};
  if (!!isMgr) {
    goog.object.extend(opt_request,
      {xhrId: goog.string.createUniqueString(), xhrMgr: this.xhrMgr_});
  }
  return opt_request;
};

/**
 * listing collection
 *
 * @param {string} path
 * @param {Function} handler callback handler function.
 * @param {Object=} opt_headers Request headers options.
 * @param {Object=} opt_params  Request query paramters.
 * @param {Object=} context Callback scope.
 * @param {{hasCtrl:boolean, asModel:boolean}=} opt_helper  response options.
 * @param {Function=} onXhrComplete onXhrComplete callback function
 * @see #propfindRequestHandler_
 */
xhrdav.lib.DavFs.prototype.listDir = function(
  path, handler, opt_headers, opt_params, context, opt_helper, onXhrComplete) {
  var opt_request = this.createRequestParameters_(true, opt_headers, opt_params);

  opt_request.headers['Depth'] = 1;  // listing directory
  this.propfindRequestHandler_(path, handler, opt_request,
    context, opt_helper, onXhrComplete);
};

/**
 * Get property for a single resource.
 *
 * @param {string} path
 * @param {Function} handler callback handler function.
 * @param {Object=} opt_headers Request headers options.
 * @param {Object=} opt_params  Request query paramters.
 * @param {Object=} context Callback scope.
 * @param {{hasCtrl:boolean, asModel:boolean}=} opt_helper  response options.
 * @param {Function=} onXhrComplete onXhrComplete callback function
 * @see #propfindRequestHandler_
 */
xhrdav.lib.DavFs.prototype.getProps = function(
  path, handler, opt_headers, opt_params, context, opt_helper, onXhrComplete) {
  var opt_request = this.createRequestParameters_(true, opt_headers, opt_params);

  this.propfindRequestHandler_(path, handler, opt_request, context, onXhrComplete);
};

/**
 * Create directory (collection)
 *
 * @param {string} path Create dierctory path.
 * @param {Function} handler callback handler function.
 * @param {Object=} opt_headers Request headers options.
 * @param {Object=} opt_params  Request query paramters.
 * @param {Object=} context Callback scope.
 * @param {Function=} onXhrComplete onXhrComplete callback function
 */
xhrdav.lib.DavFs.prototype.mkDir = function(
  path, handler, opt_headers, opt_params, context, onXhrComplete) {
  var opt_request = this.createRequestParameters_(true, opt_headers, opt_params);

  this.getConnection().mkcol(path,
    goog.bind(this.responseHandler_, this,
      handler, this.simpleErrorHandler_, path, context),
    opt_request, onXhrComplete);
};

/**
 * Remove resource
 *
 * @param {string} path Remove resource path.
 * @param {Function} handler  callback handler function.
 * @param {Object=} opt_headers Request headers options.
 * @param {Object=} opt_params  Request query paramters.
 * @param {Object=} context Callback scope.
 * @param {Function=} onXhrComplete onXhrComplete callback function
 */
xhrdav.lib.DavFs.prototype.remove = function(
  path, handler, opt_headers, opt_params, context, onXhrComplete) {
  var opt_request = this.createRequestParameters_(true, opt_headers, opt_params);

  this.getConnection()._delete(path,
    goog.bind(this.responseHandler_, this,
      handler, this.simpleErrorHandler_, path, context),
    opt_request, onXhrComplete);
};

/**
 * Move resource
 *
 * @param {string} path Move src resource path.
 * @param {string} dstPath  Move destination path.
 * @param {Function} handler  callback handler function.
 * @param {Object=} opt_headers Request headers options.
 * @param {Object=} opt_params  Request query paramters.
 * @param {Object=} context Callback scope.
 * @param {Function=} onXhrComplete onXhrComplete callback function
 */
xhrdav.lib.DavFs.prototype.move = function(
  path, dstPath, handler, opt_headers, opt_params, context, onXhrComplete) {
  var opt_request = this.createRequestParameters_(true, opt_headers, opt_params);

  this.updateRequestHandler_('move',
    path, dstPath, handler, opt_request, context, onXhrComplete);
};

/**
 * Copy resource
 *
 * @param {string} path Move src resource path.
 * @param {string} dstPath  Move destination path.
 * @param {Function} handler  callback handler function.
 * @param {Object=} opt_headers Request headers options.
 * @param {Object=} opt_params  Request query paramters.
 * @param {Object=} context Callback scope.
 * @param {Function=} onXhrComplete onXhrComplete callback function
 * @see #updateRequestHandler_
 */
xhrdav.lib.DavFs.prototype.copy = function(
  path, dstPath, handler, opt_headers, opt_params, context, onXhrComplete) {
  var opt_request = this.createRequestParameters_(true, opt_headers, opt_params);

  this.updateRequestHandler_('copy',
    path, dstPath, handler, opt_request, context, onXhrComplete);
};

/**
 * Read data from WebDAV server
 *
 * @param {string} path read file path.
 * @param {Function} handler callback handler function.
 * @param {Object=} opt_headers Request headers options.
 * @param {Object=} opt_params  Request query paramters.
 * @param {Object=} context Callback scope.
 * @param {Function=} onXhrComplete onXhrComplete callback function
 */
xhrdav.lib.DavFs.prototype.read = function(
  path, handler, opt_headers, opt_params, context, onXhrComplete) {
  var opt_request = this.createRequestParameters_(true, opt_headers, opt_params);

  path = xhrdav.lib.utils.path.removeLastSlash(path);

  this.getConnection().get(path,
    goog.bind(this.responseHandler_, this,
      handler, this.contentReadHandler_, path, context),
    opt_request, onXhrComplete);
};

/**
 * Write data to WebDAV server
 *
 * @param {string} path upload file path.
 * @param {Object} content data string.
 * @param {Function} handler callback handler function.
 * @param {Object=} opt_headers Request headers options.
 * @param {Object=} opt_params  Request query paramters.
 * @param {Object=} context Callback scope.
 * @param {Function=} onXhrComplete onXhrComplete callback function
 */
xhrdav.lib.DavFs.prototype.write = function(
  path, content, handler, opt_headers, opt_params, context, onXhrComplete) {
  var opt_request = this.createRequestParameters_(true, opt_headers, opt_params);

  path = xhrdav.lib.utils.path.removeLastSlash(path);

  this.getConnection().put(path, content,
    goog.bind(this.responseHandler_, this,
      handler, this.simpleErrorHandler_, path, context),
    opt_request, onXhrComplete);
};

/**
 * Upload data to WebDAV server
 *
 * @param {string} path upload file path.
 * @param {File} file File object(File API)
 * @param {Function} handler callback handler function.
 * @param {Object=} opt_headers Request headers options.
 * @param {Object=} opt_params  Request query paramters.
 * @param {Object=} context Callback scope.
 * @param {Function=} onXhrComplete onXhrComplete callback function
 */
xhrdav.lib.DavFs.prototype.upload = function(
  path, file, handler, opt_headers, opt_params, context, onXhrComplete) {
  var opt_request = this.createRequestParameters_(true, opt_headers, opt_params);

  path = xhrdav.lib.utils.path.removeLastSlash(path);
  if (!(file instanceof File)) {
    xhrdav.lib.Config.getInstance().getLogger().warning(
      'DavFs#upload: Not a file object!![path: ' + path + ']');
    xhrdav.lib.Config.getInstance().getLogger().warning(file);
  }
  if (goog.isDefAndNotNull(file)) {
    goog.object.extend(opt_request.headers,
      {x_file_name: file.name, x_file_size: file.size});
  }

  this.getConnection().put(path, file,
    goog.bind(this.responseHandler_, this,
      handler, this.simpleErrorHandler_, path, context),
    opt_request, onXhrComplete);
};

/**
 * Resource Exists to WebDAV server
 *
 * @param {string} path exists resource path.
 * @param {Function} handler callback handler function.
 * @param {Object=} opt_headers Request headers options.
 * @param {Object=} opt_params  Request query paramters.
 * @param {Object=} context Callback scope.
 * @param {Function=} onXhrComplete onXhrComplete callback function
 */
xhrdav.lib.DavFs.prototype.exists = function(
  path, handler, opt_headers, opt_params, context, onXhrComplete) {
  var opt_request = this.createRequestParameters_(true, opt_headers, opt_params);

  this.getConnection().head(path,
    goog.bind(this.responseHandler_, this,
      handler, this.existsHandler_, path, context),
    opt_request, onXhrComplete);
};


/* Entry Point for closure compiler */
goog.exportSymbol('xhrdav.lib.DavFs.getInstance', xhrdav.lib.DavFs.getInstance);
goog.exportProperty(xhrdav.lib.DavFs.prototype, 'getConnection',
  xhrdav.lib.DavFs.prototype.getConnection);
goog.exportSymbol('xhrdav.lib.DavFs.getListDirFromMultistatus',
  xhrdav.lib.DavFs.getListDirFromMultistatus);
goog.exportProperty(xhrdav.lib.DavFs.prototype, 'listDir',
  xhrdav.lib.DavFs.prototype.listDir);
goog.exportProperty(xhrdav.lib.DavFs.prototype, 'getProps',
  xhrdav.lib.DavFs.prototype.getProps);
goog.exportProperty(xhrdav.lib.DavFs.prototype, 'mkDir',
  xhrdav.lib.DavFs.prototype.mkDir);
goog.exportProperty(xhrdav.lib.DavFs.prototype, 'remove',
  xhrdav.lib.DavFs.prototype.remove);
goog.exportProperty(xhrdav.lib.DavFs.prototype, 'move',
  xhrdav.lib.DavFs.prototype.move);
goog.exportProperty(xhrdav.lib.DavFs.prototype, 'copy',
  xhrdav.lib.DavFs.prototype.copy);
goog.exportProperty(xhrdav.lib.DavFs.prototype, 'read',
  xhrdav.lib.DavFs.prototype.read);
goog.exportProperty(xhrdav.lib.DavFs.prototype, 'write',
  xhrdav.lib.DavFs.prototype.write);
goog.exportProperty(xhrdav.lib.DavFs.prototype, 'upload',
  xhrdav.lib.DavFs.prototype.upload);
goog.exportProperty(xhrdav.lib.DavFs.prototype, 'exists',
  xhrdav.lib.DavFs.prototype.exists);

