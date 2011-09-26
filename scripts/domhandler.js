/**
 * domhandler.js - WebDAV Client dom handler.
 *
 * @license Copyright 2011 The xhrdavclient library authors. All rights reserved.
 */

goog.provide('xhrdav.lib.DomHandler');

/**
 * Interface of Dom handler
 *
 * @interface
 */
xhrdav.lib.DomHandler = function() {};

/**
 * Handle start document
 */
xhrdav.lib.DomHandler.prototype.startDocument = function() {};

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
xhrdav.lib.DomHandler.prototype.execute = function(parser, xml) {};

/**
 * Get object
 *
 */
xhrdav.lib.DomHandler.prototype.getObject = function() {};

