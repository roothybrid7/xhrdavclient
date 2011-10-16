/**
 * davfs.js - WebDAV settings and XHTTPRequest object Management API and
 *            XHTTPRequest High-level WebDAV Client API.
 *
 * This is a Manager of WebDAV and XHTTPRequest for File system.
 * and a High-level WebDAV client API for File system.
 * Path base request.
 * Resource base request: @see xhrdav.lib.ResourceController
 *
 * @license Copyright 2011 The xhrdavclient library authors. All rights reserved.
 */

goog.provide('xhrdav.lib.DavFs');
goog.provide('xhrdav.lib.DavFs.Request');
goog.require('goog.net.XhrManager');
goog.require('goog.Disposable');
goog.require('xhrdav.lib.Config');
goog.require('xhrdav.lib.Client');
goog.require('xhrdav.lib.ResourceBuilder');
goog.require('xhrdav.lib.ResourceController');


/**
 * high-level WebDAV client API Singleton
 *
 * @constructor
 */
xhrdav.lib.DavFs = function() {
  /** @type {goog.net.XhrManager} */
  this.xhrMgr_ = null;
  /** @type {Object.<string,xhrdav.lib.Client>} */
  this.clients_ = {};

  this.initXhrMgr_();
  this.addConnection();
};
goog.addSingletonGetter(xhrdav.lib.DavFs);

/** @type {string} */
xhrdav.lib.DavFs.DEFAULT_DAV_SITE_NAME = 'default';

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
 * Setter XhrManager
 *
 * @param {goog.net.XhrManager} xhrMgr
 * @see goog.net.XhrManager
 */
xhrdav.lib.DavFs.prototype.setXhrManager = function(xhrMgr) {
  if (xhrMgr && xhrMgr instanceof goog.net.XhrManager) {
    this.xhrMgr_ = xhrMgr;
  }
};

/**
 * Create WebDAV client object.
 *
 * @private
 * @param {{scheme:string=, domain:stirng=, port:nubmer=}=} opt_uri
 *     davclient Parameters(opt_uri: scheme, domain, port)
 * @param {string} site Settings name of WebDAV site.
 */
xhrdav.lib.DavFs.prototype.createClient_ = function(opt_uri, site) {
  var config = xhrdav.lib.Config.getInstance();
  var client = new xhrdav.lib.Client(opt_uri);
  client.setXmlParseFunction(goog.getObjectByName(config.xmlParseFuncObj));
  goog.object.set(this.clients_, site, client);
};

/**
 * Get and Create Connection xhrdav.lib.Client.
 *
 * @param {string=} opt_davSiteName  Any settings name of WebDAV site.
 * @return {xhrdav.lib.Client}
 */
xhrdav.lib.DavFs.prototype.getConnection = function(opt_davSiteName) {
  if (goog.string.isEmptySafe(opt_davSiteName)) {
    opt_davSiteName = xhrdav.lib.DavFs.DEFAULT_DAV_SITE_NAME;
  }
  return this.clients_[opt_davSiteName];
};

/**
 * Add WebDAV connection setting(For multiple WebDAV root)
 *
 * If connection exists, overwrite WebDAV site settings.
 *
 * @param {{scheme:string=, domain:string=, port:number=}=} opt_uri
 *     davclient Parameters(opt_uri: scheme, domain, port)
 * @param {string=} opt_davSiteName  Any settings name of WebDAV site.
 */
xhrdav.lib.DavFs.prototype.addConnection = function(opt_uri, opt_davSiteName) {
  if (goog.string.isEmptySafe(opt_davSiteName)) {
    opt_davSiteName = xhrdav.lib.DavFs.DEFAULT_DAV_SITE_NAME;
  }
  this.createClient_(opt_uri, opt_davSiteName);
};

/**
 * Get Request object for WebDAV request.
 *
 * @param {string=} opt_davSiteName Any settings name of WebDAV site.
 * @param {(goog.net.XhrIo|goog.net.XhrManager)=} opt_xhrIo request object
 *     of closure library (For Cross-site resource sharing[CORS]).
 * @see xhrdav.lib.DavFs.Request
 */
