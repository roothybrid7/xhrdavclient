/**
 * davclient.js - XHTTPRequest Low-level WebDAV Client API.
 *
 * WebDAV Ajax client api by XhrIo and XhrManager of google closure library.
 * (HTTP: GET, PUT, HEAD, OPTIONS, MKCOL, PROPFIND, PROPPATCH, LOCK, UNLOCK)
 *
 * @license Copyright 2011 The xhrdavclient library authors.
 * All rights reserved.
 */

goog.provide('xhrdav.Client');
goog.require('goog.Uri');
goog.require('goog.dom');
goog.require('goog.net.XhrIo');
goog.require('xhrdav.Conf');


/**
 * WebDAV Client library by Google Closure library.
 *
 * @constructor
 * @param {{scheme:string=, domain:stirng=, port:nubmer=, auth:string=}=} opt_uri
 *     URI Parameters(opt_uri: scheme, domain, port)
 * @see #initialize_
 */
xhrdav.Client = function(opt_uri) {
  this.initialize_(opt_uri);
};

/**
 * WebDAV Client initialize
 *
 * @private
 * @param {{scheme:string=, domain:stirng=, port:nubmer=, auth:string=}=} opt_uri
 *     URI Parameters(opt_uri: scheme, domain, port)
 */
xhrdav.Client.prototype.initialize_ = function(opt_uri) {
  if (!goog.isDefAndNotNull(opt_uri)) {
    opt_uri = {};
  }
  var locationUrl = goog.Uri.parse(location);
  /** @type {string} */
  this.scheme_ = opt_uri.scheme || locationUrl.getScheme() || 'http';
  /** @type {string} */
  this.domain_ = opt_uri.domain || locationUrl.getDomain();
  /** @type {number} */
  this.port_ = opt_uri.port || locationUrl.getPort();
  /** @type {?string} */
  this.auth_ = opt_uri.auth;
};

/**
 * Has Authorization credentials
 *
 * @return {boolean}  stored auth data(Basic/Digest auth hash string).
 */
xhrdav.Client.prototype.hasAuthCredentials = function() {
  return !!this.auth_;
};

/**
 * Get Authorization credentials
 *
 * @return {string} stored auth data.
 */
xhrdav.Client.prototype.getAuthCredentials = function() {
  return this.auth_;
};

/**
 * Set Authorization credentials
 *
 * @param {string} auth set auth data.
 */
xhrdav.Client.prototype.setAuthCredentials = function(auth) {
  this.auth_ = auth;
};

/**
 * Clear Authorization credentials
 */
xhrdav.Client.prototype.clearAuthCredentials = function() {
  this.auth_ = null;
};

/**
 * Parse Response All Headers
 *
 * @private
 * @param {string} headerStrings Response all header strings.
 * @return {Object} converted header object(associated array).
 */
xhrdav.Client.prototype.parseHeaders_ = function(headerStrings) {
  var headers = {};
  var headerListWithoutEmpty = goog.array.filter(
    headerStrings.split(/\n/), function(v, i) {
      return !(goog.string.isEmptySafe(v)); }
  );
  goog.array.forEach(headerListWithoutEmpty, function(v, i) {
    var chunks = v.split(': ');
    var key = goog.string.trim(chunks.shift());
    var obj = goog.string.trim(chunks.join(': '));
    headers[key] = obj;
  });
  return headers;
};

/**
 * Have xml parse function? <goog.mixin(this, parseFunc)>
 *
 * @return {boolean} true: can parse xml, false: can't parse xml.
 */
xhrdav.Client.prototype.canParseXml = function() {
  return (goog.isDef(this.parseXml)) ? true : false;
};

/**
 * Set xml parser function Object.
 *
 * @param {Object} funcObj
 *     Xml Parse function Object(defined function: parseXml).
 */
xhrdav.Client.prototype.setXmlParseFunction = function(funcObj) {
  goog.mixin(this, funcObj);
};

