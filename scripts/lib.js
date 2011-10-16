/**
 * lib.js - xhrdavclient library.
 *
 * @license Copyright 2011 The xhrdavclient library authors. All rights reserved.
 */

goog.provide('xhrdav.lib');

goog.require('goog.dom');
goog.require('goog.array');
goog.require('goog.object');
goog.require('goog.json');
goog.require('goog.functions');
goog.require('goog.string.path');

goog.require('xhrdav.utils');
goog.require('xhrdav.ext');
goog.require('xhrdav.HttpStatus');

/*
 * Refs: goog.DEBUG=true|false
 */

/** @type {string} */
xhrdav.lib.LIBNAME = 'xhrdavclient';

/** @type {string} */
xhrdav.lib.VERSION = '0.0.22';

