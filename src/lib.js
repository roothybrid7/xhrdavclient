/**
 * lib.js - xhrdavclient library.
 *
 * @license Copyright 2011 The xhrdavclient library authors.
 * All rights reserved.
 */

goog.provide('xhrdav.lib');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.functions');
goog.require('goog.json');
goog.require('goog.object');
goog.require('goog.date');
goog.require('goog.string.path');
goog.require('xhrdav.HttpStatus');
goog.require('xhrdav.utils');


/*
 * Refs: goog.DEBUG=true|false
 */

/** @type {string} */
xhrdav.lib.LIBNAME = 'xhrdavclient';

