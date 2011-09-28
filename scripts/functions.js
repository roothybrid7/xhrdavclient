/**
 * function.js - xhrdavclient Static functions
 *
 * @license Copyright 2011 The xhrdavclient library authors. All rights reserved.
 */

goog.provide('xhrdav.lib.Functions');
goog.require('xhrdav.lib.Config');
goog.require('xhrdav.lib.DomParser');
goog.require('xhrdav.lib.MultiStatusDomHandler');

/**
 * Parse WebDAV Multi-Status by Dom parser
 *
 * @param {Object} xml WebDAV Multi-Status collections
 * @return {Object} converted multistatus object(Associate array)
 */
xhrdav.lib.Functions.domParseMultiStatus = function(xml) {
  var handler = new xhrdav.lib.MultiStatusDomHandler();
  var parser, obj;
  try {
    parser = new xhrdav.lib.DomParser().initialize(xml, handler).parse();
  } catch(e) {
    // TODO: [Replace goog.debug.Logger]
    console.log("Error: " + e.message);
  } finally {
    obj = handler.getObject() || {};
    handler.dispose();
  }

  return obj;
};

/* Entry Point for closure compiler "ADVANCED_OPTIMIZATIONS" option */
goog.exportSymbol('xhrdav.lib.Functions', xhrdav.lib.Functions);
goog.exportSymbol('xhrdav.lib.Functions.domParseMultiStatus',
  xhrdav.lib.Functions.domParseMultiStatus);