xhrdav.lib.DavFs.prototype.getRequest = function(
  opt_davSiteName, opt_xhrIo) {
  if (goog.string.isEmptySafe(opt_davSiteName)) {
    opt_davSiteName = xhrdav.lib.DavFs.DEFAULT_DAV_SITE_NAME;
  }
  var davSite = this.getConnection(opt_davSiteName);

  if (!goog.isDefAndNotNull(opt_xhrIo) ||
    !(opt_xhrIo instanceof goog.net.XhrIo ||
    opt_xhrIo instanceof goog.net.XhrManager)) {
    opt_xhrIo = this.xhrMgr_;
  }

  return new xhrdav.lib.DavFs.Request(davSite, opt_xhrIo);
};


/**
 * An encapsulation of everything needed to make a DavFs request.
 *
 *
 * @constructor
 * @param {xhrdav.lib.Client} davSite WebDAV site.
 * @param {(goog.net.XhrIo|goog.net.XhrManager)} xhrIo request object
 *     of closure library (For Cross-site resource sharing[CORS]).
 * @extends {goog.Disposable}
 */
xhrdav.lib.DavFs.Request = function(davSite, xhrIo) {
  goog.Disposable.call(this);

  /** @type {xhrdav.lib.Client} */
  this.davSite_ = davSite;
  /** @type {(goog.net.XhrIo|goog.net.XhrManager)} */
  this.xhrIo_ = xhrIo;
};
goog.inherits(xhrdav.lib.DavFs.Request, goog.Disposable);

