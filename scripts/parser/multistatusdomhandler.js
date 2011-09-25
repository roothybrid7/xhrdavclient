/**
 * multistatusdomhandler.js - WebDAV Client multistatus dom handler.
 *
 * @license Copyright 2011 The xhrdavclient library authors. All rights reserved.
 */

goog.provide('xhrdav.lib.parser.MultiStatusDomHandler');
goog.require('xhrdav.lib.parser.DomHandler');
goog.require('goog.object');
//goog.require('goog.debug');

/**
 * Dom handler of Multi-Status
 *
 * @constructor
 * @extends {goog.Disposable}
 * @implements {xhrdav.lib.parser.DomHandler}
 */
xhrdav.lib.parser.MultiStatusDomHandler = function() {
}

/**
 * Handle start document
 */
xhrdav.lib.parser.MultiStatusDomHandler.prototype.startDocument = function() {
  this.resources_ = {};
};

/**
 * Handle end document
 */
xhrdav.lib.parser.MultiStatusDomHandler.prototype.endDocument = function() {
  var resourceList = this.resources_['D$response'];
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
 * set object of parse xml docuemnt
 *
 * @param {Object} obj javascript object.
 */
xhrdav.lib.parser.MultiStatusDomHandler.prototype.setObject = function(obj) {
  this.resources_ = obj;
};

/**
 * get object
 *
 * @return {Object} MultiStatus response converted object.
 */
xhrdav.lib.parser.MultiStatusDomHandler.prototype.getObject = function() {
  return this.resources_;
};

/* Entry Point for closure compiler "ADVANCED_OPTIMIZATIONS" option */
goog.exportSymbol('xhrdav.lib.parser.MultiStatusDomHandler',
  xhrdav.lib.parser.MultiStatusDomHandler);
goog.exportProperty(
  xhrdav.lib.parser.MultiStatusDomHandler.prototype, 'startDocument',
  xhrdav.lib.parser.MultiStatusDomHandler.prototype.startDocument);
goog.exportProperty(
  xhrdav.lib.parser.MultiStatusDomHandler.prototype, 'endDocument',
  xhrdav.lib.parser.MultiStatusDomHandler.prototype.endDocument);
goog.exportProperty(
  xhrdav.lib.parser.MultiStatusDomHandler.prototype, 'setObject',
  xhrdav.lib.parser.MultiStatusDomHandler.prototype.setObject);
goog.exportProperty(
  xhrdav.lib.parser.MultiStatusDomHandler.prototype, 'getObject',
  xhrdav.lib.parser.MultiStatusDomHandler.prototype.getObject);

