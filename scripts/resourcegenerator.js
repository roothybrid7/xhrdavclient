/**
 * resourcegenerator.js - xhrdavclient resource object generator
 *
 * @license Copyright 2011 The xhrdavclient library authors. All rights reserved.
 */

goog.provide('xhrdav.lib.ResourceGenerator');
goog.require('xhrdav.lib.Config');
goog.require('xhrdav.lib.Resource');

/**
 * xhrdavclient resource generator
 *
 * @constructor
 * @param {xhrdav.lib.Resource=} resource  Json/Hash object for WebDAV resource.
 * @see xhrdav.lib.Resource
 */
xhrdav.lib.ResourceGenerator = function(resource) {
  if (goog.isDefAndNotNull(resource) && resource instanceof xhrdav.lib.Resource) {
    goog.mixin(this, resource);
  } else {
    goog.mixin(this, new xhrdav.lib.Resource());
  }
};

/**
 * Serialize resource
 *
 * @return {xhrdav.lib.Resource} converted Json/Hash object for WebDAV resource.
 * @see xhrdav.lib.Resource
 */
xhrdav.lib.ResourceGenerator.prototype.serialize = function() {
  var resource = new xhrdav.lib.Resource();
//  resource.href = this.href;
  goog.object.forEach(this, function(val, key) {
    if (goog.object.containsKey(resource, key)) {
      goog.object.set(resource, key, val);
    }
  });
  return resource;
};

/**
 * Setter destination
 *
 * @param {string} dest Destination path.
 */
xhrdav.lib.ResourceGenerator.prototype.setDestination = function(dest) {
  /** @type {string} */
  this.destination_ = dest;
};

/**
 * Getter destination
 *
 * @return {string} Destination path.
 */
xhrdav.lib.ResourceGenerator.prototype.getDestination = function() {
  return this.destination_ || null;
};

/**
 * Remove resource [Class method]
 *
 * @param {(xhrdav.lib.ResourceGenerator|xhrdav.lib.Resource)} resoruce
 *                                        Json/Hash object for WebDAV resoruce.
 * @param {Function=} handler callback handler function
 *                            [callback args: errors object]
 * @param {Object=} opt_headers Request headers.
 * @param {object=} opt_params  Request query params.
 * @param {Fuction=} debugHandler [Callback args: xhr event object]
 * @throws {Error} Not found of xhrdav.lib.Resource or #destination
 */
xhrdav.lib.ResourceGenerator.remove = function(
  resource, handler, opt_headers, opt_params, debugHandler) {
  // TODO: Implements
  // resource.hrefのパスを削除する
};

/**
 * Remove resource
 *
 * @param {Function=} handler callback handler function
 *                            [callback args: errors object]
 * @param {Object=} opt_headers Request headers.
 * @param {object=} opt_params  Request query params.
 * @param {Fuction=} debugHandler [Callback args: xhr event object]
 * @throws {Error} Not found of xhrdav.lib.Resource or #destination
 * @see xhrdav.lib.ResourceGenerator.remove
 */
xhrdav.lib.ResourceGenerator.prototype.remove = function(
  handler, opt_headers, opt_params, debugHandler) {
  // TODO: Implements
  // 同名のクラスメソッドに投げる
};

/**
 * Copy resource [Class method]
 *
 * @param {(xhrdav.lib.ResourceGenerator|xhrdav.lib.Resource)} resoruce
 *                                        Json/Hash object for WebDAV resoruce.
 * @param {string} dest Copy destination Path <code>/mydav/bar/</code>.
 * @param {Function=} handler callback handler function
 *                            [callback args: errors object]
 * @param {Object=} opt_headers Request headers.
 * @param {object=} opt_params  Request query params.
 * @param {Fuction=} debugHandler [Callback args: xhr event object]
 * @throws {Error} Not found of xhrdav.lib.Resource or #destination
 */
xhrdav.lib.ResourceGenerator.copy = function(
  resource, dest, handler, opt_headers, opt_params, debugHandler) {
//  if (!this.destination) // Errors
  // TODO: Implements
  // resource.hrefのパスとresourcetypeをチェックして、ファイルかディレクトリかを判別
  // ディレクトリの場合:
  //  destPathの末尾がresource.hrefの末尾なら、destの末尾に'/'を補完してcopy
  //  違う場合は、destの末尾にresource.hrefの末尾を追加してcopy
  // ファイルの場合:
  //  destPathの末尾がresource.hrefの末尾なら、destの末尾に'/'があった場合削除してcopy
  //  違う場合は、destをディレクトリと見なし、destの末尾に'/'を補完してから
  //  resource.hrefの末尾を追加してcopy
};

/**
 * Copy resource
 *
 * @param {Function=} handler callback handler function
 *                            [callback args: errors object]
 * @param {Object=} opt_headers Request headers.
 * @param {object=} opt_params  Request query params.
 * @param {Fuction=} debugHandler [Callback args: xhr event object]
 * @throws {Error} Not found of xhrdav.lib.Resource or #destination
 * @see xhrdav.lib.ResourceGenerator.copy
 */
xhrdav.lib.ResourceGenerator.prototype.copy = function(
  handler, opt_headers, opt_params, debugHandler) {
//  if (!this.destination) // Errors
  // TODO: Implements
};

