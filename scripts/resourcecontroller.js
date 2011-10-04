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
 * Get DavFs
 *
 * @return {xhrdav.lib.DavFs}
 */
xhrdav.lib.ResourceController.prototype.getConnection_ = function() {
  if (!goog.isDefAndNotNull(this.davFs_)) {
    this.davFs_ = xhrdav.lib.DavFs.getInstance().initialize();
  }
  return this.davFs_;
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
 * build destination path.
 */
xhrdav.lib.ResourceController.prototype.buildNewDestination_ = function() {
  // resource.hrefのパスとresourcetypeをチェックして、ファイルかディレクトリかを判別
  // ディレクトリの場合:
  //  destPathの末尾がresource.hrefの末尾なら、destの末尾に'/'を補完してcopy
  //  違う場合は、destの末尾にresource.hrefの末尾を追加してcopy
  // ファイルの場合:
  //  destPathの末尾がresource.hrefの末尾なら、destの末尾に'/'があった場合削除してcopy
  //  違う場合は、destをディレクトリと見なし、destの末尾に'/'を補完してから
  //  resource.hrefの末尾を追加してcopy
  if (goog.isDefAndNotNull(this.destination_)) {
    var dstlist = xhrdav.lib.functions.path.split(this.destination_);

    if (dstlist[dstlist.length - 1] != this.pathlist[this.pathlist.length - 1]) {
      dstlist.push(this.pathlist[this.pathlist.length - 1]);
    }
    if (dstlist[0] == '/') {
      this.destination_ = dstlist.join('/');
    } else {
      this.destination_ = '/' + dstlist.join('/');
    }
  }
};

/**
 * Remove resource
 *
 * @param {Function=} handler callback handler function
 *                            [callback args: errors object]
 * @param {Object=} opt_headers Request headers.
 * @param {object=} opt_params  Request query params.
 * @param {Object=} context Callback scope.
 * @param {Fuction=} debugHandler [Callback args: xhr event object]
 */
xhrdav.lib.ResourceController.prototype.remove = function(
  handler, opt_headers, opt_params, context, debugHandler) {
  // Directory
  if (this.resourcetype == 'collection') {
    this.destination_ = xhrdav.lib.functions.path.addLastSlash(this.destination_);
    this.getConnection_().rmDir(this.href,
      handler, opt_headers, opt_params, context, debugHandler);
  } else {
    this.getConnection_().removeFile(this.href, this.destination_,
      handler, opt_headers, opt_params, context, debugHandler);
  }
};

/**
 * Create Directory before parameters validate.
 *
 * @param {Function=} handler callback handler function
 *                            [callback args: errors, object]
 * @param {Object=} opt_headers Request headers.
 * @param {Object=} opt_params  Request query params.
 * @param {Object=} context Callback scope.
 * @param {Fuction=} debugHandler [Callback args: xhr event object]
 * @throws {Error} Not found href(Directory path).
 */
xhrdav.lib.ResourceController.prototype.mkDir = function(
  handler, opt_headers, opt_params, context, debugHandler) {
  if (!goog.isDefAndNotNull(this.href)) {
    return goog.functions.error(
      'Not found Directory path: obj.href = directoryPath')();
  }
  this.href = xhrdav.lib.functions.path.addLastSlash(this.href);
  this.getConnection_().mkDir(this.href,
    handler, opt_headers, opt_params, context, debugHandler);
};
/**
 * Copy resource
 *
 * @param {Function=} handler callback handler function
 *                            [callback args: errors object]
 * @param {Object=} opt_headers Request headers.
 * @param {object=} opt_params  Request query params.
 * @param {Object=} context Callback scope.
 * @param {Fuction=} debugHandler [Callback args: xhr event object]
 */
xhrdav.lib.ResourceController.prototype.copy = function(
  handler, opt_headers, opt_params, context, debugHandler) {
  this.buildNewDestination_();

  // Directory
  if (this.resourcetype == 'collection') {
    this.destination_ = xhrdav.lib.functions.path.addLastSlash(this.destination_);
    this.getConnection_().copyDir(this.href, this.destination_,
      handler, opt_headers, opt_params, context, debugHandler);
  } else {
    this.getConnection_().copyFile(this.href, this.destination_,
      handler, opt_headers, opt_params, context, debugHandler);
  }
};

/**
 * Copy resource before parameter validate.
 *
 * @param {Function=} handler callback handler function
 *                            [callback args: errors object]
 * @param {Object=} opt_headers Request headers.
 * @param {object=} opt_params  Request query params.
 * @param {Object=} context Callback scope.
 * @param {Fuction=} debugHandler [Callback args: xhr event object]
 * @throws {Error} Not found destination.
 * @see #copy
 */
xhrdav.lib.ResourceController.prototype.copyBeforeValidate = function(
  handler, opt_headers, opt_params, context, debugHandler) {
  if (!goog.isDefAndNotNull(this.destination_)) {
    return goog.functions.error(
      'Not found destination: obj.setDestination = destPath')();
  }
  return this.copy(handler, opt_headers, opt_params, context, debugHandler);
};

/**
 * Move resoruce
 *
 * @param {Function=} handler callback handler function
 *                            [callback args: errors object]
 * @param {Object=} opt_headers Request headers.
 * @param {object=} opt_params  Request query params.
 * @param {Object=} context Callback scope.
 * @param {Fuction=} debugHandler [Callback args: xhr event object]
 */
xhrdav.lib.ResourceController.prototype.move = function(
  handler, opt_headers, opt_params, context, debugHandler) {
  this.buildNewDestination_();

  // Directory
  if (this.resourcetype == 'collection') {
    this.destination_ = xhrdav.lib.functions.path.addLastSlash(this.destination_);
    this.getConnection_().moveDir(this.href, this.destination_,
      handler, opt_headers, opt_params, context, debugHandler);
  } else {
    this.getConnection_().moveFile(this.href, this.destination_,
      handler, opt_headers, opt_params, context, debugHandler);
  }
};

/**
 * Move resource before parameter validate.
 *
 * @param {Function=} handler callback handler function
 *                            [callback args: errors object]
 * @param {Object=} opt_headers Request headers.
 * @param {object=} opt_params  Request query params.
 * @param {Object=} context Callback scope.
 * @param {Fuction=} debugHandler [Callback args: xhr event object]
 * @throws {Error} Not found destination.
 * @see #move
 */
xhrdav.lib.ResourceController.prototype.moveBeforeValidate = function(
  handler, opt_headers, opt_params, context, debugHandler) {
  if (!goog.isDefAndNotNull(this.destination_)) {
    return goog.functions.error(
      'Not found destination: obj.setDestination = destPath')();
  }
  return this.move(handler, opt_headers, opt_params, context, debugHandler);
};

/**
 * Rename resource
 *
 * @param {Function=} handler callback handler function
 *                            [callback args: errors object]
 * @param {Object=} opt_headers Request headers.
 * @param {object=} opt_params  Request query params.
 * @param {Object=} context Callback scope.
 * @param {Function=} debugHandler  [Callback args: errors object]
 * @Deprecated  NOT IMPLEMNTS
 */
xhrdav.lib.ResourceController.prototype.rename = function(
  handler, opt_headers, opt_params, context, debugHandler) {
  // Directory
  if (this.resourcetype == 'collection') {
    this.destination_ = xhrdav.lib.functions.path.addLastSlash(this.destination_);
    this.getConnection_().moveDir(this.href, this.destination_,
      handler, opt_headers, opt_params, context, debugHandler);
  } else {
    this.getConnection_().moveFile(this.href, this.destination_,
      handler, opt_headers, opt_params, context, debugHandler);
  }
};

/**
 * Rename resource before parameters validate.
 *
 * @param {Function=} handler callback handler function
 *                            [callback args: errors object]
 * @param {Object=} opt_headers Request headers.
 * @param {object=} opt_params  Request query params.
 * @param {Object=} context Callback scope.
 * @param {Function=} debugHandler  [Callback args: errors object]
 * @throws {Error} Not found of xhrdav.lib.Resource or #destination
 * @see #rename
 * @Deprecated  NOT IMPLEMNTS
 */
xhrdav.lib.ResourceController.prototype.renameBeforeValidate = function(
  handler, opt_headers, opt_params, context, debugHandler) {
  if (!goog.isDefAndNotNull(this.destination_)) {
    return goog.functions.error(
      'Not found destination: obj.setDestination = destPath')();
  } else {
    var dstlist = xhrdav.lib.functions.path.split(this.destination_);

    if (dstlist[dstlist.length - 1] == this.pathlist[this.pathlist.length - 1]) {
      return goog.functions.error(
        'Duplicate destination: obj.href and  obj.destination is same!!')();
    }
  }
  return this.rename(handler, opt_headers, opt_params, context, debugHandler);
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
goog.exportProperty(xhrdav.lib.ResourceController.prototype, 'mkDir',
  xhrdav.lib.ResourceController.prototype.mkDir);
goog.exportProperty(xhrdav.lib.ResourceController.prototype, 'copy',
  xhrdav.lib.ResourceController.prototype.copy);
goog.exportProperty(xhrdav.lib.ResourceController.prototype, 'copyBeforeValidate',
  xhrdav.lib.ResourceController.prototype.copyBeforeValidate);
goog.exportProperty(xhrdav.lib.ResourceController.prototype, 'move',
  xhrdav.lib.ResourceController.prototype.move);
goog.exportProperty(xhrdav.lib.ResourceController.prototype, 'moveBeforeValidate',
  xhrdav.lib.ResourceController.prototype.moveBeforeValidate);
goog.exportProperty(xhrdav.lib.ResourceController.prototype, 'rename',
  xhrdav.lib.ResourceController.prototype.rename);
goog.exportProperty(xhrdav.lib.ResourceController.prototype, 'renameBeforeValidate',
  xhrdav.lib.ResourceController.prototype.renameBeforeValidate);

