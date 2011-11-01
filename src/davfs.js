/**
 * davfs.js - WebDAV settings and XHTTPRequest object Management API and
 *            XHTTPRequest High-level WebDAV Client API.
 *
 * This is a Manager of WebDAV and XHTTPRequest for File system.
 * and a High-level WebDAV client API for File system.
 * Path base request.
 * Resource base request: @see xhrdav.ResourceController
 *
 * @license Copyright 2011 The xhrdavclient library authors.
 * All rights reserved.
 */

goog.provide('xhrdav.DavFs');
goog.provide('xhrdav.DavFs.Request');
goog.require('goog.net.XhrManager');
goog.require('xhrdav.Client');
goog.require('xhrdav.Conf');
goog.require('xhrdav.Errors');
goog.require('xhrdav.ResourceBuilder');
goog.require('xhrdav.ResourceController');


/**
 * high-level WebDAV client API Singleton
 *
 * @constructor
 */
xhrdav.DavFs = function() {
  /**
   * @private
   * @type {goog.net.XhrManager}
   */
  this.xhrMgr_ = null;

  /**
   * @private
   * @type {Object.<string,xhrdav.Client>}
   */
  this.clients_ = {};

  this.initXhrMgr_();
  this.addConnection();
};
goog.addSingletonGetter(xhrdav.DavFs);

/** @type {string} */
xhrdav.DavFs.DEFAULT_DAV_SITE_NAME = 'default';

/**
 *  Init XhrManager with config.
 *
 * @private
 */
