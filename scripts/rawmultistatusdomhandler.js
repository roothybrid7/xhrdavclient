/**
 * rawmultistatusdomhandler.js - Raw WebDAV Client multistatus dom handler.
 *
 * @license Copyright 2011 The xhrdavclient library authors. All rights reserved.
 */

goog.provide('xhrdav.lib.RawMultiStatusDomHandler');
goog.require('xhrdav.lib.Config');
goog.require('xhrdav.lib.DomHandler');

/**
 * Dom handler of Multi-Status
 *
 * @constructor
 * @extends {goog.Disposable}
 * @implements {xhrdav.lib.DomHandler}
 */
xhrdav.lib.RawMultiStatusDomHandler = function() {
  /** @type {Object} */
  this.resources_ = null;
};
goog.inherits(xhrdav.lib.RawMultiStatusDomHandler, goog.Disposable);

/** @override */
xhrdav.lib.RawMultiStatusDomHandler.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  this.resources_ = null;
};

/**
 * Handle start document
 */
xhrdav.lib.RawMultiStatusDomHandler.prototype.startDocument = function() {
  this.resources_ = {};
};

/**
 * Handle end document
 */
xhrdav.lib.RawMultiStatusDomHandler.prototype.endDocument = function() {
  var resourceList = this.resources_['D$response'];
  if (!goog.isDefAndNotNull(resourceList)) return;
  for (var i = 0, l = resourceList.length; i < l; i++) {
    var resource = resourceList[i];
    resource['path'] = goog.array.filter(
      resource['D$href']['$t'].split('/'),
      function(val, i) {
      return val;
    }, this);
  }
};

/**
 * Execute parse Document
 *
 * @param {xhrdav.lib.DomParser} parser
 * @param {Object} xml
 */
xhrdav.lib.RawMultiStatusDomHandler.prototype.execute = function(parser, xml) {
  this.resources_ = parser.parseDocument(xml);
};

/**
 * get object
 *
 * @return {Object} MultiStatus response converted object.
 */
xhrdav.lib.RawMultiStatusDomHandler.prototype.getObject = function() {
  return this.resources_;
};

/* Entry Point for closure compiler */
goog.exportSymbol('xhrdav.lib.RawMultiStatusDomHandler',
  xhrdav.lib.RawMultiStatusDomHandler);
goog.exportProperty(
  xhrdav.lib.RawMultiStatusDomHandler.prototype, 'startDocument',
  xhrdav.lib.RawMultiStatusDomHandler.prototype.startDocument);
goog.exportProperty(
  xhrdav.lib.RawMultiStatusDomHandler.prototype, 'endDocument',
  xhrdav.lib.RawMultiStatusDomHandler.prototype.endDocument);
goog.exportProperty(
  xhrdav.lib.RawMultiStatusDomHandler.prototype, 'execute',
  xhrdav.lib.RawMultiStatusDomHandler.prototype.execute);
goog.exportProperty(
  xhrdav.lib.RawMultiStatusDomHandler.prototype, 'getObject',
  xhrdav.lib.RawMultiStatusDomHandler.prototype.getObject);