/**
 * Callback XHTTPRequest Processing
 *
 * @private
 * @param {Function} handler Callback chain function.
 * @param {Function} onXhrComplete onXhrComplete callback function.
 * @param {Object} event XHR Event Object.
 */
// TODO: Testcase of HTTP Request Error
xhrdav.Client.prototype.processRequest_ = function(
  handler, onXhrComplete, event) {
  if (onXhrComplete && goog.isFunction(onXhrComplete)) onXhrComplete(event);

  var xhr = event.target;
  var xssGuard = 'while(1);';
  var statusCode = xhr.getStatus() || 0;
  var headers = {};
  var content = xhr.getResponse(xssGuard);

  if (!xhr.isSuccess() && xhr.getStatus() != xhrdav.HttpStatus.MULTI_STATUS) {
    xhrdav.Conf.logging({'name': 'Client#processRequest_',
      'uri': xhr.getLastUri(),
      'errStatus': xhr.getLastErrorCode(),
      'errStatusText':
        goog.net.ErrorCode.getDebugMessage(xhr.getLastErrorCode()),
      'errMessage': xhr.getLastError()}, 'warning');
  } else {
    headers = this.parseHeaders_(xhr.getAllResponseHeaders());
    if (goog.string.contains(headers['Content-Type'], 'xml')) {
      content = xhr.getResponseXml(xssGuard);
      if (this.canParseXml()) content = this.parseXml(content);
      if (!goog.isDefAndNotNull(content)) statusCode = 500;
    }
  }
  if (handler) handler((statusCode < 1) ? 500 : statusCode, content, headers);
};

/**
 * Generate URL from path and location
 *
 * @private
 * @param {string} path Path(<code>/foo</code>, <code>/foo/bar.txt</code>).
 * @return {goog.Uri} Generated URL object.
 */
xhrdav.Client.prototype.generateUrl_ = function(path) {
  xhrdav.Conf.logging({'name': 'Client#generateUrl_', 'RequestURL': path});
  // scheme, userinfo, domain, port, path, query, fragment
  return goog.Uri.create(
    this.scheme_,
    null, // username:password(Basic認証?)
    this.domain_,
    this.port_,
    path,
    null, // query(a=1&b2)
    null);
};

/**
 * Set Query parameters for url.
 *
 * @private
 * @param {goog.net.Uri} url  Uri object.
 * @param {Object=} query Json/Hash object for query.
 * @return {goog.net.Uri} created uri object.
 */
xhrdav.Client.prototype.setParameters_ = function(url, query) {
  if (goog.isDefAndNotNull(query) && !goog.object.isEmpty(query)) {
    goog.object.forEach(query, function(val, key) {
      if (goog.isArray(val) && !goog.array.isEmpty(val)) {
        url.setParameterValues(key.camelize({with_dasherize: true}), val);
      } else if (goog.string.isEmptySafe(val)) {
        url.setParameterValue(key.camelize({with_dasherize: true}), val);
      }
    });
  }
  return url;
};

/**
 * convert headers keys.
 *
 * @private
 * @param {Object=} headers HTTP headers object.
 * @return {Object} converted HTTP headers object.
 */
xhrdav.Client.prototype.convertHeadersKeys_ = function(headers) {
  var converted = {};
  if (goog.isDefAndNotNull(headers) && !goog.object.isEmpty(headers)) {
    goog.object.forEach(headers, function(val, key) {
      var convKey = key.camelize({with_dasherize: true});
      goog.object.set(converted, convKey, val);
    });
  }
  return converted;
};

/**
 * Send XHTTPRequest
 *
 * @private
 * @param {string} method HTTP method(GET, POST, etc).
 * @param {string} url request url.
 * @param {Function} handler option function of processing after XHTTPRequest.
 * @param {{xhrMgr:goog.net.XhrManager, xhrId, headers:Object, query:Object}=}
 *     opt_request  Option params(xhrId, xhrManager, etc);
 * @param {Function=} onXhrComplete onXhrComplete callback function.
 */
