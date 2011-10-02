/**
 * davclient.js - XHTTPRequest Low-level WebDAV Client API.
 *
 * @license Copyright 2011 The xhrdavclient library authors. All rights reserved.
 */

goog.provide('xhrdav.lib.Client');
goog.require('xhrdav.lib.Config');
goog.require('goog.dom');
goog.require('goog.Uri');
goog.require('goog.net.XhrIo');

/**
 * WebDAV Client library by Google Closure library.
 *
 * @constructor
 * @param {Object=} opt_uri URI Parameters(opt_uri: scheme, domain, port)
 * @see #initialize_
 */
xhrdav.lib.Client = function(opt_uri) {
  this.initialize_(opt_uri);
};

/**
 * WebDAV Client initialize
 *
 * @private
 * @param {Object=} opt_uri URI Parameters(opt_uri: scheme, domain, port)
 */
xhrdav.lib.Client.prototype.initialize_ = function(opt_uri) {
  if (!goog.isDefAndNotNull(opt_uri)) {
    opt_uri = {};
  }
  var locationUrl = goog.Uri.parse(location);
  /** @type {string} */
  this.scheme_ = opt_uri.scheme || locationUrl.getScheme() || 'http';
  /** @type {string} */
  this.domain_ = opt_uri.domain || locationUrl.getDomain();
  /** @type {number} */
  this.port_ = opt_uri.port || locationUrl.getPort() || 80;
};

/**
 * Parse Response All Headers
 *
 * @private
 * @param {string} headerStrings Response all header strings.
 * @return {Object} converted header object(associated array).
 */
