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
 * @param {Object=} options URI Parameters(options: scheme, domain, port)
 * @see #initialize_
 */
xhrdav.lib.Client = function(options) {
  this.initialize_(options);
};

/**
 * WebDAV Client initialize
 *
 * @private
 * @param {Object=} options URI Parameters(options: scheme, domain, port)
 */
xhrdav.lib.Client.prototype.initialize_ = function(options) {
  if (!goog.isDefAndNotNull(options)) {
    options = {};
  }
  var locationUrl = goog.Uri.parse(location);
  /** @type {string} */
  this.scheme_ = options.scheme || locationUrl.getScheme() || 'http';
  /** @type {string} */
  this.domain_ = options.domain || locationUrl.getDomain();
  /** @type {number} */
  this.port_ = options.port || locationUrl.getPort() || 80;
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
 * Send XHTTPRequest
 *
 * @private
 * @param {string} method HTTP method(GET, POST, etc).
 * @param {string} url request url.
 * @param {Function} handler option function of processing after XHTTPRequest.
 * @param {Object=} options option parameters(xhrId, body, headers, etc).
 * @param {Function=} debugHandler Callback debugHandler method.
 */
xhrdav.lib.Client.prototype.request_ = function(
  method, url, handler, options, debugHandler) {
  if (!goog.isDefAndNotNull(options)) options = {};
  if (goog.isDefAndNotNull(options.request)) {
    options.request.send(
      options.xhrId || goog.string.createUniqueString(),
      url,
      method,
      options.body,
      options.headers,
      options.priority || 0,
      goog.bind(this.processRequest_, this, handler, debugHandler),
      options.maxRetries || 1);
  } else {
    goog.net.XhrIo.send(
      url,
      goog.bind(this.processRequest_, this, handler, debugHandler),
      method,
      options.body,
      options.headers);
  }
};

/**
 * Find out which HTTP methods are understood by the server.(WebDAV: OPTIONS)
 *
 * @param {string} path Path(<code>/foo/</code>, <code>/foo/bar.txt</code>).
 * @param {Function} handler Callback chain after request processing.
 * @param {Object=} options Option params(headers, etc);
 * @param {Function=} debugHandler Callback debugHandler method.
 */
xhrdav.lib.Client.prototype.options = function(
  path, handler, options, debugHandler) {
  if (!goog.isDefAndNotNull(options)) options = {};
  var url = this.generateUrl_(path);
  this.request_('OPTIONS', url, handler, options, debugHandler);
};

/**
 * Check Resource(WebDAV: HEAD)
 *
 * Example:
 *   var dav = new xhrdav.lib.Client();
 *   dav.head('/foo/bar.txt', function(status, content, headers) {
 *     // Receive response
 *     var statusCode = status, response = content, responseheaders = headers;
 *     => 200, '', #Object: {'Content-Length': 0, ...}
 *   });
 *
 * @param {string} path Path(<code>/foo/</code>, <code>/foo/bar.txt</code>).
 * @param {Function} handler Callback chain after request processing.
 * @param {Object=} options Option params(headers, etc);
 * @param {Function=} debugHandler Callback debugHandler method.
 */
// TODO: UNFIXED code
xhrdav.lib.Client.prototype.head = function(path, handler, options, debugHandler) {
  if (!goog.isDefAndNotNull(options)) options = {};
  var url = this.generateUrl_(path);

  if (goog.isDefAndNotNull(options.headers)) {
    goog.object.extend(options.headers, {
      'Cache-Control': 'max-age=0',
      'If-Modified-Since': 'Thu, 01 Jan 1970 00:00:00 GMT'});
  } else {
    goog.object.extend(options, {headers: {
      'Cache-Control': 'max-age=0',
      'If-Modified-Since': 'Thu, 01 Jan 1970 00:00:00 GMT'}});
  }

  this.request_('HEAD', url, handler, options, debugHandler);
};

/**
 * Get Resource(WebDAV: GET)
 *
 * Example:
 *   var debugHandler = function(requestObject) { // Debug code here };
 *
 *   var dav = new xhrdav.lib.Client();
 *   dav.get('/foo/bar.txt', function(status, content, headers) {
 *     // Receive response
 *     var statusCode = status, response = content, responseheaders = headers;
 *     => 200, 'GET CONTENT FROM WEBDAV.', #Object: {'Content-Length': 48, ...}
 *   }, null, debugHandler);
 *
 * @param {string} path Path(<code>/foo/bar.xml</code>, <code>/foo/bar.txt</code>).
 * @param {Function} handler Callback chain after request processing.
 * @param {Object=} options Option params(headers, etc);
 * @param {Function=} debugHandler Callback debugHandler method.
 */
xhrdav.lib.Client.prototype.get = function(path, handler, options, debugHandler) {
  if (!goog.isDefAndNotNull(options)) options = {};
  var url = this.generateUrl_(path);
  this.request_('GET', url, handler, options, debugHandler);
};

/**
 * Upload Resource(WebDAV: PUT)
 *
 * Example:
 *   var mgr = new goog.net.XhrManager();
 *   var id = goog.string.createUniqueString();
 *   var options = {xhrId: id, request: mgr};
 *   var dav = new xhrdav.lib.Client();
 *   dav.put('/foo/upload.txt', 'UPLOAD test', function(status, content, headers) {
 *     // Receive response
 *     var statusCode = status, response = content, responseheaders = headers;
 *     => 201, string: <html> ...</html>, #Object: {'Location': http:// ...}
 *   }, options);
 *
 * @param {string} path Path(<code>/foo/bar.xml</code>, <code>/foo/bar.txt</code>).
 * @param {Object} data Upload filedata(text OR binary)
 * @param {Function} handler Callback chain after request processing.
 * @param {Object=} options Option params(xhrId, xhrManager, etc);
 * @param {Function=} debugHandler Callback debugHandler method.
 */
xhrdav.lib.Client.prototype.put = function(
  path, data, handler, options, debugHandler) {
  if (!goog.isDefAndNotNull(options)) options = {};
  var url = this.generateUrl_(path);

  if (goog.isDefAndNotNull(options.headers)) {
    goog.object.extend(options.headers, {'Content-Type': 'text/xml'});
  } else {
    goog.object.extend(options, {headers: {'Content-Type': 'text/xml'}});
  }
  goog.object.extend(options, {body: data});

  this.request_('PUT', url, handler, options, debugHandler);
};

/**
 * Get Collection list and Resource property(WebDAV: PROPFIND)
 *
 * Example: Receive Response and debug
 *   var options = {depth: 1};
 *   var myPrefix = 'PROPFIND#';
 *   var debugHandler = function(prefix, requestObject) { // Debug code here };
 *
 *   var dav = new xhrdav.lib.Client();
 *   dav.propfind('/foo/', function(status, content, headers) {
 *     // Receive response
 *     var statusCode = status, response = content, responseheaders = headers;
 *     => 207, #Document: <?xml ....</D:multistatus>,
 *        #Object: {'Content-Length': 48, ...}
 *   }, options, goog.partial(debugHandler, myPrefix));
 *
 * Example2: Parse response
 *   var options = {depth: 1};
 *   var parseXml = function(handler, status, content, headers) {
 *       // [... parse xml ...]
 *      handler(responseObj);
 *   };
 *   var modelHandler = function(object) { // [... building models ...] };
 *
 *   var dav = new xhrdav.lib.Client();
 *   dav.propfind('/foo/', goog.partial(parseXml, modelHandler), options);
 *
 * @param {string} path Path(<code>/foo/</code>, <code>/foo/bar.txt</code>).
 * @param {Function} handler Callback chain after request processing.
 * @param {Object=} options Option params(depth, etc);
 * @param {Function=} debugHandler Callback debugHandler method.
 */
xhrdav.lib.Client.prototype.propfind = function(
  path, handler, options, debugHandler) {
  if (!goog.isDefAndNotNull(options)) options = {};
  var url = this.generateUrl_(path);

  // 0(path only) or 1(current directory)
  if (goog.isDefAndNotNull(options.headers)) {
    goog.object.extend(options.headers, {
      'Content-Type': 'text/xml',
      'Depth': goog.isDefAndNotNull(options.depth) ? options.depth : 0});
  } else {
    goog.object.extend(options, {headers: {
      'Content-Type': 'text/xml',
      'Depth': goog.isDefAndNotNull(options.depth) ? options.depth : 0}});
  }
  goog.object.extend(options, {body:
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<D:propfind xmlns:D="DAV:"><D:allprop /></D:propfind>'});

  this.request_('PROPFIND', url, handler, options, debugHandler);
};

/**
 * Set Collection list and Resource property(WebDAV: PROPPATCH)
 *
 * @param {string} path Path(<code>/foo/</code>, <code>/foo/bar.txt</code>).
 * @param {Function} handler Callback chain after request processing.
 * @param {Object=} options Option params(depth, etc);
 * @param {Function=} debugHandler Callback debugHandler method.
 */
// TODO: UNFIXED
xhrdav.lib.Client.prototype.proppatch = function(path, handler, options, debugHandler) {
  if (!goog.isDefAndNotNull(options)) options = {};
  var url = this.generateUrl_(path);

  if (goog.isDefAndNotNull(options.headers)) {
    goog.object.extend(options.headers, {'Content-Type': 'text/xml'});
  } else {
    goog.object.extend(options, {headers: {'Content-Type': 'text/xml'}});
  }
};

/**
 * Lock resource(WebDAV: LOCK)
 *
 * @param {string} path Path(<code>/foo/</code>, <code>/foo/bar.txt</code>).
 * @param {Function} handler Callback chain after request processing.
 * @param {Object=} options Option params(depth, etc);
 * @param {Function=} debugHandler Callback debugHandler method.
 */
// TODO: UNFIXED
xhrdav.lib.Client.prototype.lock = function(path, handler, options, debugHandler) {
  if (!goog.isDefAndNotNull(options)) options = {};
  var url = this.generateUrl_(path);

  if (goog.isDefAndNotNull(options.headers)) {
    goog.object.extend(options.headers, {
      'Content-Type': 'text/xml',
      'Depth': goog.isDefAndNotNull(options.depth) ? options.depth : 0});
  } else {
    goog.object.extend(options, {headers: {
      'Content-Type': 'text/xml',
      'Depth': goog.isDefAndNotNull(options.depth) ? options.depth : 0}});
  }
  goog.object.extend(options, {body:
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<D:lockinfo xmlns:D="DAV:">\n'+
    '<D:lockscope><D:' + (options.scope || 'exclusive') + ' /></D:lockscope>\n' +
    '<D:locktype><D:' + (options.type || 'write') + ' /></D:locktype>\n' +
    '<D:owner></D:owner>\n</D:lockinfo>\n'});

  this.request_('LOCK', url, handler, options, debugHandler);
};

/**
 * Create Collection(WebDAV: MKCOL)
 *
 * Example:
 *   var mgr = new goog.net.XhrManager();
 *   var id = goog.string.createUniqueString();
 *   var options = {xhrId: id, request: mgr};
 *   var dav = new xhrdav.lib.Client();
 *   dav.mkcol('/foo/bar/', function(status, content, headers) {
 *     // Receive response
 *     var statusCode = status, response = content, responseheaders = headers;
 *     => 201, string: '<html> ... </html>', #Object: {'Location': 'http:// ...}
 *   }, options);
 *
 * @param {string} path Path(<code>/foo/</code>, <code>/foo/bar/</code>).
 * @param {Function} handler Callback chain after request processing.
 * @param {Object=} options Option params(xhrId, xhrManager, etc);
 * @param {Function=} debugHandler Callback debugHandler method.
 */
xhrdav.lib.Client.prototype.mkcol = function(path, handler, options, debugHandler) {
  if (!goog.isDefAndNotNull(options)) options = {};
  path = goog.string.endsWith(path, '/') ? path : path + '/'; // Preserve GET
  var url = this.generateUrl_(path);
//      var url = goog.Uri.parse('http://localhost:8001/foo/');
  this.request_('MKCOL', url, handler, options, debugHandler);
};

/**
 * Delete Collection or Resource(WebDAV: DELETE)
 *
 * Example:
 *   var mgr = new goog.net.XhrManager();
 *   var id = goog.string.createUniqueString();
 *   var options = {xhrId: id, request: mgr};
 *   var dav = new xhrdav.lib.Client();
 *   dav._delete('/foo/bar/', function(status, content, headers) {
 *     // Receive response
 *     var statusCode = status, response = content, responseheaders = headers;
 *     => 204, string: '', #Object: {'Content-Length': 0, ...}
 *   }, options);
 *
 * @param {string} path Path(<code>/foo/</code>, <code>/foo/bar.txt</code>).
 * @param {Function} handler Callback chain after request processing.
 * @param {Object=} options Option params(xhrId, xhrManager, etc);
 * @param {Function=} debugHandler Callback debugHandler method.
 */
xhrdav.lib.Client.prototype._delete = function(
  path, handler, options, debugHandler) {
  if (!goog.isDefAndNotNull(options)) options = {};
  var url = this.generateUrl_(path);
  this.request_('DELETE', url, handler, options, debugHandler);
};

/**
 * Private method of Copy or Move Collection(WebDAV: COPY/MOVE)
 *
 * @private
 * @param {string} method HTTP method of WebDAV.
 * @param {string} path Source Path(<code>/foo/</code>).
 * @param {string} dstPath Destination Path(<code>/bar/</code>).
 * @param {Function} handler Callback chain after request processing.
 * @param {Object=} options Option params(xhrId, xhrManager, etc);
 * @param {Function=} debugHandler Callback debugHandler method.
 */
xhrdav.lib.Client.prototype.copyOrMovePath_ = function(
  method, path, dstPath, handler, options, debugHandler) {
  if (!goog.isDefAndNotNull(options)) options = {};
  var url = this.generateUrl_(path);

  if (goog.isDefAndNotNull(options.headers)) {
    goog.object.extend(options.headers, {
      'Content-Type': 'text/xml',
      'Destination': this.generateUrl_(dstPath)});
  } else {
    goog.object.extend(options, {headers: {
      'Content-Type': 'text/xml',
      'Destination': this.generateUrl_(dstPath)}});
  }
  if (goog.isBoolean(options.overwrite)) {
    if (options.overwrite) {
      options.headers['Overwrite'] = 'T';
    } else {
      options.headers['Overwrite'] = 'F';
    }
  }

  this.request_(method, url, handler, options, debugHandler);
};

/**
 * Move Collection(WebDAV: MOVE)
 *
 * Example:
 *   var mgr = new goog.net.XhrManager();
 *   var id = goog.string.createUniqueString();
 *   var options = {xhrId: id, request: mgr};
 *   var dav = new xhrdav.lib.Client();
 *   dav.move('/foo/bar.txt', '/hoge/', function(status, content, headers) {
 *     // Receive response
 *     var statusCode = status, response = content, responseheaders = headers;
 *     => 201, string: '<html> ... </html>', #Object: {'Location': 'http:// ...}
 *   }, options);
 *
 * @see #copyOrMovePath_
 */
xhrdav.lib.Client.prototype.move = function(
  path, dstPath, handler, options, debugHandler) {
  this.copyOrMovePath_('MOVE', path, dstPath, handler, options, debugHandler);
};

/**
 * Copy Collection(WebDAV: COPY)
 *
 * Example:
 *   var mgr = new goog.net.XhrManager();
 *   var id = goog.string.createUniqueString();
 *   var options = {xhrId: id, request: mgr};
 *   var dav = new xhrdav.lib.Client();
 *   dav.copy('/foo/bar.txt', '/hoge/bar.txt', function(status, content, headers) {
 *     // Receive response
 *     var statusCode = status, response = content, responseheaders = headers;
 *     => 201, string: '<html> ... </html>', #Object: {'Location': 'http:// ...}
 *   }, options);
 *
 * @see #copyOrMovePath_
 */
xhrdav.lib.Client.prototype.copy = function(
  path, dstPath, handler, options, debugHandler) {
  this.copyOrMovePath_('COPY', path, dstPath, handler, options, debugHandler);
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

