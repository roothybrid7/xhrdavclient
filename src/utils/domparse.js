/**
 * domparse.js - Dom parse static utils for xhrdavclient(Mix-in)
 *
 * @license Copyright 2011 The xhrdavclient library authors.
 * All rights reserved.
 */

goog.provide('xhrdav.utils.domparse');
goog.require('xhrdav.parser.DomHandler');
goog.require('xhrdav.parser.DomParser');


/**
 * Parse WebDAV Multi-Status to row structure by Dom parser
 *
 * @param {Object} xml WebDAV Multi-Status collections.
 * @return {Object} converted multistatus object(Associate array).
 * @this {Function}
 */
xhrdav.utils.domparse.parseXml = function(xml) {
  var handler = new xhrdav.parser.DomHandler();
  var parser, obj, errorFlag = false;
  try {
    parser = new xhrdav.parser.DomParser().initialize(xml, handler);
    parser.parse();
  } catch (e) {
    errorFlag = true;
    if (this.errorHandler && this.errorHandler instanceof Function) {
      this.errorHandler(e);
    }
  } finally {
    obj = errorFlag ? {} : (handler.getObject() || {});
    handler.dispose();
  }

  return obj;
};

/* Entry Point for closure compiler */
goog.exportSymbol('xhrdav.utils.domparse', xhrdav.utils.domparse);
goog.exportSymbol('xhrdav.utils.domparse.parseXml',
  xhrdav.utils.domparse.parseXml);
