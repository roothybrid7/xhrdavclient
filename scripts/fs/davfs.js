goog.provide('webdav.fs.DavFs');
goog.require('webdav.Client');
goog.require('webdav.HttpStatus');
goog.require('goog.object');
//goog.require('goog.debug');

/**
 * high-level WebDAV client API
 *
 * @constructor
 */
webdav.fs.DavFs = function() {
};
goog.addSingletonGetter(webdav.fs.DavFs);

/**
 * @private
 * @param {Object=} options URI Parameters(options: scheme, domain, port)
 */
webdav.fs.DavFs.prototype.initialize = function(options) {
  this.client_ = new webdav.Client(options);
};

/**
 * listing collection
 *
 * @param {string} path
 * @param {Function=} opt_callback
 * @param {Object=} options
 */
// TODO: 結果をcacheに格納、cacheにあったらcacheを返す
// TODO: Cacheはpathごとにもつ
//    cache['/'] = goog.ds.XmlDataSource(response, null, 'root');
//    cache['/foo'] = goog.ds.XmlDataSource(response, rootTree, name);
webdav.fs.DavFs.prototype.listDir = function(path, opt_callback, options) {
  if (!goog.isDefAndNotNull(options)) options = {};
  options.depth = 1;
  this.client_.propfind(path, opt_callback, options);
};

/* Entry Point for closure compiler "ADVANCED_OPTIMIZATIONS" option */
goog.exportSymbol('webdav.fs.DavFs.getInstance', webdav.fs.DavFs.getInstance);
goog.exportProperty(webdav.fs.DavFs.prototype, 'initialize', webdav.fs.DavFs.prototype.initialize);
goog.exportProperty(webdav.fs.DavFs.prototype, 'listDir', webdav.fs.DavFs.prototype.listDir);

