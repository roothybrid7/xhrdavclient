goog.provide('webdav.Client');
goog.require('goog.object');
goog.require('goog.Uri');
goog.require('goog.net.XhrManager');

/**
 * WebDAV Client library by Google Closure library.
 *
 * @constructor
 * @param {{scheme, domain, port}} options URI Parameters(options)
 * @see #initialize_
 */
webdav.Client = function(options) {
  this.initialize_(options);
};

/**
 * WebDAV Client initialize
 *
 * @param {{scheme, domain, port}} options URI Parameters(options)
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
 * Get Collection list and Resource property(WebDAV: PROPFIND)
 *
 * @param {string} xhrId XHTTPRequest unique ID(disposal).
 * @param {goog.net.XhrManager} request XHTTPRequest Manager.
 * @param {string} path Path(<code>/foo/</code>, <code>/foo/bar.txt</code>).
 * @param {Function=} callback Callback chain after request processing.
 * @param {Object=} options Option params(depth, etc);
 */
webdav.Client.prototype.propfind = function(xhrId, request, path, callback, options) {
  var url = this.generateUrl_(path);
  var headers = {};
  headers['Content-Type'] = 'application/xml';
  // 0(path only) or 1(current directory)
  headers['Depth'] =
    options && goog.isDefAndNotNull(options.depth) ? options.depth : 1;
  var body = '<?xml version="1.0" encoding="UTF-8"?>' +
    '<D:propfind xmlns:D="DAV:"><D:allprop /></D:propfind>';
  request.send(xhrId, url, 'PROPFIND', body, headers, 0,
    goog.bind(this.processRequest_, this, callback));
};

/**
 * Create Collection(WebDAV: MKCOL)
 *
 * @param {string} xhrId XHTTPRequest unique ID(disposal).
 * @param {goog.net.XhrManager} request XHTTPRequest Manager.
 * @param {string} path Path(<code>/foo/</code>, <code>/foo/bar/</code>).
 * @param {Function=} callback Callback chain after request processing.
 */
webdav.Client.prototype.mkcol = function(xhrId, request, path, callback) {
  var url = this.generateUrl_(path);
//      var url = goog.Uri.parse('http://localhost:8001/foo/');
  request.send(xhrId, url, 'MKCOL', null, null, 0,
    goog.bind(this.processRequest_, this, callback));
};

/**
 * Delete Collection or Resource(WebDAV: DELETE)
 *
 * @param {string} xhrId XHTTPRequest unique ID(disposal).
 * @param {goog.net.XhrManager} request XHTTPRequest Manager.
 * @param {string} path Path(<code>/foo/</code>, <code>/foo/bar.txt</code>).
 * @param {Function=} callback Callback chain after request processing.
 */
webdav.Client.prototype.delete = function(xhrId, request, path, callback) {
  var url = this.generateUrl_(path);
  request.send(xhrId, url, 'DELETE', null, null, 0,
    goog.bind(this.processRequest_, this, callback));
};

/**
 * Private method of Copy or Move Collection(WebDAV: COPY/MOVE)
 *
 * @private
 * @param {string} xhrId XHTTPRequest unique ID(disposal)
 * @param {goog.net.XhrManager} request XHTTPRequest Manager.
 * @param {string} method HTTP method of WebDAV.
 * @param {string} path Source Path(<code>/foo/</code>).
 * @param {string} dstPath Destination Path(<code>/bar/</code>).
 * @param {Function} callback Callback chain after request processing.
 */
webdav.Client.prototype.copyOrMoveDir_ =  function(
  xhrId, request, method, path, dstPath, callback) {
  var url = this.generateUrl_(path);
  var headers = {};
  headers['Content-Type'] = 'application/xml';
  headers['Destination'] = this.generateUrl_(dstPath);
  request.send(xhrId, url, method, null, headers, 0,
    goog.bind(this.processRequest_, this, callback));
};

/**
 * Move Collection(WebDAV: MOVE)
 *
 * @see #copyOrMoveDir_
 */
webdav.Client.prototype.move = function(xhrId, request, dir, dstDir, callback) {
  this.copyOrMoveDir_(xhrId, request, 'MOVE', dir, dstDir, callback);
};

/**
 * Copy Collection(WebDAV: COPY)
 *
 * @see #copyOrMoveDir_
 */
webdav.Client.prototype.copy = function(xhrId, request, dir, dstDir, callback) {
  this.copyOrMoveDir_(xhrId, request, 'COPY', dir, dstDir, callback);
};

