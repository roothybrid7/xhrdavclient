/**
 * @fileoverview XHTTPRequest Low-level WebDAV Client API.
 */

goog.provide('webdav.Client');
goog.require('goog.object');
goog.require('goog.Uri');
goog.require('goog.net.XhrIo');
goog.require('goog.net.XhrManager');
//goog.require('goog.debug');

/**
 * WebDAV Client library by Google Closure library.
 *
 * @constructor
 * @param {Object=} options URI Parameters(options: scheme, domain, port)
 * @see #initialize_
 */
webdav.Client = function(options) {
  this.initialize_(options);
};

/**
 * WebDAV Client initialize
 *
 * @private
 * @param {Object=} options URI Parameters(options: scheme, domain, port)
 */
webdav.Client.prototype.initialize_ = function(options) {
  if (!goog.isDefAndNotNull(options)) {
    options = {};
  }
  var locationUrl = goog.Uri.parse(location);
  this.scheme_ = options.scheme || locationUrl.getScheme() || 'http';
  this.domain_ = options.domain || locationUrl.getDomain();
  this.port_ = options.port || locationUrl.getPort() || 80;
};

/**
 * Callback XHTTPRequest Processing
 *
 * @private
 * @param {Function} callback Callback chain method
 * @param {Object} e XHR Event Object
 * @deprecated UNFIXED Logic
 */
webdav.Client.prototype.processRequest_ = function(callback, event) {
  var xhr = event.target;
  callback(xhr);
};

/**
 * Generate URL from path and location
 *
 * @private
 * @param {string} path Path(<code>/foo</code>, <code>/foo/bar.txt</code>).
 */
