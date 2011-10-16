/**
 * domhandler.js - WebDAV Client dom handler.
 *
 * This is a xml dom parse handler.
 *
 * @license Copyright 2011 The xhrdavclient library authors. All rights reserved.
 */

goog.provide('xhrdav.parser.DomHandler');
goog.require('goog.Disposable');

/**
 * XML Dom handler
 *
 * @constructor
 * @extends {goog.Disposable}
 */
xhrdav.parser.DomHandler = function() {
  /** @type {Object} */
  this.resources_ = null;
};
goog.inherits(xhrdav.parser.DomHandler, goog.Disposable);

/** @override */
xhrdav.parser.DomHandler.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  this.resources_ = null;
};

/**
 * Handle start document
 */
xhrdav.parser.DomHandler.prototype.startDocument = function() {
  this.resources_ = {};
};

/**
 * Handle end document
 */
xhrdav.parser.DomHandler.prototype.endDocument = function() {};

/**
 * Execute parse Document
 *
 * @param {xhrdav.DomParser} parser
 * @param {Object} xml
 * @see xhrdav.DomParser
 */
xhrdav.parser.DomHandler.prototype.execute = function(parser, xml) {
  this.resources_ = parser.parseDocument(xml);
};

/**
 * Get object
 *
 * @return {Object} converted response xml to object.
 */
xhrdav.parser.DomHandler.prototype.getObject = function() {
  return this.resources_;
};

/* Entry Point for closure compiler */
goog.exportSymbol('xhrdav.parser.DomHandler', xhrdav.parser.DomHandler);
goog.exportProperty(xhrdav.parser.DomHandler.prototype, 'startDocument',
  xhrdav.parser.DomHandler.prototype.startDocument);
goog.exportProperty(xhrdav.parser.DomHandler.prototype, 'endDocument',
  xhrdav.parser.DomHandler.prototype.endDocument);
goog.exportProperty(xhrdav.parser.DomHandler.prototype, 'execute',
  xhrdav.parser.DomHandler.prototype.execute);
goog.exportProperty(xhrdav.parser.DomHandler.prototype, 'getObject',
  xhrdav.parser.DomHandler.prototype.getObject);

