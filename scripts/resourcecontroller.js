/**
 * resourcecontroller.js - xhrdavclient resource object controller
 *
 * This is a WebDAV resource controller.
 * A single resource simply copy, move, rename, delete support.
 *
 * @license Copyright 2011 The xhrdavclient library authors. All rights reserved.
 */

goog.provide('xhrdav.lib.ResourceController');
goog.require('xhrdav.lib.Config');
goog.require('xhrdav.lib.Resource');

/**
 * xhrdavclient resource controller
 *
 * @constructor
 * @param {(xhrdav.lib.Resource|Object}=} resource  Json/Hash object for WebDAV resource.
 * @see xhrdav.lib.Resource
 */
xhrdav.lib.ResourceController = function(resource) {
  if (resource instanceof xhrdav.lib.Resource) {
    // Mixin model property and data.
    goog.mixin(this, resource);
  } else {
    var model;
    if (goog.isDefAndNotNull(resource)) {
      // Mixin model property and import supported property data.
      model = xhrdav.lib.ResourceController.serialize(resource, true);
    } else {
      // Mixin model property and create new.
      model = new xhrdav.lib.Resource();
    }
    goog.mixin(this, model);
  }
};

/**
 * Serialize resource [Class method]
 *
 * @param {(xhrdav.lib.ResourceController|xhrdavlib.Resource|Object)} resource
 * @param {boolean} asModel true: xhrdav.lib.Resource, false: {}
 * @return {(xhrdav.lib.Resource|Object)} converted Json/Hash object for WebDAV resource.
 * @see xhrdav.lib.Resource
 */
xhrdav.lib.ResourceController.serialize = function(resource, asModel) {
  var newResource;
  if (!!asModel) {
    newResource = new xhrdav.lib.Resource();
  } else {
    newResource = {}, goog.mixin(newResource, new xhrdav.lib.Resource());
  }

  goog.object.forEach(resource, function(val, key) {
    if (goog.object.containsKey(newResource, key)) {
      goog.object.set(newResource, key, val);
    }
  });
  return newResource;
};

/**
 * Serialize resource
 *
 * @param {boolean} asModel true: xhrdav.lib.Resource, false: {}
 * @return {(xhrdav.lib.Resource|Object)} converted Json/Hash object for WebDAV resource.
 * @see xhrdav.lib.ResourceController.serialize
 */
xhrdav.lib.ResourceController.prototype.serialize = function(asModel) {
  return xhrdav.lib.ResourceController.serialize(this, asModel);
};

/**
 * Setter destination
 *
 * @param {string} dest Destination path.
 */
xhrdav.lib.ResourceController.prototype.setDestination = function(dest) {
  /** @type {string} */
  this.destination_ = dest;
};

/**
 * Getter destination
 *
 * @return {string} Destination path.
 */
xhrdav.lib.ResourceController.prototype.getDestination = function() {
  return this.destination_ || null;
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
 * @see xhrdav.lib.ResourceController.remove
 */
xhrdav.lib.ResourceController.prototype.remove = function(
  handler, opt_headers, opt_params, debugHandler) {
  // TODO: Implements
  // resource.hrefのパスを削除する
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
 * @see xhrdav.lib.ResourceController.copy
 */
xhrdav.lib.ResourceController.prototype.copy = function(
  handler, opt_headers, opt_params, debugHandler) {
  // TODO: Implements
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
 * Move resoruce
 *
 * @param {Function=} handler callback handler function
 *                            [callback args: errors object]
 * @param {Object=} opt_headers Request headers.
 * @param {object=} opt_params  Request query params.
 * @param {Fuction=} debugHandler [Callback args: xhr event object]
 * @throws {Error} Not found of Resource or #destination
 * @see xhrdav.lib.ResourceController.move
 */
xhrdav.lib.ResourceController.prototype.move = function(
  handler, opt_headers, opt_params, debugHandler) {
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
}

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
xhrdav.lib.ResourceController.prototype.rename = function(
  handler, opt_headers, opt_params, debugHandler) {
  // TODO: Implements
  // resource.hrefのパスとresourcetypeをチェックして、ファイルかディレクトリかを判別
  // ディレクトリの場合:
  //  先頭にresource.hrefのディレクトリパスを追加し、destの末尾に'/'を補完してrename
  // ファイルの場合:
  //  先頭にresource.hrefのディレクトリパスを追加してrename
};


/* Entry point for closure compiler */
goog.exportSymbol('xhrdav.lib.ResourceController', xhrdav.lib.ResourceController);
goog.exportSymbol('xhrdav.lib.ResourceController.serialize',
  xhrdav.lib.ResourceController.serialize);
goog.exportProperty(xhrdav.lib.ResourceController.prototype, 'serialize',
  xhrdav.lib.ResourceController.prototype.serialize);
goog.exportProperty(xhrdav.lib.ResourceController.prototype, 'setDestination',
  xhrdav.lib.ResourceController.prototype.setDestination);
goog.exportProperty(xhrdav.lib.ResourceController.prototype, 'getDestination',
  xhrdav.lib.ResourceController.prototype.getDestination);
goog.exportProperty(xhrdav.lib.ResourceController.prototype, 'remove',
  xhrdav.lib.ResourceController.prototype.remove);
goog.exportProperty(xhrdav.lib.ResourceController.prototype, 'copy',
  xhrdav.lib.ResourceController.prototype.copy);
goog.exportProperty(xhrdav.lib.ResourceController.prototype, 'move',
  xhrdav.lib.ResourceController.prototype.move);
goog.exportProperty(xhrdav.lib.ResourceController.prototype, 'rename',
  xhrdav.lib.ResourceController.prototype.rename);