webdav.Client.prototype.generateUrl_ = function(path) {
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
 * @param {Function=} opt_callback option function of processing after XHTTPRequest.
 * @param {Object=} options option parameters(xhrId, body, headers, etc).
 */
webdav.Client.prototype.request_ = function(method, url, opt_callback, options) {
  if (!goog.isDefAndNotNull(options)) options = {};
  if (goog.isDefAndNotNull(options.request)) {
    options.request.send(
      options.xhrId || goog.string.createUniqueString(),
      url,
      method,
      options.body,
      options.headers,
      options.priority || 0,
      goog.isDefAndNotNull(opt_callback) ?
        goog.bind(this.processRequest_, this, opt_callback) : null,
      options.maxRetries || 1);
  } else {
    goog.net.XhrIo.send(
      url,
      goog.isDefAndNotNull(opt_callback) ?
        goog.bind(this.processRequest_, this, opt_callback) : null,
      method,
      options.body,
      options.headers);
  }
};

/**
 * Find out which HTTP methods are understood by the server.(WebDAV: OPTIONS)
 *
 * @param {string} path Path(<code>/foo/</code>, <code>/foo/bar.txt</code>).
 * @param {Function=} opt_callback Callback chain after request processing.
 * @param {Object=} options Option params(headers, etc);
 */
webdav.Client.prototype.options = function(path, opt_callback, options) {
  if (!goog.isDefAndNotNull(options)) options = {};
  var url = this.generateUrl_(path);
  this.request_('OPTIONS', url, opt_callback, options);
};

/**
 * Check Resource(WebDAV: HEAD)
 *
 * @param {string} path Path(<code>/foo/</code>, <code>/foo/bar.txt</code>).
 * @param {Function=} opt_callback Callback chain after request processing.
 * @param {Object=} options Option params(headers, etc);
 * @deprecated UNFIXED Testing!!
 */
webdav.Client.prototype.head = function(path, opt_callback, options) {
  if (!goog.isDefAndNotNull(options)) options = {};
  var url = this.generateUrl_(path);
  goog.object.extend(options, {
    headers: {
      'Cache-Control': 'max-age=0',
      'If-Modified-Since': 'Thu, 01 Jan 1970 00:00:00 GMT',
    }
  });
  this.request_('HEAD', url, opt_callback, options);
};

/**
 * Get Resource(WebDAV: GET)
 *
 * @param {string} path Path(<code>/foo/bar.xml</code>, <code>/foo/bar.txt</code>).
 * @param {Function=} opt_callback Callback chain after request processing.
 * @param {Object=} options Option params(headers, etc);
 */
webdav.Client.prototype.get = function(path, opt_callback, options) {
  if (!goog.isDefAndNotNull(options)) options = {};
  var url = this.generateUrl_(path);
  this.request_('GET', url, opt_callback, options);
};

/**
 * Upload Resource(WebDAV: PUT)
 *
 * @param {string} path Path(<code>/foo/bar.xml</code>, <code>/foo/bar.txt</code>).
 * @param {Function=} opt_callback Callback chain after request processing.
 * @param {Object=} options Option params(xhrId, xhrManager, etc);
 */
webdav.Client.prototype.put = function(path, data, opt_callback, options) {
  if (!goog.isDefAndNotNull(options)) options = {};
  var url = this.generateUrl_(path);
  goog.object.extend(options, {
    headers: {'Content-Type': 'text/xml'},
    body: data,
  });
  this.request_('PUT', url, opt_callback, options);
};

/**
 * Get Collection list and Resource property(WebDAV: PROPFIND)
 *
 * @param {string} path Path(<code>/foo/</code>, <code>/foo/bar.txt</code>).
 * @param {Function=} opt_callback Callback chain after request processing.
 * @param {Object=} options Option params(depth, etc);
 */
webdav.Client.prototype.propfind = function(path, opt_callback, options) {
  if (!goog.isDefAndNotNull(options)) options = {};
  var url = this.generateUrl_(path);
  goog.object.extend(options, {
    headers: {
      'Content-Type': 'text/xml',
      'Depth': goog.isDefAndNotNull(options.depth) ? options.depth : 1,
    },
    // 0(path only) or 1(current directory)
    body: '<?xml version="1.0" encoding="UTF-8"?>' +
      '<D:propfind xmlns:D="DAV:"><D:allprop /></D:propfind>',
  });
  this.request_('PROPFIND', url, opt_callback, options);
};

/**
 * Set Collection list and Resource property(WebDAV: PROPPATCH)
 *
 * @param {string} path Path(<code>/foo/</code>, <code>/foo/bar.txt</code>).
 * @param {Function=} opt_callback Callback chain after request processing.
 * @param {Object=} options Option params(depth, etc);
 * @deprecated UNFIXED Testing!!
 */
webdav.Client.prototype.proppatch = function(path, opt_callback, options) {
  if (!goog.isDefAndNotNull(options)) options = {};
  var url = this.generateUrl_(path);
  goog.object.extend(options, {
    headers: {'Content-Type': 'text/xml'},
    body: {}
  });
};

/**
 * Lock resource(WebDAV: LOCK)
 *
 * @param {string} path Path(<code>/foo/</code>, <code>/foo/bar.txt</code>).
 * @param {Function=} opt_callback Callback chain after request processing.
 * @param {Object=} options Option params(depth, etc);
 * @deprecated UNFIXED Testing!!
 */
webdav.Client.prototype.lock = function(path, opt_callback, options) {
  if (!goog.isDefAndNotNull(options)) options = {};
  var url = this.generateUrl_(path);
  goog.object.extend(options, {
    headers: {
      'Content-Type': 'text/xml',
      'Depth': goog.isDefAndNotNull(options.depth) ? options.depth : 0,
    },
    body: '<?xml version="1.0" encoding="UTF-8"?>' +
      '<D:lockinfo xmlns:D="DAV:">\n'+
      '<D:lockscope><D:' + (options.scope || 'exclusive') + ' /></D:lockscope>\n' +
      '<D:locktype><D:' + (options.type || 'write') + ' /></D:locktype>\n' +
      '<D:owner></D:owner>\n</D:lockinfo>\n',
  });
alert(options.body);
  this.request_('LOCK', url, opt_callback, options);
};

/**
 * Create Collection(WebDAV: MKCOL)
 *
 * @param {string} path Path(<code>/foo/</code>, <code>/foo/bar/</code>).
 * @param {Function=} opt_callback Callback chain after request processing.
 * @param {Object=} options Option params(xhrId, xhrManager, etc);
 */
webdav.Client.prototype.mkcol = function(path, opt_callback, options) {
  if (!goog.isDefAndNotNull(options)) options = {};
  var url = this.generateUrl_(path);
//      var url = goog.Uri.parse('http://localhost:8001/foo/');
  this.request_('MKCOL', url, opt_callback, options);
};

/**
 * Delete Collection or Resource(WebDAV: DELETE)
 *
 * @param {string} path Path(<code>/foo/</code>, <code>/foo/bar.txt</code>).
 * @param {Function=} opt_callback Callback chain after request processing.
 * @param {Object=} options Option params(xhrId, xhrManager, etc);
 */
webdav.Client.prototype.delete = function(path, opt_callback, options) {
  if (!goog.isDefAndNotNull(options)) options = {};
  var url = this.generateUrl_(path);
  this.request_('DELETE', url, opt_callback, options);
};

/**
 * Private method of Copy or Move Collection(WebDAV: COPY/MOVE)
 *
 * @private
 * @param {string} method HTTP method of WebDAV.
 * @param {string} path Source Path(<code>/foo/</code>).
 * @param {string} dstPath Destination Path(<code>/bar/</code>).
 * @param {Function=} opt_callback Callback chain after request processing.
 * @param {Object=} options Option params(xhrId, xhrManager, etc);
 */
webdav.Client.prototype.copyOrMoveDir_ = function(
  method, path, dstPath, opt_callback, options) {
  if (!goog.isDefAndNotNull(options)) options = {};
  var url = this.generateUrl_(path);
  goog.object.extend(options, {
    headers: {
      'Content-Type': 'text/xml',
      'Destination': this.generateUrl_(dstPath),
    }
  });
  if (goog.isBoolean(options.overwrite)) {
    if (options.overwrite) {
      options.headers['Overwrite'] = 'T';
    } else {
      options.headers['Overwrite'] = 'F';
    }
  }
  this.request_(method, url, opt_callback, options);
};

/**
 * Move Collection(WebDAV: MOVE)
 *
 * @see #copyOrMoveDir_
 */
webdav.Client.prototype.move = function(dir, dstDir, opt_callback, options) {
  this.copyOrMoveDir_('MOVE', dir, dstDir, opt_callback, options);
};

/**
 * Copy Collection(WebDAV: COPY)
 *
 * @see #copyOrMoveDir_
 */
webdav.Client.prototype.copy = function(dir, dstDir, opt_callback, options) {
  this.copyOrMoveDir_('COPY', dir, dstDir, opt_callback, options);
};

/* Entry Point for closure compiler "ADVANCED_OPTIMIZATIONS" option */
goog.exportSymbol('webdav.Client', webdav.Client);
goog.exportProperty(webdav.Client.prototype, 'options', webdav.Client.prototype.options);
goog.exportProperty(webdav.Client.prototype, 'head', webdav.Client.prototype.head);
goog.exportProperty(webdav.Client.prototype, 'get', webdav.Client.prototype.get);
goog.exportProperty(webdav.Client.prototype, 'put', webdav.Client.prototype.put);
goog.exportProperty(webdav.Client.prototype, 'propfind', webdav.Client.prototype.propfind);
goog.exportProperty(webdav.Client.prototype, 'mkcol', webdav.Client.prototype.mkcol);
goog.exportProperty(webdav.Client.prototype, 'delete', webdav.Client.prototype.delete);
goog.exportProperty(webdav.Client.prototype, 'move', webdav.Client.prototype.move);
goog.exportProperty(webdav.Client.prototype, 'copy', webdav.Client.prototype.copy);