xhrdav.lib.Client.prototype.parseHeaders_ = function(headerStrings) {
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
xhrdav.lib.Client.prototype.canParseXml = function() {
  return (goog.isDef(this.parseXml)) ? true : false;
};

/**
 * Set xml parser function Object.
 *
 * @param {Object} funcObj Xml Parse function Object(defined function: parseXml).
 */
xhrdav.lib.Client.prototype.setXmlParseFunction = function(funcObj) {
  goog.mixin(this, funcObj);
};

/**
 * Callback XHTTPRequest Processing
 *
 * @private
 * @param {Function} handler Callback chain method.
 * @param {Function} debugHandler Callback debugHandler method.
 * @param {Object} event XHR Event Object.
 */
// TODO: UNFIXED Logic
xhrdav.lib.Client.prototype.processRequest_ = function(
  handler, debugHandler, event) {
  var xhr = event.target;

  if (debugHandler && debugHandler instanceof Function) debugHandler(xhr);

  var xssGuard = 'while(1);';
  var headers = this.parseHeaders_(xhr.getAllResponseHeaders());
  var content = xhr.getResponse(xssGuard);
//  if (xhr.getStatus() == 207) {
  if (goog.string.contains(headers['Content-Type'], 'xml')) {
    content = xhr.getResponseXml(xssGuard);
    if (this.canParseXml()) content = this.parseXml(content);
  }
  if (handler) handler(xhr.getStatus() || 500, content, headers);
};

/**
 * Generate URL from path and location
 *
 * @private
 * @param {string} path Path(<code>/foo</code>, <code>/foo/bar.txt</code>).
 */
xhrdav.lib.Client.prototype.generateUrl_ = function(path) {
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
 * @param {goog.net.Uri} url  Uri object.
 * @param {Object=} query Json/Hash object for query.
 * @return {goog.net.Uri}
 */
xhrdav.lib.Client.prototype.setParameters_ = function(url, query) {
  if (goog.isDefAndNotNull(query) && !goog.object.isEmpty(query)) {
    goog.object.forEach(query, function(val, key) {
      if (val instanceof Array && !goog.array.isEmpty(val)) {
        url.setParameterValues(key, val);
      } else if (goog.string.isEmptySafe(val)) {
        url.setParameterValue(key, val);
      }
    });
  }
  return url;
};

/**
 * Send XHTTPRequest
 *
 * @private
 * @param {string} method HTTP method(GET, POST, etc).
 * @param {string} url request url.
 * @param {Function} handler option function of processing after XHTTPRequest.
 * @param {{xhrMgr:goog.net.XhrManager, xhrId,
 *         headers:Object, query:Object}=} opt_request
 *                                          Option params(xhrId, xhrManager, etc);
 * @param {Function=} debugHandler Callback debugHandler method.
 */
xhrdav.lib.Client.prototype.request_ = function(
  method, url, handler, opt_request, debugHandler) {
  if (!goog.isDefAndNotNull(opt_request)) opt_request = {};
  if (goog.isDefAndNotNull(opt_request.xhrMgr)) {
    opt_request.xhrMgr.send(
      opt_request.xhrId || goog.string.createUniqueString(),
      url,
      method,
      opt_request.body,
      opt_request.headers,
      opt_request.priority || 0,
      goog.bind(this.processRequest_, this, handler, debugHandler),
      opt_request.maxRetries || 1);
  } else {
    goog.net.XhrIo.send(
      url,
      goog.bind(this.processRequest_, this, handler, debugHandler),
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
 * @param {{xhrMgr:goog.net.XhrManager, xhrId,
 *         headers:Object, query:Object}=} opt_request
 *                                          Option params(xhrId, xhrManager, etc);
 * @param {Function=} debugHandler Callback debugHandler method.
 */
xhrdav.lib.Client.prototype.options = function(
  path, handler, opt_request, debugHandler) {
  if (!goog.isDefAndNotNull(opt_request)) opt_request = {};
  var url = this.generateUrl_(path);
  this.setParameters_(url, opt_request.query);
  this.request_('OPTIONS', url, handler, opt_request, debugHandler);
};

/**
 * Check Resource(WebDAV: HEAD)
 *
 * @param {string} path Path(<code>/foo/</code>, <code>/foo/bar.txt</code>).
 * @param {Function} handler Callback chain after request processing.
 * @param {{xhrMgr:goog.net.XhrManager, xhrId,
 *         headers:Object, query:Object}=} opt_request
 *                                          Option params(xhrId, xhrManager, etc);
 * @param {Function=} debugHandler Callback debugHandler method.
 */
// TODO: UNFIXED code
xhrdav.lib.Client.prototype.head = function(path, handler, opt_request, debugHandler) {
  if (!goog.isDefAndNotNull(opt_request)) opt_request = {};

  var url = this.generateUrl_(path);
  this.setParameters_(url, opt_request.query);

  if (goog.isDefAndNotNull(opt_request.headers)) {
    goog.object.extend(opt_request.headers, {
      'Cache-Control': 'max-age=0',
      'If-Modified-Since': 'Thu, 01 Jan 1970 00:00:00 GMT'});
  } else {
    goog.object.extend(opt_request, {headers: {
      'Cache-Control': 'max-age=0',
      'If-Modified-Since': 'Thu, 01 Jan 1970 00:00:00 GMT'}});
  }

  this.request_('HEAD', url, handler, opt_request, debugHandler);
};

/**
 * Get Resource(WebDAV: GET)
 *
 * @param {string} path Path(<code>/foo/bar.xml</code>, <code>/foo/bar.txt</code>).
 * @param {Function} handler Callback chain after request processing.
 * @param {{xhrMgr:goog.net.XhrManager, xhrId,
 *         headers:Object, query:Object}=} opt_request
 *                                          Option params(xhrId, xhrManager, etc);
 * @param {Function=} debugHandler Callback debugHandler method.
 */
xhrdav.lib.Client.prototype.get = function(path, handler, opt_request, debugHandler) {
  if (!goog.isDefAndNotNull(opt_request)) opt_request = {};

  var url = this.generateUrl_(path);
  this.setParameters_(url, opt_request.query);
  this.setParameters_(url, opt_request.query);
  this.request_('GET', url, handler, opt_request, debugHandler);
};

/**
 * Upload Resource(WebDAV: PUT)
 *
 * @param {string} path Path(<code>/foo/bar.xml</code>, <code>/foo/bar.txt</code>).
 * @param {Object} data Upload filedata(text OR binary)
 * @param {Function} handler Callback chain after request processing.
 * @param {{xhrMgr:goog.net.XhrManager, xhrId,
 *         headers:Object, query:Object}=} opt_request
 *                                          Option params(xhrId, xhrManager, etc);
 * @param {Function=} debugHandler Callback debugHandler method.
 */
xhrdav.lib.Client.prototype.put = function(
  path, data, handler, opt_request, debugHandler) {
  if (!goog.isDefAndNotNull(opt_request)) opt_request = {};

  var url;
  if (path.match(/^(.+)\/$/)) {
    url = this.generateUrl_(RegExp.$1);
  } else {
    url = this.generateUrl_(path);
  } // Preserve GET
  this.setParameters_(url, opt_request.query);

  if (goog.isDefAndNotNull(opt_request.headers) &&
    !goog.object.isEmpty(opt_request.headers)) {
    goog.object.extend(opt_request.headers, {'Content-Type': 'text/xml'});
  } else {
    opt_request.headers = {'Content-Type': 'text/xml'};
  }
  opt_request.body = data;

  this.request_('PUT', url, handler, opt_request, debugHandler);
};

/**
 * Get Collection list and Resource property(WebDAV: PROPFIND)
 *
 * @param {string} path Path(<code>/foo/</code>, <code>/foo/bar.txt</code>).
 * @param {Function} handler Callback chain after request processing.
 * @param {{xhrMgr:goog.net.XhrManager, xhrId,
 *         headers:Object, query:Object}=} opt_request
 *                                          Option params(xhrId, xhrManager, etc);
 * @param {Function=} debugHandler Callback debugHandler method.
 */
xhrdav.lib.Client.prototype.propfind = function(
  path, handler, opt_request, debugHandler) {
  if (!goog.isDefAndNotNull(opt_request)) opt_request = {};

  var url = this.generateUrl_(path);
  this.setParameters_(url, opt_request.query);

  // 0(path only) or 1(current directory)
  if (goog.isDefAndNotNull(opt_request.headers) &&
    !goog.object.isEmpty(opt_request.headers)) {
    goog.object.extend(opt_request.headers, {
      'Content-Type': 'text/xml',
      'Depth': goog.isDefAndNotNull(opt_request.headers['Depth']) ?
        opt_request.headers['Depth'] : 0});
  } else {
    goog.object.extend(opt_request, {headers: {
      'Content-Type': 'text/xml', 'Depth': 0}});
  }
  goog.object.extend(opt_request, {body:
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<D:propfind xmlns:D="DAV:"><D:allprop /></D:propfind>'});

  this.request_('PROPFIND', url, handler, opt_request, debugHandler);
};

/**
 * Set Collection list and Resource property(WebDAV: PROPPATCH)
 *
 * @param {string} path Path(<code>/foo/</code>, <code>/foo/bar.txt</code>).
 * @param {Function} handler Callback chain after request processing.
 * @param {{xhrMgr:goog.net.XhrManager, xhrId,
 *         headers:Object, query:Object}=} opt_request
 *                                          Option params(xhrId, xhrManager, etc);
 * @param {Function=} debugHandler Callback debugHandler method.
 */
// TODO: UNFIXED
xhrdav.lib.Client.prototype.proppatch = function(path, handler, opt_request, debugHandler) {
  if (!goog.isDefAndNotNull(opt_request)) opt_request = {};

  var url = this.generateUrl_(path);
  this.setParameters_(url, opt_request.query);

  if (goog.isDefAndNotNull(opt_request.headers)) {
    goog.object.extend(opt_request.headers, {'Content-Type': 'text/xml'});
  } else {
    goog.object.extend(opt_request, {headers: {'Content-Type': 'text/xml'}});
  }
};

/**
 * Lock resource(WebDAV: LOCK)
 *
 * @param {string} path Path(<code>/foo/</code>, <code>/foo/bar.txt</code>).
 * @param {Function} handler Callback chain after request processing.
 * @param {{xhrMgr:goog.net.XhrManager, xhrId,
 *         headers:Object, query:Object}=} opt_request
 *                                          Option params(xhrId, xhrManager, etc);
 * @param {Function=} debugHandler Callback debugHandler method.
 */
// TODO: UNFIXED
xhrdav.lib.Client.prototype.lock = function(path, handler, opt_request, debugHandler) {
  if (!goog.isDefAndNotNull(opt_request)) opt_request = {};

  var url = this.generateUrl_(path);
  this.setParameters_(url, opt_request.query);

  if (goog.isDefAndNotNull(opt_request.headers) &&
    !goog.object.isEmpty(opt_request.headers)) {
    goog.object.extend(opt_request.headers, {
      'Content-Type': 'text/xml',
      'Depth': goog.isDefAndNotNull(opt_request.headers['Depth']) ?
        opt_request.headers['Depth'] : 0});
  } else {
    goog.object.extend(opt_request, {headers: {
      'Content-Type': 'text/xml', 'Depth': 0}});
  }
  goog.object.extend(opt_request, {body:
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<D:lockinfo xmlns:D="DAV:">\n'+
    '<D:lockscope><D:' + (opt_request.scope || 'exclusive') + ' /></D:lockscope>\n' +
    '<D:locktype><D:' + (opt_request.type || 'write') + ' /></D:locktype>\n' +
    '<D:owner></D:owner>\n</D:lockinfo>\n'});

  this.request_('LOCK', url, handler, opt_request, debugHandler);
};

/**
 * Create Collection(WebDAV: MKCOL)
 *
 * @param {string} path Path(<code>/foo/</code>, <code>/foo/bar/</code>).
 * @param {Function} handler Callback chain after request processing.
 * @param {{xhrMgr:goog.net.XhrManager, xhrId,
 *         headers:Object, query:Object}=} opt_request
 *                                          Option params(xhrId, xhrManager, etc);
 * @param {Function=} debugHandler Callback debugHandler method.
 */
xhrdav.lib.Client.prototype.mkcol = function(path, handler, opt_request, debugHandler) {
  if (!goog.isDefAndNotNull(opt_request)) opt_request = {};

  path = goog.string.endsWith(path, '/') ? path : path + '/'; // Preserve GET
  var url = this.generateUrl_(path);
  this.setParameters_(url, opt_request.query);
//      var url = goog.Uri.parse('http://localhost:8001/foo/');
  this.request_('MKCOL', url, handler, opt_request, debugHandler);
};

/**
 * Delete Collection or Resource(WebDAV: DELETE)
 *
 * @param {string} path Path(<code>/foo/</code>, <code>/foo/bar.txt</code>).
 * @param {Function} handler Callback chain after request processing.
 * @param {{xhrMgr:goog.net.XhrManager, xhrId,
 *         headers:Object, query:Object}=} opt_request
 *                                          Option params(xhrId, xhrManager, etc);
 * @param {Function=} debugHandler Callback debugHandler method.
 */
xhrdav.lib.Client.prototype._delete = function(
  path, handler, opt_request, debugHandler) {
  if (!goog.isDefAndNotNull(opt_request)) opt_request = {};

  var url = this.generateUrl_(path);
  this.setParameters_(url, opt_request.query);
  this.request_('DELETE', url, handler, opt_request, debugHandler);
};

/**
 * Private method of Copy or Move Collection(WebDAV: COPY/MOVE)
 *
 * @private
 * @param {string} method HTTP method of WebDAV.
 * @param {string} path Source Path(<code>/foo/</code>).
 * @param {string} dstPath Destination Path(<code>/bar/</code>).
 * @param {Function} handler Callback chain after request processing.
 * @param {{xhrMgr:goog.net.XhrManager, xhrId,
 *         headers:Object, query:Object}=} opt_request
 *                                          Option params(xhrId, xhrManager, etc);
 * @param {Function=} debugHandler Callback debugHandler method.
 */
xhrdav.lib.Client.prototype.copyOrMovePath_ = function(
  method, path, dstPath, handler, opt_request, debugHandler) {
  if (!goog.isDefAndNotNull(opt_request)) opt_request = {};

  var url = this.generateUrl_(path);
  this.setParameters_(url, opt_request.query);

  if (goog.isDefAndNotNull(opt_request.headers) &&
    !goog.object.isEmpty(opt_request.headers)) {
    goog.object.extend(opt_request.headers, {
      'Content-Type': 'text/xml',
      'Destination': this.generateUrl_(dstPath)});
  } else {
    goog.object.extend(opt_request, {headers: {
      'Content-Type': 'text/xml',
      'Destination': this.generateUrl_(dstPath)}});
  }
  if (goog.isBoolean(opt_request.headers['Overwrite'])) {
    if (opt_request.headers['Overwrite']) {
      opt_request.headers['Overwrite'] = 'T';
    } else {
      opt_request.headers['Overwrite'] = 'F';
    }
  }

  this.request_(method, url, handler, opt_request, debugHandler);
};

/**
 * Move Collection(WebDAV: MOVE)
 *
 * @see #copyOrMovePath_
 */
xhrdav.lib.Client.prototype.move = function(
  path, dstPath, handler, opt_request, debugHandler) {
  this.copyOrMovePath_('MOVE', path, dstPath, handler, opt_request, debugHandler);
};

/**
 * Copy Collection(WebDAV: COPY)
 *
 * @see #copyOrMovePath_
 */
xhrdav.lib.Client.prototype.copy = function(
  path, dstPath, handler, opt_request, debugHandler) {
  this.copyOrMovePath_('COPY', path, dstPath, handler, opt_request, debugHandler);
};

/* Entry Point for closure compiler */
goog.exportSymbol('xhrdav.lib.Client', xhrdav.lib.Client);
goog.exportProperty(xhrdav.lib.Client.prototype, 'canParseXml',
  xhrdav.lib.Client.prototype.canParseXml);
goog.exportProperty(xhrdav.lib.Client.prototype, 'setXmlParseFunction',
  xhrdav.lib.Client.prototype.setXmlParseFunction);
goog.exportProperty(xhrdav.lib.Client.prototype, 'options',
  xhrdav.lib.Client.prototype.options);
goog.exportProperty(xhrdav.lib.Client.prototype, 'head',
  xhrdav.lib.Client.prototype.head);
goog.exportProperty(xhrdav.lib.Client.prototype, 'get',
  xhrdav.lib.Client.prototype.get);
goog.exportProperty(xhrdav.lib.Client.prototype, 'put',
  xhrdav.lib.Client.prototype.put);
goog.exportProperty(xhrdav.lib.Client.prototype, 'propfind',
  xhrdav.lib.Client.prototype.propfind);
goog.exportProperty(xhrdav.lib.Client.prototype, 'mkcol',
  xhrdav.lib.Client.prototype.mkcol);
goog.exportProperty(xhrdav.lib.Client.prototype, '_delete',
  xhrdav.lib.Client.prototype._delete);
goog.exportProperty(xhrdav.lib.Client.prototype, 'move',
  xhrdav.lib.Client.prototype.move);
goog.exportProperty(xhrdav.lib.Client.prototype, 'copy',
  xhrdav.lib.Client.prototype.copy);