/** @inheritDoc */
xhrdav.lib.DavFs.Request.prototype.disposeInternal = function() {
  xhrdav.lib.DavFs.Request.superClass_.disposeInternal.call(this);
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
xhrdav.lib.DavFs.Request.prototype.responseHandler_ = function(
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
 * @param {string} path HTTP Request path.
 * @param {number} statusCode HTTP Status code.
 * @param {Object} content Response body data.
 * @param {Object} headers Response headers.
 * @return {Array.<xhrdav.lib.Errors, string=>} Errors, new Location
 * @see xhrdav.lib.Errors
 */
xhrdav.lib.DavFs.Request.prototype.contentReadHandler_ = function(
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
 * @param {string} path HTTP Request path.
 * @param {number} statusCode HTTP Status code.
 * @param {Object} content Response body data.
 * @param {Object} headers Response headers.
 * @return {Array.<xhrdav.lib.Errors, boolean>} Errors, new Location
 * @see xhrdav.lib.Errors
 */
xhrdav.lib.DavFs.Request.prototype.existsHandler_ = function(
  path, statusCode, content, headers) {
  var config = xhrdav.lib.Config.getInstance();
  var httpStatus = xhrdav.lib.HttpStatus;
  var errors = new xhrdav.lib.Errors();

  var args = [];
  if (!goog.array.contains(
    [httpStatus.OK, httpStatus.CREATED, httpStatus.NO_CONTENT],
    statusCode)) {
    errors.setRequest(
      {status: statusCode, message: httpStatus.text[statusCode], path: path});
  }
  args.push(errors);
  args.push(errors.hasRequest() ? false : true);
  return args;
};

/**
 * Error Handler
 *
 * @private
 * @param {string} path HTTP Request path.
 * @param {number} statusCode HTTP Status code.
 * @param {Object} content Response body data.
 * @param {Object} headers Response headers.
 * @return {Array.<xhrdav.lib.Errors, string=>} Errors, new Location
 * @see xhrdav.lib.Errors
 */
xhrdav.lib.DavFs.Request.prototype.simpleErrorHandler_ = function(
  path, statusCode, content, headers) {
  var config = xhrdav.lib.Config.getInstance();
  var httpStatus = xhrdav.lib.HttpStatus;
  var errors = new xhrdav.lib.Errors();

  var args = [];
  if (!goog.array.contains(
    [httpStatus.OK, httpStatus.CREATED, httpStatus.NO_CONTENT],
    statusCode)) {
    errors.setRequest(
      {status: statusCode, message: httpStatus.text[statusCode], path: path});
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
xhrdav.lib.DavFs.Request.getListDirFromMultistatus = function(content, opt_helper) {
  if (!goog.isDefAndNotNull(opt_helper)) opt_helper = {};
  var builder = xhrdav.lib.ResourceBuilder.createCollection(content);
  var resources;
  if (!!opt_helper.hasCtrl) {
    resources = builder.getResources();
    if (goog.isDefAndNotNull(resources.root)) resources.root.setRequest(this);
    if (!goog.array.isEmpty(resources.childs)) {
      goog.array.forEach(resources.childs, function(child) {
        child.setRequest(this);
      });
    }
  } else {
    resources = builder.serialize(opt_helper.asModel);
  }
  return resources;
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
xhrdav.lib.DavFs.Request.prototype.updateRequestHandler_ = function(
  method, path, dstPath, handler, opt_request, context, onXhrComplete) {
  var api = goog.getObjectByName(method, this.davSite_);

  api.call(this.davSite_, path, dstPath,
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
xhrdav.lib.DavFs.Request.prototype.propfindRequestHandler_ = function(
  path, handler, opt_request, context, opt_helper, onXhrComplete) {
  var dataHandler = goog.bind(this.processMultistatus_, this, opt_helper);
  this.davSite_.propfind(path,
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
xhrdav.lib.DavFs.Request.prototype.processMultistatus_ = function(
  opt_helper, path, statusCode, content, headers) {
  var config = xhrdav.lib.Config.getInstance();
  var httpStatus = xhrdav.lib.HttpStatus;
  var errors = new xhrdav.lib.Errors();

  var args = [];
  if (statusCode == httpStatus.MULTI_STATUS) {
    content =
      xhrdav.lib.DavFs.Request.getListDirFromMultistatus(content, opt_helper);
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
 * @param {Object=} opt_headers HTTP Request Headers.
 * @param {Object=} opt_params  HTTP Query parameters.
 * @param {string=} opt_xhrId Xhrmanager Id.
 * @return {Object}
 * @throws {Error} Not found of xhrIo object.
 */
xhrdav.lib.DavFs.Request.prototype.createRequestParameters_ = function(
  opt_headers, opt_params, opt_xhrId) {
  var opt_request = {headers: opt_headers || {}, query: opt_params || {}};

  if (!goog.isDefAndNotNull(this.xhrIo_)) {
    // Nothing to do.
  } else if (this.xhrIo_ instanceof goog.net.XhrIo) {
    goog.object.extend(opt_request,{xhrIo: this.xhrIo_});
  } else if (this.xhrIo_ instanceof goog.net.XhrManager) {
    var map;
    if (!goog.string.isEmptySafe(opt_xhrId)) {
      map = {xhrId: opt_xhrId, xhrMgr: this.xhrIo_};
    } else {
      map = {xhrId: goog.string.createUniqueString(), xhrMgr: this.xhrIo_};
    }
    goog.object.extend(opt_request, map);
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
 * @param {{hasCtrl:boolean=, asModel:boolean=, xhrId:string=}=} opt_helper
 *     xhr and response options.
 * @param {Function=} onXhrComplete onXhrComplete callback function
 * @see #propfindRequestHandler_
 */
xhrdav.lib.DavFs.Request.prototype.listDir = function(
  path, handler, opt_headers, opt_params, context, opt_helper, onXhrComplete) {
  var opt_request = this.createRequestParameters_(
    opt_headers, opt_params, opt_helper && opt_helper.xhrId);

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
 * @param {{hasCtrl:boolean=, asModel:boolean=, xhrId:string=}=} opt_helper
 *     xhr and response options.
 * @param {Function=} onXhrComplete onXhrComplete callback function
 * @see #propfindRequestHandler_
 */
xhrdav.lib.DavFs.Request.prototype.getProps = function(
  path, handler, opt_headers, opt_params, context, opt_helper, onXhrComplete) {
  var opt_request = this.createRequestParameters_(
    opt_headers, opt_params, opt_helper && opt_helper.xhrId);

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
 * @param {{xhrId:string=}=} opt_helper xhr options.
 * @param {Function=} onXhrComplete onXhrComplete callback function
 */
xhrdav.lib.DavFs.Request.prototype.mkDir = function(
  path, handler, opt_headers, opt_params, context, opt_helper, onXhrComplete) {
  var opt_request = this.createRequestParameters_(
    opt_headers, opt_params, opt_helper && opt_helper.xhrId);

  this.davSite_.mkcol(path,
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
 * @param {{xhrId:string=}=} opt_helper xhr options.
 * @param {Function=} onXhrComplete onXhrComplete callback function
 */
xhrdav.lib.DavFs.Request.prototype.remove = function(
  path, handler, opt_headers, opt_params, context, opt_helper, onXhrComplete) {
  var opt_request = this.createRequestParameters_(
    opt_headers, opt_params, opt_helper && opt_helper.xhrId);

  this.davSite_._delete(path,
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
 * @param {{xhrId:string=}=} opt_helper xhr options.
 * @param {Function=} onXhrComplete onXhrComplete callback function
 */
xhrdav.lib.DavFs.Request.prototype.move = function(
  path, dstPath, handler, opt_headers, opt_params, context,
  opt_helper, onXhrComplete) {
  var opt_request = this.createRequestParameters_(
    opt_headers, opt_params, opt_helper && opt_helper.xhrId);

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
 * @param {{xhrId:string=}=} opt_helper xhr options.
 * @param {Function=} onXhrComplete onXhrComplete callback function
 * @see #updateRequestHandler_
 */
xhrdav.lib.DavFs.Request.prototype.copy = function(
  path, dstPath, handler, opt_headers, opt_params, context,
  opt_helper, onXhrComplete) {
  var opt_request = this.createRequestParameters_(
    opt_headers, opt_params, opt_helper && opt_helper.xhrId);
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
 * @param {{xhrId:string=}=} opt_helper xhr options.
 * @param {Function=} onXhrComplete onXhrComplete callback function
 */
xhrdav.lib.DavFs.Request.prototype.read = function(
  path, handler, opt_headers, opt_params, context, opt_helper, onXhrComplete) {
  var opt_request = this.createRequestParameters_(
    opt_headers, opt_params, opt_helper && opt_helper.xhrId);

  path = xhrdav.lib.utils.path.removeLastSlash(path);

  this.davSite_.get(path,
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
 * @param {{xhrId:string=}=} opt_helper xhr options.
 * @param {Function=} onXhrComplete onXhrComplete callback function
 */
xhrdav.lib.DavFs.Request.prototype.write = function(
  path, content, handler, opt_headers, opt_params, context,
  opt_helper, onXhrComplete) {
  var opt_request = this.createRequestParameters_(
    opt_headers, opt_params, opt_helper && opt_helper.xhrId);

  path = xhrdav.lib.utils.path.removeLastSlash(path);

  this.davSite_.put(path, content,
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
 * @param {{xhrId:string=}=} opt_helper xhr options.
 * @param {Function=} onXhrComplete onXhrComplete callback function
 * @throws {Error} Not a file object.
 */
xhrdav.lib.DavFs.Request.prototype.upload = function(
  path, file, handler, opt_headers, opt_params, context,
  opt_helper, onXhrComplete) {
  var opt_request = this.createRequestParameters_(
    opt_headers, opt_params, opt_helper && opt_helper.xhrId);

  path = xhrdav.lib.utils.path.removeLastSlash(path);
  if (!(file instanceof File)) {
    xhrdav.lib.Config.logging(
      {'DavFs.Request#upload': 'Argument "file" is not a file object!![path: ' + path + ']'},
      'warning');
    xhrdav.lib.Config.logging(file, 'warning');
  }
  if (goog.isDefAndNotNull(file)) {
    goog.object.extend(opt_request.headers,
      {x_file_name: file.name, x_file_size: file.size});
  }

  this.davSite_.put(path, file,
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
 * @param {{xhrId:string=}=} opt_helper xhr options.
 * @param {Function=} onXhrComplete onXhrComplete callback function
 */
xhrdav.lib.DavFs.Request.prototype.exists = function(
  path, handler, opt_headers, opt_params, context, opt_helper, onXhrComplete) {
  var opt_request = this.createRequestParameters_(
    opt_headers, opt_params, opt_helper && opt_helper.xhrId);

  this.davSite_.head(path,
    goog.bind(this.responseHandler_, this,
      handler, this.existsHandler_, path, context),
    opt_request, onXhrComplete);
};

/**
 * Create ResourceController.
 *
 * @param {(xhrdav.lib.Resource|Object)=} resource  Json/Hash object for WebDAV resource.
 * @return {xhrdav.lib.ResourceController}
 * @see xhrdav.lib.ResourceController
 */
xhrdav.lib.DavFs.Request.prototype.createResourceController = function(resource) {
  var controller = new xhrdav.lib.ResourceController(resource);
  controller.setRequest(this);
  return controller;
};


/* Entry Point for closure compiler */
goog.exportSymbol('xhrdav.lib.DavFs.getInstance', xhrdav.lib.DavFs.getInstance);
goog.exportSymbol('xhrdav.lib.DavFs.DEFAULT_DAV_SITE_NAME',
  xhrdav.lib.DavFs.DEFAULT_DAV_SITE_NAME);
goog.exportProperty(xhrdav.lib.DavFs.prototype, 'getXhrManager',
  xhrdav.lib.DavFs.prototype.getXhrManager);
goog.exportProperty(xhrdav.lib.DavFs.prototype, 'setXhrManager',
  xhrdav.lib.DavFs.prototype.setXhrManager);
goog.exportProperty(xhrdav.lib.DavFs.prototype, 'getConnection',
  xhrdav.lib.DavFs.prototype.getConnection);
goog.exportProperty(xhrdav.lib.DavFs.prototype, 'addConnection',
  xhrdav.lib.DavFs.prototype.addConnection);
goog.exportProperty(xhrdav.lib.DavFs.prototype, 'getRequest',
  xhrdav.lib.DavFs.prototype.getRequest);

goog.exportSymbol('xhrdav.lib.DavFs.Request', xhrdav.lib.DavFs.Request);
goog.exportSymbol('xhrdav.lib.DavFs.Request.getListDirFromMultistatus',
  xhrdav.lib.DavFs.Request.getListDirFromMultistatus);
goog.exportProperty(xhrdav.lib.DavFs.Request.prototype, 'listDir',
  xhrdav.lib.DavFs.Request.prototype.listDir);
goog.exportProperty(xhrdav.lib.DavFs.Request.prototype, 'getProps',
  xhrdav.lib.DavFs.Request.prototype.getProps);
goog.exportProperty(xhrdav.lib.DavFs.Request.prototype, 'mkDir',
  xhrdav.lib.DavFs.Request.prototype.mkDir);
goog.exportProperty(xhrdav.lib.DavFs.Request.prototype, 'remove',
  xhrdav.lib.DavFs.Request.prototype.remove);
goog.exportProperty(xhrdav.lib.DavFs.Request.prototype, 'move',
  xhrdav.lib.DavFs.Request.prototype.move);
goog.exportProperty(xhrdav.lib.DavFs.Request.prototype, 'copy',
  xhrdav.lib.DavFs.Request.prototype.copy);
goog.exportProperty(xhrdav.lib.DavFs.Request.prototype, 'read',
  xhrdav.lib.DavFs.Request.prototype.read);
goog.exportProperty(xhrdav.lib.DavFs.Request.prototype, 'write',
  xhrdav.lib.DavFs.Request.prototype.write);
goog.exportProperty(xhrdav.lib.DavFs.Request.prototype, 'upload',
  xhrdav.lib.DavFs.Request.prototype.upload);
goog.exportProperty(xhrdav.lib.DavFs.Request.prototype, 'exists',
  xhrdav.lib.DavFs.Request.prototype.exists);
goog.exportProperty(xhrdav.lib.DavFs.Request.prototype, 'createResourceController',
  xhrdav.lib.DavFs.Request.prototype.createResourceController);

