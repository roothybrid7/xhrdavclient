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
  /** @type {string} */
  this.destination = null;
};

/**
 * Setter destination
 *
 * @param {string} dest Destination path.
 */
xhrdav.lib.ResourceGenerator.prototype.setDestination = function(dest) {
  this.destination = dest;
};

/**
 * Remove resource [Class method]
 *
 * @param {(xhrdav.lib.ResourceGenerator|xhrdav.lib.Resource)} resoruce
 *                                        Json/Hash object for WebDAV resoruce.
 * @param {Function=} handler callback handler function
 *                            [callback args: errors object]
 * @param {Object=} opt_request Request options.
 * @param {Fuction=} debugHandler [Callback args: xhr event object]
 * @throws {Error} Not found of xhrdav.lib.Resource or #destination
 */
xhrdav.lib.ResourceGenerator.remove = function(
  resource, handler, opt_request, debugHandler) {
  // TODO: Implements
};

/**
 * Remove resource
 *
 * @param {Function=} handler callback handler function
 *                            [callback args: errors object]
 * @param {Object=} opt_request Request options.
 * @param {Fuction=} debugHandler [Callback args: xhr event object]
 * @throws {Error} Not found of xhrdav.lib.Resource or #destination
 * @see xhrdav.lib.ResourceGenerator.remove
 */
xhrdav.lib.ResourceGenerator.prototype.remove = function(
  handler, opt_request, debugHandler) {
  // TODO: Implements
};

/**
 * Copy resource [Class method]
 *
 * @param {(xhrdav.lib.ResourceGenerator|xhrdav.lib.Resource)} resoruce
 *                                        Json/Hash object for WebDAV resoruce.
 * @param {string} dest Copy destination Path <code>/mydav/bar/</code>.
 * @param {Function=} handler callback handler function
 *                            [callback args: errors object]
 * @param {Object=} opt_request Request options.
 * @param {Fuction=} debugHandler [Callback args: xhr event object]
 * @throws {Error} Not found of xhrdav.lib.Resource or #destination
 */
xhrdav.lib.ResourceGenerator.copy = function(
  resource, dest, handler, opt_request, debugHandler) {
//  if (!this.destination) // Errors
  // TODO: Implements
};

/**
 * Copy resource
 *
 * @param {Function=} handler callback handler function
 *                            [callback args: errors object]
 * @param {Object=} opt_request Request options.
 * @param {Fuction=} debugHandler [Callback args: xhr event object]
 * @throws {Error} Not found of xhrdav.lib.Resource or #destination
 * @see xhrdav.lib.ResourceGenerator.copy
 */
xhrdav.lib.ResourceGenerator.prototype.copy = function(
  handler, opt_request, debugHandler) {
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
 * @param {Object=} opt_request Request options.
 * @param {Fuction=} debugHandler [Callback args: xhr event object]
 * @throws {Error} Not found of xhrdav.lib.Resource or #destination
 */
xhrdav.lib.ResourceGenerator.move = function(
  resoruce, dest, handler, opt_request, debugHandler) {
//  if (!this.destination) // Errors
  // TODO: Implements
};

/**
 * Move resoruce
 *
 * @param {Function=} handler callback handler function
 *                            [callback args: errors object]
 * @param {Object=} opt_request Request options.
 * @param {Fuction=} debugHandler [Callback args: xhr event object]
 * @throws {Error} Not found of Resource or #destination
 * @see xhrdav.lib.ResourceGenerator.move
 */
xhrdav.lib.ResourceGenerator.prototype.move = function(
  handler, opt_request, debugHandler) {
//  if (!this.destination) // Errors
  // TODO: Implements
}

/* Entry point for closure compiler */
goog.exportSymbol('xhrdav.lib.ResourceGenerator', xhrdav.lib.ResourceGenerator);
goog.exportProperty(xhrdav.lib.ResourceGenerator.prototype, 'setDestination',
  xhrdav.lib.ResourceGenerator.prototype.setDestination);
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

