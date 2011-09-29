/**
 * domhandler.js - WebDAV Client dom handler.
 *
 * @license Copyright 2011 The xhrdavclient library authors. All rights reserved.
 */

goog.provide('xhrdav.lib.DomHandler');

/**
 * XML Dom handler
 *
 * @constructor
 * @extends {goog.Disposable}
 */
xhrdav.lib.DomHandler = function() {
  /** @type {Object} */
  this.resources_ = null;
};
goog.inherits(xhrdav.lib.DomHandler, goog.Disposable);

/** @override */
xhrdav.lib.DomHandler.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  this.resources_ = null;
};

/**
 * Handle start document
 */
xhrdav.lib.DomHandler.prototype.startDocument = function() {
  this.resources_ = {};
};

/**
 * Handle end document
 */
xhrdav.lib.DomHandler.prototype.endDocument = function() {};

/**
 * Execute parse Document
 *
 * @param {xhrdav.lib.DomParser} parser
 * @param {Object} xml
 */
xhrdav.lib.DomHandler.prototype.execute = function(parser, xml) {
  this.resources_ = parser.parseDocument(xml);
};

/**
 * Get object
 *
 * @return {Object} converted response xml to object.
 */
xhrdav.lib.DomHandler.prototype.getObject = function() {
  return this.resources_;
};

/* Entry Point for closure compiler */
goog.exportSymbol('xhrdav.lib.DomHandler', xhrdav.lib.DomHandler);
goog.exportProperty(xhrdav.lib.DomHandler.prototype, 'startDocument',
  xhrdav.lib.DomHandler.prototype.startDocument);
goog.exportProperty(xhrdav.lib.DomHandler.prototype, 'endDocument',
  xhrdav.lib.DomHandler.prototype.endDocument);
goog.exportProperty(xhrdav.lib.DomHandler.prototype, 'execute',
  xhrdav.lib.DomHandler.prototype.execute);
goog.exportProperty(xhrdav.lib.DomHandler.prototype, 'getObject',
  xhrdav.lib.DomHandler.prototype.getObject);