xhrdav.Client.prototype.request_ = function(
  method, url, handler, opt_request, onXhrComplete) {
  if (!goog.isDefAndNotNull(opt_request)) opt_request = {};
  if (!goog.isDefAndNotNull(opt_request.headers)) opt_request.headers = {};
  var auth = goog.object.get(opt_request.headers, 'Authorization');
  if (!goog.isDefAndNotNull(auth)) {
    goog.object.set(opt_request.headers, 'Authorization', this.auth_);
  }
  if (goog.isDefAndNotNull(opt_request.xhrMgr)) {
    opt_request.xhrMgr.send(
      opt_request.xhrId || goog.string.createUniqueString(),
      url,
      method,
      opt_request.body,
      opt_request.headers,
      opt_request.priority || 0,
      goog.bind(this.processRequest_, this, handler, onXhrComplete),
      opt_request.maxRetries || 1);
  } else {
    goog.net.XhrIo.send(
      url,
      goog.bind(this.processRequest_, this, handler, onXhrComplete),
      method,
      opt_request.body,
      opt_request.headers);
  }
};

/**
 * Find out which HTTP methods are understood by the server.(WebDAV: OPTIONS)
 *
 * @param {string} path Path(<code>/foo/</code>, <code>/foo/bar.txt</code>).
 * @param {Function} handler Callback chain after request processing.
 * @param {{xhrMgr:goog.net.XhrManager, xhrId, headers:Object, query:Object}=}
 *     opt_request  Option params(xhrId, xhrManager, etc);
 * @param {Function=} onXhrComplete onXhrComplete callback function.
 */
xhrdav.Client.prototype.options = function(
  path, handler, opt_request, onXhrComplete) {
  if (!goog.isDefAndNotNull(opt_request)) opt_request = {};
  var url = this.generateUrl_(goog.string.urlDecode(path || ''));
  this.setParameters_(url, opt_request.query);
  opt_request.headers = this.convertHeadersKeys_(opt_request.headers || {});
  goog.object.extend(opt_request.headers, {'Cache-Control': 'no-cache'});
  this.request_('OPTIONS', url, handler, opt_request, onXhrComplete);
};

/**
 * Check Resource(WebDAV: HEAD)
 *
 * @param {string} path Path(<code>/foo/</code>, <code>/foo/bar.txt</code>).
 * @param {Function} handler Callback chain after request processing.
 * @param {{xhrMgr:goog.net.XhrManager, xhrId, headers:Object, query:Object}=}
 *     opt_request  Option params(xhrId, xhrManager, etc);
 * @param {Function=} onXhrComplete onXhrComplete callback function.
 */
xhrdav.Client.prototype.head = function(
  path, handler, opt_request, onXhrComplete) {
  if (!goog.isDefAndNotNull(opt_request)) opt_request = {};

  var url = this.generateUrl_(goog.string.urlDecode(path || ''));
  this.setParameters_(url, opt_request.query);

  opt_request.headers = this.convertHeadersKeys_(opt_request.headers || {});
  goog.object.extend(opt_request.headers, {'Cache-Control': 'no-cache'});

  this.request_('HEAD', url, handler, opt_request, onXhrComplete);
};

/**
 * Get Resource(WebDAV: GET)
 *
 * @param {string} path
 *     Path(<code>/foo/bar.xml</code>, <code>/foo/bar.txt</code>).
 * @param {Function} handler Callback chain after request processing.
 * @param {{xhrMgr:goog.net.XhrManager, xhrId, headers:Object, query:Object}=}
 *     opt_request  Option params(xhrId, xhrManager, etc);
 * @param {Function=} onXhrComplete onXhrComplete callback function.
 */
xhrdav.Client.prototype.get = function(
  path, handler, opt_request, onXhrComplete) {
  if (!goog.isDefAndNotNull(opt_request)) opt_request = {};

  var url = this.generateUrl_(goog.string.urlDecode(path || ''));
  this.setParameters_(url, opt_request.query);
  opt_request.headers = this.convertHeadersKeys_(opt_request.headers || {});

  this.request_('GET', url, handler, opt_request, onXhrComplete);
};

