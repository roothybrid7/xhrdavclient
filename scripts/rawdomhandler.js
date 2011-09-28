/**
 * rawdomhandler.js - WebDAV Client Raw Xml dom handler.
 *
 * @license Copyright 2011 The xhrdavclient library authors. All rights reserved.
 */

goog.provide('xhrdav.lib.RawDomHandler');
goog.require('xhrdav.lib.Config');
goog.require('xhrdav.lib.DomHandler');

/**
 * Dom handler for Raw Xml
 *
 * @constructor
 * @extends {goog.Disposable}
 * @implements {xhrdav.lib.DomHandler}
 */
xhrdav.lib.RawDomHandler = function() {
  /** @type {Object} */
  this.resources_ = null;
};
goog.inherits(xhrdav.lib.RawDomHandler, goog.Disposable);

/** @override */
xhrdav.lib.RawDomHandler.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  this.resources_ = null;
};

/**
 * Handle start document
 */
xhrdav.lib.RawDomHandler.prototype.startDocument = function() {
  this.resources_ = {};
};

/**
 * Handle end document
 */
xhrdav.lib.RawDomHandler.prototype.endDocument = function() {};

/**
 * Execute parse document
 *
 * @param {xhrdav.lib.DomParser} parser
 * @param {Object} xml
 */
xhrdav.lib.RawDomHandler.prototype.execute = function(parser, xml) {
  this.resources_ = parser.parseDocument(xml);
};

/**
 * get object
 *
 * @return {Object} converted response xml to object.
 */
xhrdav.lib.RawDomHandler.prototype.getObject = function() {
  return this.resources_;
};

/* Entry Point for closure compiler */
goog.exportSymbol('xhrdav.lib.RawDomHandler', xhrdav.lib.RawDomHandler);
goog.exportProperty(xhrdav.lib.RawDomHandler.prototype, 'startDocument',
  xhrdav.lib.RawDomHandler.prototype.startDocument);
goog.exportProperty(xhrdav.lib.RawDomHandler.prototype, 'endDocument',
  xhrdav.lib.RawDomHandler.prototype.endDocument);
goog.exportProperty(xhrdav.lib.RawDomHandler.prototype, 'execute',
  xhrdav.lib.RawDomHandler.prototype.execute);
goog.exportProperty(xhrdav.lib.RawDomHandler.prototype, 'getObject',
  xhrdav.lib.RawDomHandler.prototype.getObject);