xhrdav.DavFs.prototype.initXhrMgr_ = function() {
  var config = xhrdav.Conf.getInstance();
  var configXhrMgr = config.getXhrMgrConfig();

  if (goog.isDefAndNotNull(configXhrMgr) &&
    !goog.object.isEmpty(configXhrMgr)) {
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
 *   var davFs = xhrdav.DavFs.getInstance();
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
 * @return {goog.net.XhrManager}  XhrManager object.
 */
xhrdav.DavFs.prototype.getXhrManager = function() {
  return this.xhrMgr_;
};

/**
 * Setter XhrManager
 *
 * @param {goog.net.XhrManager} xhrMgr  XhrManager object.
 * @see goog.net.XhrManager
 */
xhrdav.DavFs.prototype.setXhrManager = function(xhrMgr) {
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
xhrdav.DavFs.prototype.createClient_ = function(opt_uri, site) {
  var config = xhrdav.Conf.getInstance();
  var client = new xhrdav.Client(opt_uri);
  client.setXmlParseFunction(goog.getObjectByName(config.xmlParseFuncObj));
  goog.object.set(this.clients_, site, client);
};

/**
 * Get and Create Connection xhrdav.Client.
 *
 * @param {string=} opt_davSiteName  Any settings name of WebDAV site.
 * @return {xhrdav.Client}  WebDAV Client connection object.
 */
xhrdav.DavFs.prototype.getConnection = function(opt_davSiteName) {
  if (goog.string.isEmptySafe(opt_davSiteName)) {
    opt_davSiteName = xhrdav.DavFs.DEFAULT_DAV_SITE_NAME;
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
xhrdav.DavFs.prototype.addConnection = function(opt_uri, opt_davSiteName) {
  if (goog.string.isEmptySafe(opt_davSiteName)) {
    opt_davSiteName = xhrdav.DavFs.DEFAULT_DAV_SITE_NAME;
  }
  this.createClient_(opt_uri, opt_davSiteName);
};

/**
 * Get Request object for WebDAV request.
 *
 * @param {{davSiteName:string=, xhrIo:(goog.net.XhrIo|goog.net.XhrManager)=,
 *     auth:string=, authOverwrite:boolean=}} options
 *     davSiteName Any settings name of WebDAV site.
 *     xhrIo request object of closure library
 *         (For Cross-site resource sharing[CORS]).
 *     auth: authorization credentials.
 *     authOverwrite: overwrite flag for auth credentials.
 * @return {xhrdav.DavFs.Request} WebDAV Fs Request object.
 * @see xhrdav.DavFs.Request
 */
xhrdav.DavFs.prototype.getRequest = function(options) {
  if (!goog.isDefAndNotNull(options)) options = {};
  if (goog.string.isEmptySafe(options.davSiteName)) {
    options.davSiteName = xhrdav.DavFs.DEFAULT_DAV_SITE_NAME;
  }
  var davSite = this.getConnection(options.davSiteName);
  if (!goog.string.isEmptySafe(options.auth)) {
    if (!!options.authOverwrite || !davSite.hasAuthCredentials()) {
      davSite.setAuthCredentials(options.auth);
    }
  }

  if (!goog.isDefAndNotNull(options.xhrIo) ||
    !(options.xhrIo instanceof goog.net.XhrIo ||
    options.xhrIo instanceof goog.net.XhrManager)) {
    options.xhrIo = this.xhrMgr_;
  }

  return new xhrdav.DavFs.Request(davSite, options.xhrIo);
};


/**
 * An encapsulation of everything needed to make a DavFs request.
 *
 *
 * @constructor
 * @param {xhrdav.Client} davSite WebDAV site.
 * @param {(goog.net.XhrIo|goog.net.XhrManager)} xhrIo request object
 *     of closure library (For Cross-site resource sharing[CORS]).
 */
xhrdav.DavFs.Request = function(davSite, xhrIo) {
  /**
   * @private
   * @type {xhrdav.Client}
   */
  this.davSite_ = davSite;

  /**
   * @private
   * @type {(goog.net.XhrIo|goog.net.XhrManager)}
   */
  this.xhrIo_ = xhrIo;
};

/**
 * WebDAV Response process handler(callback)
 *
 * @private
 * @param {Function} handler callback client.
 * @param {Function} processHandler callback process response handler.
 * @param {string} path Request path.
 * @param {*} context callback function scope.
 * @param {number} statusCode HTTP Status code.
 * @param {Object} content Response body data.
 * @param {Object} headers Response headers.
 */
xhrdav.DavFs.Request.prototype.responseHandler_ = function(
  handler, processHandler, path, context, statusCode, content, headers) {
  var httpStatus = xhrdav.HttpStatus;
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
 * @return {Array.<xhrdav.Errors, string=>} Errors, new Location.
 * @see xhrdav.Errors
 */
xhrdav.DavFs.Request.prototype.contentReadHandler_ = function(
  path, statusCode, content, headers) {
  var config = xhrdav.Conf.getInstance();
  var httpStatus = xhrdav.HttpStatus;
  var errors = new xhrdav.Errors();

  var args = [];
  if (statusCode != httpStatus.OK) {
    var data = {statusCode: statusCode, path: path, content: content};
    errors.setRequest(xhrdav.DavFs.Request.buildRequestErrors(data));
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
 * @return {Array.<xhrdav.Errors, boolean>} Errors, new Location.
 * @see xhrdav.Errors
 */
xhrdav.DavFs.Request.prototype.existsHandler_ = function(
  path, statusCode, content, headers) {
  var config = xhrdav.Conf.getInstance();
  var httpStatus = xhrdav.HttpStatus;
  var errors = new xhrdav.Errors();

  var args = [];
  if (!goog.array.contains(
    [httpStatus.OK, httpStatus.CREATED, httpStatus.NO_CONTENT],
    statusCode)) {
    var data = {statusCode: statusCode, path: path, content: content};
    errors.setRequest(xhrdav.DavFs.Request.buildRequestErrors(data));
  }
  args.push(errors);
  args.push(errors.hasRequest() ? false : true);
  return args;
};

/**
 * Error Handler
 *
 * Errors object structure:
 *     {status: <HTTP status code>, path: <request path>,
 *      summary: <Request error summary message>,
 *      message: <Request error detail message>}
 *
 * @private
 * @param {string} path HTTP Request path.
 * @param {number} statusCode HTTP Status code.
 * @param {Object} content Response body data.
 * @param {Object} headers Response headers.
 * @return {Array.<xhrdav.Errors, string=>} Errors, new Location.
 * @see xhrdav.Errors
 */
xhrdav.DavFs.Request.prototype.simpleErrorHandler_ = function(
  path, statusCode, content, headers) {
  var config = xhrdav.Conf.getInstance();
  var httpStatus = xhrdav.HttpStatus;
  var errors = new xhrdav.Errors();

  var args = [];
  if (!goog.array.contains(
    [httpStatus.OK, httpStatus.CREATED, httpStatus.NO_CONTENT],
    statusCode)) {
    var data = {statusCode: statusCode, path: path, content: content};
    errors.setRequest(xhrdav.DavFs.Request.buildRequestErrors(data));
  }
  args.push(errors);
  if (statusCode == httpStatus.CREATED) {
    args.push(headers['Location']);
  }
  return args;
};

/**
 * Building request errors
 *
 * @param {{statusCode: number, path: string, content: string=}} data
 *     Response data.
 * @return {{status: number, path: string, html: string,
 *     summary: string=, message: string=}} errors Map data.
 */
xhrdav.DavFs.Request.buildRequestErrors = function(data) {
  var httpStatusText = xhrdav.HttpStatus.text;
  var errMap = {};

  var errorHtmlDom = !goog.string.isEmptySafe(data.content) ?
    goog.dom.htmlToDocumentFragment(data.content) : null;
  if (goog.isDefAndNotNull(errorHtmlDom)) {
    var summary = goog.dom.getElementsByTagNameAndClass(
      'title', null, errorHtmlDom)[0];
    var description = goog.dom.getElementsByTagNameAndClass(
      'p', null, errorHtmlDom)[0];
    goog.object.extend(errMap, {
      summary: goog.dom.getTextContent(summary),
      message: goog.dom.getTextContent(description)});
  } else {
    goog.object.extend(errMap, {
      summary: data.statusCode + ' ' + httpStatusText[data.statusCode],
      message: data.statusCode + ' ' + httpStatusText[data.statusCode]});
  }

  goog.object.extend(errMap, {
    status: data.statusCode,
    path: data.path,
    html: data.content});

  return errMap;
};

/**
 * Build Directory tree from multistatus
 *
 * @param {Object} content  multistatus response data.
 * @param {Object=} opt_helper Returning resource controller.
 * @return {(xhrdav.Resource|xhrdav.ResourceController|Object)}
 *         converted object for WebDAV resources.
 * @see xhrdav.ResourceBuilder.createCollection
 */
xhrdav.DavFs.Request.prototype.getListDirFromMultistatus = function(
  content, opt_helper) {
  if (!goog.isDefAndNotNull(opt_helper)) opt_helper = {};
  var builder = xhrdav.ResourceBuilder.createCollection(content);
  var resources;
  if (!!opt_helper.hasCtrl) {
    resources = builder.getResources();
    if (goog.isDefAndNotNull(resources.root)) resources.root.setRequest(this);
    if (!goog.array.isEmpty(resources.childs)) {
      goog.array.forEach(resources.childs, function(child) {
        child.setRequest(this);
      }, this);
    }
  } else {
    resources = builder.serialize(opt_helper.asModel);
  }
  return resources;
};

/**
 * Update(move, copy) request handler.
 *
 * @private
 * @param {string} method Method name of xhrdav.Client instance.
 * @param {string} path Update src file path.
 * @param {string} dstPath Update destination path.
 * @param {Function} handler  callback handler function.
 * @param {Object=} opt_request Request parameters.
 * @param {Object=} context Callback scope.
 * @param {Function=} onXhrComplete onXhrComplete callback function.
 */
xhrdav.DavFs.Request.prototype.updateRequestHandler_ = function(
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
 * @private
 * @param {string} method Method name of xhrdav.Client instance.
 * @param {string} path propfind request path.
 * @param {Function} handler  callback handler function.
 * @param {Object=} opt_request Request parameters.
 * @param {Object=} context Callback scope.
 * @param {{hasCtrl:boolean, asModel:boolean}=} opt_helper  response options.
 * @param {Function=} onXhrComplete onXhrComplete callback function.
 */
xhrdav.DavFs.Request.prototype.propfindRequestHandler_ = function(
  path, handler, opt_request, context, opt_helper, onXhrComplete) {
  var dataHandler = goog.bind(this.processMultistatus_, this, opt_helper);
  this.davSite_.propfind(path,
    goog.bind(this.responseHandler_, this, handler, dataHandler, path, context),
    opt_request, onXhrComplete);
};

/**
 * Processing Reponse Multi-Status Data
 *
 * @private
 * @param {string} path HTTP Request path.
 * @param {number} statusCode HTTP Status code.
 * @param {Object} content Response body data.
 * @param {Object} headers Response headers.
 * @return {Array.<xhrdav.Errors, xhrdav.Response>} response contents.
 * @see xhrdav.Errors
 */
xhrdav.DavFs.Request.prototype.processMultistatus_ = function(
  opt_helper, path, statusCode, content, headers) {
  var config = xhrdav.Conf.getInstance();
  var httpStatus = xhrdav.HttpStatus;
  var errors = new xhrdav.Errors();

  var args = [];
  if (statusCode == httpStatus.MULTI_STATUS) {
    // TODO: research scope
    xhrdav.Conf.logging({'name': 'xhrdav.DavFs.Request#processMultistatus_',
      'scope': this instanceof xhrdav.DavFs.Request}, 'config');
    content = this.getListDirFromMultistatus(content, opt_helper);
  } else {
    var data = {statusCode: statusCode, path: path, content: content};
    errors.setRequest(xhrdav.DavFs.Request.buildRequestErrors(data));
  }
  args.push(errors);
  args.push(content);

  return args;
};

/**
 * Create Request paramters.
 *
 * @private
 * @param {Object=} opt_headers HTTP Request Headers.
 * @param {Object=} opt_params  HTTP Query parameters.
 * @param {string=} opt_xhrId Xhrmanager Id.
 * @return {Object} created request map object.
 * @throws {Error} Not found of xhrIo object.
 */
xhrdav.DavFs.Request.prototype.createRequestParameters_ = function(
  opt_headers, opt_params, opt_xhrId) {
  var opt_request = {headers: opt_headers || {}, query: opt_params || {}};

  if (!goog.isDefAndNotNull(this.xhrIo_)) {
    // Nothing to do.
  } else if (this.xhrIo_ instanceof goog.net.XhrIo) {
    goog.object.extend(opt_request, {xhrIo: this.xhrIo_});
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
 * @param {string} path Listing request path.
 * @param {Function} handler callback handler function.
 * @param {Object=} opt_headers Request headers options.
 * @param {Object=} opt_params  Request query paramters.
 * @param {Object=} context Callback scope.
 * @param {{hasCtrl:boolean=, asModel:boolean=, xhrId:string=}=} opt_helper
 *     xhr and response options.
 * @param {Function=} onXhrComplete onXhrComplete callback function.
 * @see #propfindRequestHandler_
 */
xhrdav.DavFs.Request.prototype.listDir = function(
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
 * @param {string} path property get request path.
 * @param {Function} handler callback handler function.
 * @param {Object=} opt_headers Request headers options.
 * @param {Object=} opt_params  Request query paramters.
 * @param {Object=} context Callback scope.
 * @param {{hasCtrl:boolean=, asModel:boolean=, xhrId:string=}=} opt_helper
 *     xhr and response options.
 * @param {Function=} onXhrComplete onXhrComplete callback function.
 * @see #propfindRequestHandler_
 */
xhrdav.DavFs.Request.prototype.getProps = function(
  path, handler, opt_headers, opt_params, context, opt_helper, onXhrComplete) {
  var opt_request = this.createRequestParameters_(
    opt_headers, opt_params, opt_helper && opt_helper.xhrId);

  this.propfindRequestHandler_(
    path, handler, opt_request, context, onXhrComplete);
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
 * @param {Function=} onXhrComplete onXhrComplete callback function.
 */
xhrdav.DavFs.Request.prototype.mkDir = function(
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
 * @param {Function=} onXhrComplete onXhrComplete callback function.
 */
xhrdav.DavFs.Request.prototype.remove = function(
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
 * @param {Function=} onXhrComplete onXhrComplete callback function.
 */
xhrdav.DavFs.Request.prototype.move = function(
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
 * @param {Function=} onXhrComplete onXhrComplete callback function.
 * @see #updateRequestHandler_
 */
xhrdav.DavFs.Request.prototype.copy = function(
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
 * @param {Function=} onXhrComplete onXhrComplete callback function.
 */
xhrdav.DavFs.Request.prototype.read = function(
  path, handler, opt_headers, opt_params, context, opt_helper, onXhrComplete) {
  var opt_request = this.createRequestParameters_(
    opt_headers, opt_params, opt_helper && opt_helper.xhrId);

  path = xhrdav.utils.path.removeLastSlash(path);

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
 * @param {Function=} onXhrComplete onXhrComplete callback function.
 */
xhrdav.DavFs.Request.prototype.write = function(
  path, content, handler, opt_headers, opt_params, context,
  opt_helper, onXhrComplete) {
  var opt_request = this.createRequestParameters_(
    opt_headers, opt_params, opt_helper && opt_helper.xhrId);

  path = xhrdav.utils.path.removeLastSlash(path);

  this.davSite_.put(path, content,
    goog.bind(this.responseHandler_, this,
      handler, this.simpleErrorHandler_, path, context),
    opt_request, onXhrComplete);
};

/**
 * Upload data to WebDAV server
 *
 * @param {string} path upload file path.
 * @param {File} file File object(File API).
 * @param {Function} handler callback handler function.
 * @param {Object=} opt_headers Request headers options.
 * @param {Object=} opt_params  Request query paramters.
 * @param {Object=} context Callback scope.
 * @param {{xhrId:string=}=} opt_helper xhr options.
 * @param {Function=} onXhrComplete onXhrComplete callback function.
 * @throws {Error} Not a file object.
 */
xhrdav.DavFs.Request.prototype.upload = function(
  path, file, handler, opt_headers, opt_params, context,
  opt_helper, onXhrComplete) {
  var opt_request = this.createRequestParameters_(
    opt_headers, opt_params, opt_helper && opt_helper.xhrId);

  path = xhrdav.utils.path.removeLastSlash(path);
  if (!(file instanceof File)) {
    xhrdav.Conf.logging(
      {'DavFs.Request#upload':
        'Argument "file" is not a file object!![path: ' + path + ']'},
      'warning');
    xhrdav.Conf.logging(file, 'warning');
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
 * @param {Function=} onXhrComplete onXhrComplete callback function.
 */
xhrdav.DavFs.Request.prototype.exists = function(
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
 * @param {(xhrdav.Resource|Object)=} resource
 *     Json/Hash object for WebDAV resource.
 * @return {xhrdav.ResourceController}
 *     createed request resource controller object.
 * @see xhrdav.ResourceController
 */
xhrdav.DavFs.Request.prototype.createResourceController = function(resource) {
  var controller = new xhrdav.ResourceController(resource);
  controller.setRequest(this);
  return controller;
};


/* Entry Point for closure compiler */
goog.exportSymbol('xhrdav.DavFs.getInstance', xhrdav.DavFs.getInstance);
goog.exportSymbol('xhrdav.DavFs.DEFAULT_DAV_SITE_NAME',
  xhrdav.DavFs.DEFAULT_DAV_SITE_NAME);
goog.exportProperty(xhrdav.DavFs.prototype, 'getXhrManager',
  xhrdav.DavFs.prototype.getXhrManager);
goog.exportProperty(xhrdav.DavFs.prototype, 'setXhrManager',
  xhrdav.DavFs.prototype.setXhrManager);
goog.exportProperty(xhrdav.DavFs.prototype, 'getConnection',
  xhrdav.DavFs.prototype.getConnection);
goog.exportProperty(xhrdav.DavFs.prototype, 'addConnection',
  xhrdav.DavFs.prototype.addConnection);
goog.exportProperty(xhrdav.DavFs.prototype, 'getRequest',
  xhrdav.DavFs.prototype.getRequest);

goog.exportSymbol('xhrdav.DavFs.Request', xhrdav.DavFs.Request);
goog.exportSymbol('xhrdav.DavFs.Request.buildRequestErrors',
  xhrdav.DavFs.Request.buildRequestErrors);
goog.exportProperty(xhrdav.DavFs.Request.prototype,
  'getListDirFromMultistatus',
  xhrdav.DavFs.Request.prototype.getListDirFromMultistatus);
goog.exportProperty(xhrdav.DavFs.Request.prototype, 'listDir',
  xhrdav.DavFs.Request.prototype.listDir);
goog.exportProperty(xhrdav.DavFs.Request.prototype, 'getProps',
  xhrdav.DavFs.Request.prototype.getProps);
goog.exportProperty(xhrdav.DavFs.Request.prototype, 'mkDir',
  xhrdav.DavFs.Request.prototype.mkDir);
goog.exportProperty(xhrdav.DavFs.Request.prototype, 'remove',
  xhrdav.DavFs.Request.prototype.remove);
goog.exportProperty(xhrdav.DavFs.Request.prototype, 'move',
  xhrdav.DavFs.Request.prototype.move);
goog.exportProperty(xhrdav.DavFs.Request.prototype, 'copy',
  xhrdav.DavFs.Request.prototype.copy);
goog.exportProperty(xhrdav.DavFs.Request.prototype, 'read',
  xhrdav.DavFs.Request.prototype.read);
goog.exportProperty(xhrdav.DavFs.Request.prototype, 'write',
  xhrdav.DavFs.Request.prototype.write);
goog.exportProperty(xhrdav.DavFs.Request.prototype, 'upload',
  xhrdav.DavFs.Request.prototype.upload);
goog.exportProperty(xhrdav.DavFs.Request.prototype, 'exists',
  xhrdav.DavFs.Request.prototype.exists);
goog.exportProperty(xhrdav.DavFs.Request.prototype, 'createResourceController',
  xhrdav.DavFs.Request.prototype.createResourceController);
