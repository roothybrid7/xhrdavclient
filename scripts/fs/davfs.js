/**
 * davfs.js - XHTTPRequest High-level WebDAV Client API.
 * @deprecated 未実装のため使用不可
 * @license Copyright 2011 The xhrdavclient library authors. All rights reserved.
 */

goog.provide('xhrdav.lib.fs.DavFs');
goog.require('xhrdav.lib.Client');
goog.require('xhrdav.lib.HttpStatus');
goog.require('goog.object');
//goog.require('goog.debug');

/**
 * high-level WebDAV client API Singleton
 *
 * @constructor
 */
xhrdav.lib.fs.DavFs = function() {
};
goog.addSingletonGetter(webdav.fs.DavFs);

/**
 * @private
 * @param {Object=} options URI Parameters(options: scheme, domain, port)
 */
xhrdav.lib.fs.DavFs.prototype.initialize = function(options) {
  this.client_ = new xhrdav.lib.Client(options);
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
xhrdav.lib.fs.DavFs.prototype.listDir = function(path, handler, options, debugHandler) {
  if (!goog.isDefAndNotNull(options)) options = {};
  options.depth = 1;  // listing directory
  this.client_.propfind(path, handler, options, debugHandler);
};

/* Entry Point for closure compiler "ADVANCED_OPTIMIZATIONS" option */
goog.exportSymbol('xhrdav.lib.fs.DavFs.getInstance', xhrdav.lib.fs.DavFs.getInstance);
goog.exportProperty(xhrdav.lib.fs.DavFs.prototype, 'initialize', xhrdav.lib.fs.DavFs.prototype.initialize);
goog.exportProperty(xhrdav.lib.fs.DavFs.prototype, 'listDir', xhrdav.lib.fs.DavFs.prototype.listDir);

