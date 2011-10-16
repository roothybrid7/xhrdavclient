/**
 * resourcecontroller.js - xhrdavclient resource object controller
 *
 * This is a WebDAV resource controller.
 * A single resource serialize, simply copy, move, rename, delete support.
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
 * @param {(xhrdav.lib.Resource|Object)=} resource  Json/Hash object for WebDAV resource.
 * @see xhrdav.lib.Resource
 * @see xhrdav.lib.DavFs.Request
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

  /** @type {xhrdav.lib.DavFs.Request} */
  this.request_ = null;
};

/**
 * Set Request object for WebDAV request.
 *
 * @param {xhrdav.lib.DavFs.Request} request  Request object for WebDAV request
 * @see xhrdav.lib.DavFs#getRequest
 */
xhrdav.lib.ResourceController.prototype.setRequest = function(request) {
  this.request_ = request;
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
  if (goog.isDefAndNotNull(this.destination_)) {
    var dstlist = xhrdav.lib.utils.path.split(this.destination_);

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
 * @param {Fuction=} onXhrComplete [Callback args: xhr event object]
 */
xhrdav.lib.ResourceController.prototype.remove = function(
  handler, opt_headers, opt_params, context, onXhrComplete) {
  // Directory
  if ('collection' == this.resourcetype) {
    this.destination_ = xhrdav.lib.utils.path.addLastSlash(this.destination_);
  }
  this.request_ && this.request_.remove(this.href,
    handler, opt_headers, opt_params, context, onXhrComplete);
};

/**
 * Create Directory before parameters validate.
 *
 * @param {Function=} handler callback handler function
 *                            [callback args: errors, object]
 * @param {Object=} opt_headers Request headers.
 * @param {Object=} opt_params  Request query params.
 * @param {Object=} context Callback scope.
 * @param {Fuction=} onXhrComplete [Callback args: xhr event object]
 * @throws {Error} Not found href(Directory path).
 */
xhrdav.lib.ResourceController.prototype.mkDir = function(
  handler, opt_headers, opt_params, context, onXhrComplete) {
  if (!goog.isDefAndNotNull(this.href)) {
    goog.functions.error(
      'Not found Directory path: obj.href = directoryPath')();
  }
  this.href = xhrdav.lib.utils.path.addLastSlash(this.href);
  this.request_ && this.request_.mkDir(this.href,
    handler, opt_headers, opt_params, context, onXhrComplete);
};
/**
 * Copy resource
 *
 * @param {Function=} handler callback handler function
 *                            [callback args: errors object]
 * @param {Object=} opt_headers Request headers.
 * @param {object=} opt_params  Request query params.
 * @param {Object=} context Callback scope.
 * @param {Fuction=} onXhrComplete [Callback args: xhr event object]
 */
xhrdav.lib.ResourceController.prototype.copy = function(
  handler, opt_headers, opt_params, context, onXhrComplete) {
  this.buildNewDestination_();

  // Directory
  if ('collection' == this.resourcetype) {
    this.destination_ = xhrdav.lib.utils.path.addLastSlash(this.destination_);
  }
  this.request_ && this.request_.copy(this.href, this.destination_,
    handler, opt_headers, opt_params, context, onXhrComplete);
};

/**
 * Copy resource before parameter validate.
 *
 * @param {Function=} handler callback handler function
 *                            [callback args: errors object]
 * @param {Object=} opt_headers Request headers.
 * @param {object=} opt_params  Request query params.
 * @param {Object=} context Callback scope.
 * @param {Fuction=} onXhrComplete [Callback args: xhr event object]
 * @throws {Error} Not found destination.
 * @see #copy
 */
xhrdav.lib.ResourceController.prototype.copyBeforeValidate = function(
  handler, opt_headers, opt_params, context, onXhrComplete) {
  if (!goog.isDefAndNotNull(this.destination_)) {
    goog.functions.error(
      'Not found destination: obj.setDestination = destPath')();
  }
  return this.copy(handler, opt_headers, opt_params, context, onXhrComplete);
};

/**
 * Move resoruce
 *
 * @param {Function=} handler callback handler function
 *                            [callback args: errors object]
 * @param {Object=} opt_headers Request headers.
 * @param {object=} opt_params  Request query params.
 * @param {Object=} context Callback scope.
 * @param {Fuction=} onXhrComplete [Callback args: xhr event object]
 */
xhrdav.lib.ResourceController.prototype.move = function(
  handler, opt_headers, opt_params, context, onXhrComplete) {
  this.buildNewDestination_();

  // Directory
  if ('collection' == this.resourcetype) {
    this.destination_ = xhrdav.lib.utils.path.addLastSlash(this.destination_);
  }
  this.request_ && this.request_.move(this.href, this.destination_,
    handler, opt_headers, opt_params, context, onXhrComplete);
};

/**
 * Move resource before parameter validate.
 *
 * @param {Function=} handler callback handler function
 *                            [callback args: errors object]
 * @param {Object=} opt_headers Request headers.
 * @param {object=} opt_params  Request query params.
 * @param {Object=} context Callback scope.
 * @param {Fuction=} onXhrComplete [Callback args: xhr event object]
 * @throws {Error} Not found destination.
 * @see #move
 */
xhrdav.lib.ResourceController.prototype.moveBeforeValidate = function(
  handler, opt_headers, opt_params, context, onXhrComplete) {
  if (!goog.isDefAndNotNull(this.destination_)) {
    goog.functions.error(
      'Not found destination: obj.setDestination = destPath')();
  }
  return this.move(handler, opt_headers, opt_params, context, onXhrComplete);
};

/**
 * Rename resource
 *
 * @param {Function=} handler callback handler function
 *                            [callback args: errors object]
 * @param {Object=} opt_headers Request headers.
 * @param {object=} opt_params  Request query params.
 * @param {Object=} context Callback scope.
 * @param {Function=} onXhrComplete  [Callback args: errors object]
 * @Deprecated  NOT IMPLEMNTS
 */
xhrdav.lib.ResourceController.prototype.rename = function(
  handler, opt_headers, opt_params, context, onXhrComplete) {
  // Directory
  if ('collection' == this.resourcetype) {
    this.destination_ = xhrdav.lib.utils.path.addLastSlash(this.destination_);
  }
  this.request_ && this.request_.move(this.href, this.destination_,
    handler, opt_headers, opt_params, context, onXhrComplete);
};

/**
 * Rename resource before parameters validate.
 *
 * @param {Function=} handler callback handler function
 *                            [callback args: errors object]
 * @param {Object=} opt_headers Request headers.
 * @param {object=} opt_params  Request query params.
 * @param {Object=} context Callback scope.
 * @param {Function=} onXhrComplete  [Callback args: errors object]
 * @throws {Error} Not found of xhrdav.lib.Resource or #destination
 * @see #rename
 * @Deprecated  NOT IMPLEMNTS
 */
xhrdav.lib.ResourceController.prototype.renameBeforeValidate = function(
  handler, opt_headers, opt_params, context, onXhrComplete) {
  if (!goog.isDefAndNotNull(this.destination_)) {
    goog.functions.error(
      'Not found destination: obj.setDestination = destPath')();  // Throw exception!!
  } else {
    var dstlist = xhrdav.lib.utils.path.split(this.destination_);

    if (dstlist[dstlist.length - 1] == this.pathlist[this.pathlist.length - 1]) {
      // Throw exception!!
      goog.functions.error(
        'Duplicate destination: obj.href and  obj.destination is same!!')();
    }
  }
  return this.rename(handler, opt_headers, opt_params, context, onXhrComplete);
};


/* Entry point for closure compiler */
goog.exportSymbol('xhrdav.lib.ResourceController', xhrdav.lib.ResourceController);
goog.exportProperty(xhrdav.lib.ResourceController.prototype, 'setRequest',
  xhrdav.lib.ResourceController.prototype.setRequest);
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

