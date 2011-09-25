/**
 * domhandler.js - WebDAV Client dom handler.
 *
 * @license Copyright 2011 The xhrdavclient library authors. All rights reserved.
 */

goog.provide('xhrdav.lib.parser.DomHandler');

/**
 * Interface of Dom handler
 *
 * @interface
 */
xhrdav.lib.parser.DomHandler = function() {};

/**
 * Handle start document
 */
xhrdav.lib.parser.DomHandler.prototype.startDocument = function() {};

/**
 * Handle end document
 */
xhrdav.lib.parser.DomHandler.prototype.endDocument = function() {};

/**
 * Set object
 *
 * @param {Object} obj
 */
xhrdav.lib.parser.DomHandler.prototype.setObject = function(obj) {};
