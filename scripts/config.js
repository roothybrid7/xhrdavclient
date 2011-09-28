/**
 * config.js - xhrdavclient config
 *
 * @license Copyright 2011 The xhrdavclient library authors. All rights reserved.
 */

goog.provide('xhrdav.lib.Config');
goog.require('goog.object');
goog.require('xhrdav.lib.string');
goog.require('goog.string.path');
goog.require('xhrdav.lib.HttpStatus');
goog.require('goog.Disposable');
goog.require('goog.debug.Console');
goog.require('goog.debug.Logger');

/**
 * Namespace shorthand
 *
 * @type {Object}
 */
var $xdav = xhrdav.lib;

/* Entry Point for closure compiler */
goog.exportSymbol('$xdav', xhrdav.lib);

