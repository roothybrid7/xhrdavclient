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
 * Set object
 *
 * @param {Object} obj
 */
xhrdav.lib.DomHandler.prototype.setObject = function(obj) {};
