/**
 * multistatusdomhandler.js - WebDAV Client multistatus dom handler.
 *
 * @license Copyright 2011 The xhrdavclient library authors. All rights reserved.
 */

goog.provide('xhrdav.lib.MultiStatusDomHandler');
goog.require('xhrdav.lib.DomHandler');
goog.require('goog.object');
goog.require('goog.debug');

/**
 * Dom handler of Multi-Status
 *
 * @constructor
 * @extends {goog.Disposable}
 * @implements {xhrdav.lib.DomHandler}
 */
xhrdav.lib.MultiStatusDomHandler = function() {
}

/**
 * Handle start document
 */
xhrdav.lib.MultiStatusDomHandler.prototype.startDocument = function() {
  this.resources_ = {};
};

/**
 * Handle end document
 */
xhrdav.lib.MultiStatusDomHandler.prototype.endDocument = function() {
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
xhrdav.lib.MultiStatusDomHandler.prototype.execute = function(parser, xml) {
  this.resources_ = parser.parseDocument(xml);
};

/**
 * get object
 *
 * @return {Object} MultiStatus response converted object.
 */
xhrdav.lib.MultiStatusDomHandler.prototype.getObject = function() {
  return this.resources_;
};

/* Entry Point for closure compiler "ADVANCED_OPTIMIZATIONS" option */
goog.exportSymbol('xhrdav.lib.MultiStatusDomHandler',
  xhrdav.lib.MultiStatusDomHandler);
goog.exportProperty(
  xhrdav.lib.MultiStatusDomHandler.prototype, 'startDocument',
  xhrdav.lib.MultiStatusDomHandler.prototype.startDocument);
goog.exportProperty(
  xhrdav.lib.MultiStatusDomHandler.prototype, 'endDocument',
  xhrdav.lib.MultiStatusDomHandler.prototype.endDocument);
goog.exportProperty(
  xhrdav.lib.MultiStatusDomHandler.prototype, 'execute',
  xhrdav.lib.MultiStatusDomHandler.prototype.execute);
goog.exportProperty(
  xhrdav.lib.MultiStatusDomHandler.prototype, 'getObject',
  xhrdav.lib.MultiStatusDomHandler.prototype.getObject);