/**
 * Upload Resource(WebDAV: PUT)
 *
 * @param {string} path
 *     Path(<code>/foo/bar.xml</code>, <code>/foo/bar.txt</code>).
 * @param {Object} data Upload filedata(text OR binary).
 * @param {Function} handler Callback chain after request processing.
 * @param {{xhrMgr:goog.net.XhrManager, xhrId, headers:Object, query:Object}=}
 *     opt_request  Option params(xhrId, xhrManager, etc);
 * @param {Function=} onXhrComplete onXhrComplete callback function.
 */
xhrdav.Client.prototype.put = function(
  path, data, handler, opt_request, onXhrComplete) {
  if (!goog.isDefAndNotNull(opt_request)) opt_request = {};

  var decodedPath = goog.string.urlDecode(
    xhrdav.utils.path.removeLastSlash(path || ''));
  var url = this.generateUrl_(decodedPath);
  this.setParameters_(url, opt_request.query);

  opt_request.headers = this.convertHeadersKeys_(opt_request.headers || {});
  goog.object.extend(opt_request.headers, {'Cache-Control': 'no-cache'});

  opt_request.body = data;

  this.request_('PUT', url, handler, opt_request, onXhrComplete);
};

/**
 * Get Collection list and Resource property(WebDAV: PROPFIND)
 *
 * @param {string} path Path(<code>/foo/</code>, <code>/foo/bar.txt</code>).
 * @param {Function} handler Callback chain after request processing.
 * @param {{xhrMgr:goog.net.XhrManager, xhrId, headers:Object, query:Object}=}
 *     opt_request  Option params(xhrId, xhrManager, etc);
 * @param {Function=} onXhrComplete onXhrComplete callback function.
 */
