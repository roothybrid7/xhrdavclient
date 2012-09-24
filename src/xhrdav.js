/**
 * xhrdav.js - xhrdavclient library.
 *
 * @license Copyright 2011 The xhrdavclient library authors.
 * All rights reserved.
 */

goog.provide('xhrdav');

goog.require('xhrdav.Client');
goog.require('xhrdav.Conf');
goog.require('xhrdav.DavFs');
goog.require('xhrdav.Errors');
goog.require('xhrdav.HttpStatus');
goog.require('xhrdav.Resource');
goog.require('xhrdav.ResourceBuilder');
goog.require('xhrdav.ResourceController');
goog.require('xhrdav.ext');
goog.require('xhrdav.lib');
goog.require('xhrdav.parser.DomHandler');
goog.require('xhrdav.parser.DomParser');
goog.require('xhrdav.utils');


/** @type {string} */
xhrdav.VERSION = '0.3.6';