/**
 * Move resoruce [Class method]
 *
 * @param {(xhrdav.lib.ResourceGenerator|xhrdav.lib.Resource)} resoruce
 *                                        Json/Hash object for WebDAV resoruce.
 * @param {string} dest Move destination Path <code>/mydav/bar/</code>.
 * @param {Function=} handler callback handler function
 *                            [callback args: errors object]
 * @param {Object=} opt_headers Request headers.
 * @param {object=} opt_params  Request query params.
 * @param {Fuction=} debugHandler [Callback args: xhr event object]
 * @throws {Error} Not found of xhrdav.lib.Resource or #destination
 */
xhrdav.lib.ResourceGenerator.move = function(
  resoruce, dest, handler, opt_headers, opt_params, debugHandler) {
//  if (!this.destination) // Errors
  // TODO: Implements
//  if (!this.destination) // Errors
  // TODO: Implements
  // resource.hrefのパスとresourcetypeをチェックして、ファイルかディレクトリかを判別
  // ディレクトリの場合:
  //  destPathの末尾がresource.hrefの末尾なら、destの末尾に'/'を補完してmove
  //  違う場合は、destの末尾にresource.hrefの末尾を追加してmove
  // ファイルの場合:
  //  destPathの末尾がresource.hrefの末尾なら、destの末尾に'/'があった場合削除してmove
  //  違う場合は、destをディレクトリと見なし、destの末尾に'/'を補完してから
  //  resource.hrefの末尾を追加してmove
};

/**
 * Move resoruce
 *
 * @param {Function=} handler callback handler function
 *                            [callback args: errors object]
 * @param {Object=} opt_headers Request headers.
 * @param {object=} opt_params  Request query params.
 * @param {Fuction=} debugHandler [Callback args: xhr event object]
 * @throws {Error} Not found of Resource or #destination
 * @see xhrdav.lib.ResourceGenerator.move
 */
xhrdav.lib.ResourceGenerator.prototype.move = function(
  handler, opt_headers, opt_params, debugHandler) {
//  if (!this.destination) // Errors
  // TODO: Implements
}

/**
 * Rename resource [Class method]
 *
 * @param {(xhrdav.lib.ResourceGenerator|xhrdav.lib.Resource)} resource
 *                                        Json/Hash object for WebDAV resource.
 * @param {string} dest New resource name.
 * @param {Function=} handler callback handler function
 *                            [callback args: errors object]
 * @param {Object=} opt_headers Request headers.
 * @param {object=} opt_params  Request query params.
 * @param {Function=} debugHandler  [Callback args: errors object]
 * @throws {Error} Not found of xhrdav.lib.Resource or #destination
 */
xhrdav.lib.ResourceGenerator.rename = function(
  resource, dest, handler, opt_headers, opt_params, debugHandler) {
  // TODO: Implements
  // resource.hrefのパスとresourcetypeをチェックして、ファイルかディレクトリかを判別
  // ディレクトリの場合:
  //  先頭にresource.hrefのディレクトリパスを追加し、destの末尾に'/'を補完してrename
  // ファイルの場合:
  //  先頭にresource.hrefのディレクトリパスを追加してrename
};

/**
 * Rename resource
 *
 * @param {Function=} handler callback handler function
 *                            [callback args: errors object]
 * @param {Object=} opt_headers Request headers.
 * @param {object=} opt_params  Request query params.
 * @param {Function=} debugHandler  [Callback args: errors object]
 * @throws {Error} Not found of xhrdav.lib.Resource or #destination
 */
xhrdav.lib.ResourceGenerator.prototype.rename = function(
  handler, opt_headers, opt_params, debugHandler) {
  // TODO: Implements
};


/* Entry point for closure compiler */
goog.exportSymbol('xhrdav.lib.ResourceGenerator', xhrdav.lib.ResourceGenerator);
goog.exportProperty(xhrdav.lib.ResourceGenerator.prototype, 'serialize',
  xhrdav.lib.ResourceGenerator.prototype.serialize);
goog.exportProperty(xhrdav.lib.ResourceGenerator.prototype, 'setDestination',
  xhrdav.lib.ResourceGenerator.prototype.setDestination);
goog.exportProperty(xhrdav.lib.ResourceGenerator.prototype, 'getDestination',
  xhrdav.lib.ResourceGenerator.prototype.getDestination);
goog.exportSymbol('xhrdav.lib.ResourceGenerator.remove',
  xhrdav.lib.ResourceGenerator.remove);
goog.exportProperty(xhrdav.lib.ResourceGenerator.prototype, 'remove',
  xhrdav.lib.ResourceGenerator.prototype.remove);
goog.exportSymbol('xhrdav.lib.ResourceGenerator.copy',
  xhrdav.lib.ResourceGenerator.copy);
goog.exportProperty(xhrdav.lib.ResourceGenerator.prototype, 'copy',
  xhrdav.lib.ResourceGenerator.prototype.copy);
goog.exportSymbol('xhrdav.lib.ResourceGenerator.move',
  xhrdav.lib.ResourceGenerator.move);
goog.exportProperty(xhrdav.lib.ResourceGenerator.prototype, 'move',
  xhrdav.lib.ResourceGenerator.prototype.move);