xhrdav.Client.prototype.propfind = function(
  path, handler, opt_request, onXhrComplete) {
  if (!goog.isDefAndNotNull(opt_request)) opt_request = {};

  var url = this.generateUrl_(goog.string.urlDecode(path || ''));
  this.setParameters_(url, opt_request.query);

  opt_request.headers = this.convertHeadersKeys_(opt_request.headers || {});
  // 0(path only) or 1(current directory)
  goog.object.extend(opt_request.headers, {
    'Content-Type': 'text/xml',
    'Depth': goog.isDefAndNotNull(opt_request.headers['Depth']) ?
      opt_request.headers['Depth'] : 0});

  goog.object.extend(opt_request, {body:
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<D:propfind xmlns:D="DAV:"><D:allprop /></D:propfind>'});

  this.request_('PROPFIND', url, handler, opt_request, onXhrComplete);
};

/**
 * Set Collection list and Resource property(WebDAV: PROPPATCH)
 *
 * @param {string} path Path(<code>/foo/</code>, <code>/foo/bar.txt</code>).
 * @param {Function} handler Callback chain after request processing.
 * @param {{xhrMgr:goog.net.XhrManager, xhrId, headers:Object, query:Object}=}
 *     opt_request  Option params(xhrId, xhrManager, etc);
 * @param {Function=} onXhrComplete onXhrComplete callback function.
 */
// TODO: UNFIXED
xhrdav.Client.prototype.proppatch = function(
  path, handler, opt_request, onXhrComplete) {
  if (!goog.isDefAndNotNull(opt_request)) opt_request = {};

  var url = this.generateUrl_(goog.string.urlDecode(path || ''));
  this.setParameters_(url, opt_request.query);

  opt_request.headers = this.convertHeadersKeys_(opt_request.headers || {});
};

/**
 * Lock resource(WebDAV: LOCK)
 *
 * @param {string} path Path(<code>/foo/</code>, <code>/foo/bar.txt</code>).
 * @param {Function} handler Callback chain after request processing.
 * @param {{xhrMgr:goog.net.XhrManager, xhrId, headers:Object, query:Object}=}
 *     opt_request  Option params(xhrId, xhrManager, etc);
 * @param {Function=} onXhrComplete onXhrComplete callback function.
 */
// TODO: UNFIXED
xhrdav.Client.prototype.lock = function(
  path, handler, opt_request, onXhrComplete) {
  if (!goog.isDefAndNotNull(opt_request)) opt_request = {};

  var url = this.generateUrl_(goog.string.urlDecode(path || ''));
  this.setParameters_(url, opt_request.query);

  opt_request.headers = this.convertHeadersKeys_(opt_request.headers || {});
  goog.object.extend(opt_request.headers, {
    'Content-Type': 'text/xml',
    'Depth': goog.isDefAndNotNull(opt_request.headers['Depth']) ?
      opt_request.headers['Depth'] : 0});

  goog.object.extend(opt_request, {body:
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<D:lockinfo xmlns:D="DAV:">\n' +
    '<D:lockscope><D:' + (opt_request.scope || 'exclusive') +
    ' /></D:lockscope>\n' +
    '<D:locktype><D:' + (opt_request.type || 'write') + ' /></D:locktype>\n' +
    '<D:owner></D:owner>\n</D:lockinfo>\n'});

  this.request_('LOCK', url, handler, opt_request, onXhrComplete);
};

/**
 * Create Collection(WebDAV: MKCOL)
 *
 * @param {string} path Path(<code>/foo/</code>, <code>/foo/bar/</code>).
 * @param {Function} handler Callback chain after request processing.
 * @param {{xhrMgr:goog.net.XhrManager, xhrId, headers:Object, query:Object}=}
 *     opt_request  Option params(xhrId, xhrManager, etc);
 * @param {Function=} onXhrComplete onXhrComplete callback function.
 */
xhrdav.Client.prototype.mkcol = function(
  path, handler, opt_request, onXhrComplete) {
  if (!goog.isDefAndNotNull(opt_request)) opt_request = {};

  path = goog.string.endsWith(path, '/') ? path : path + '/'; // Preserve GET
  var url = this.generateUrl_(goog.string.urlDecode(path || ''));
  this.setParameters_(url, opt_request.query);

  opt_request.headers = this.convertHeadersKeys_(opt_request.headers || {});

  this.request_('MKCOL', url, handler, opt_request, onXhrComplete);
};

/**
 * Delete Collection or Resource(WebDAV: DELETE)
 *
 * @param {string} path Path(<code>/foo/</code>, <code>/foo/bar.txt</code>).
 * @param {Function} handler Callback chain after request processing.
 * @param {{xhrMgr:goog.net.XhrManager, xhrId, headers:Object, query:Object}=}
 *     opt_request  Option params(xhrId, xhrManager, etc);
 * @param {Function=} onXhrComplete onXhrComplete callback function.
 */
xhrdav.Client.prototype._delete = function(
  path, handler, opt_request, onXhrComplete) {
  if (!goog.isDefAndNotNull(opt_request)) opt_request = {};

  var url = this.generateUrl_(goog.string.urlDecode(path || ''));
  this.setParameters_(url, opt_request.query);

  opt_request.headers = this.convertHeadersKeys_(opt_request.headers || {});

  this.request_('DELETE', url, handler, opt_request, onXhrComplete);
};

/**
 * Private method of Copy or Move Collection(WebDAV: COPY/MOVE)
 *
 * @private
 * @param {string} method HTTP method of WebDAV.
 * @param {string} path Source Path(<code>/foo/</code>).
 * @param {string} dstPath Destination Path(<code>/bar/</code>).
 * @param {Function} handler Callback chain after request processing.
 * @param {{xhrMgr:goog.net.XhrManager, xhrId, headers:Object, query:Object}=}
 *     opt_request  Option params(xhrId, xhrManager, etc);
 * @param {Function=} onXhrComplete onXhrComplete callback function.
 */
xhrdav.Client.prototype.copyOrMovePath_ = function(
  method, path, dstPath, handler, opt_request, onXhrComplete) {

  if (!goog.isDefAndNotNull(opt_request)) opt_request = {};

  var url = this.generateUrl_(goog.string.urlDecode(path || ''));
  this.setParameters_(url, opt_request.query);

  opt_request.headers = this.convertHeadersKeys_(opt_request.headers || {});

  goog.object.extend(opt_request.headers, {
    'Cache-Control': 'no-cache',
    'Destination': this.generateUrl_(goog.string.urlDecode(dstPath || '')),
    'Overwrite': !!opt_request.headers['Overwrite'] ? 'T' : 'F'});

  this.request_(method, url, handler, opt_request, onXhrComplete);
};

/**
 * Move Collection(WebDAV: MOVE)
 *
 * @see #copyOrMovePath_
 */
xhrdav.Client.prototype.move = function(
  path, dstPath, handler, opt_request, onXhrComplete) {
  this.copyOrMovePath_('MOVE',
    path, dstPath, handler, opt_request, onXhrComplete);
};

/**
 * Copy Collection(WebDAV: COPY)
 *
 * @see #copyOrMovePath_
 */
xhrdav.Client.prototype.copy = function(
  path, dstPath, handler, opt_request, onXhrComplete) {
  this.copyOrMovePath_('COPY',
    path, dstPath, handler, opt_request, onXhrComplete);
};

/**
 * Error Handler of exception[Mix-in function]
 *
 * @param {Error} e Error object.
 */
xhrdav.Client.prototype.errorHandler = function(e) {
  xhrdav.Conf.logging({'Client#errorHandler': e.name,
    'message': e.message}, 'warning');
  xhrdav.Conf.getInstance().getLogger().warning(e.name, e);
};


/* Entry Point for closure compiler */
goog.exportSymbol('xhrdav.Client', xhrdav.Client);
goog.exportProperty(xhrdav.Client.prototype, 'hasAuthCredentials',
  xhrdav.Client.prototype.hasAuthCredentials);
goog.exportProperty(xhrdav.Client.prototype, 'getAuthCredentials',
  xhrdav.Client.prototype.getAuthCredentials);
goog.exportProperty(xhrdav.Client.prototype, 'setAuthCredentials',
  xhrdav.Client.prototype.setAuthCredentials);
goog.exportProperty(xhrdav.Client.prototype, 'clearAuthCredentials',
  xhrdav.Client.prototype.clearAuthCredentials);
goog.exportProperty(xhrdav.Client.prototype, 'canParseXml',
  xhrdav.Client.prototype.canParseXml);
goog.exportProperty(xhrdav.Client.prototype, 'setXmlParseFunction',
  xhrdav.Client.prototype.setXmlParseFunction);
goog.exportProperty(xhrdav.Client.prototype, 'options',
  xhrdav.Client.prototype.options);
goog.exportProperty(xhrdav.Client.prototype, 'head',
  xhrdav.Client.prototype.head);
goog.exportProperty(xhrdav.Client.prototype, 'get',
  xhrdav.Client.prototype.get);
goog.exportProperty(xhrdav.Client.prototype, 'put',
  xhrdav.Client.prototype.put);
goog.exportProperty(xhrdav.Client.prototype, 'propfind',
  xhrdav.Client.prototype.propfind);
goog.exportProperty(xhrdav.Client.prototype, 'mkcol',
  xhrdav.Client.prototype.mkcol);
goog.exportProperty(xhrdav.Client.prototype, '_delete',
  xhrdav.Client.prototype._delete);
goog.exportProperty(xhrdav.Client.prototype, 'move',
  xhrdav.Client.prototype.move);
goog.exportProperty(xhrdav.Client.prototype, 'copy',
  xhrdav.Client.prototype.copy);
goog.exportProperty(xhrdav.Client.prototype, 'errorHandler',
  xhrdav.Client.prototype.errorHandler);
