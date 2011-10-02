/**
 * resource.js - xhrdavclient resource object
 *
 * @license Copyright 2011 The xhrdavclient library authors. All rights reserved.
 */

goog.provide('xhrdav.lib.Resource');
goog.require('goog.array');
goog.require('goog.object');

/**
 * xhrdavclient resource object
 *
 * @constructor
 */
xhrdav.lib.Resource = function() {
  /** @type {string} */
  this.href = null;
  /** @type {Array.<string>} */
  this.pathlist = [];
  /** @type {string} */
  this.status = null;
  /** @type {string} */
  this.protocol = null;
  /** @type {number} */
  this.statuscode = 0;
  /** @type {string} */
  this.statustext = null;
  /** @type {string} */
  this.resourcetype = null;
  /** @type {Date} */
  this.creationdate = null;
  /** @type {Date} */
  this.lastmodified = null;
  /** @type {string} */
  this.contenttype = null;
  /** @type {number} */
  this.contentlength = 0;
  /** @type {string} */
  this.etag = null;
  /** @type {boolean} */
  this.executable = false;
// TODO: LOCKメソッドをサポートしたら追加 20110930
//  /** @type {string} */
//  this.locktype = null;
//  /** @type {string} */
//  this.lockscope = null;
//  /** @type {string} */
//  this.locktoken = null;
//  /** @type {number} */
//  this.lockdepth = null;
//  /** @type {string} */
//  this.lockowner = null;
//  /** @type {string} */
//  this.timeout = null;
};

/* Entry point for closure compiler */
goog.exportSymbol('xhrdav.lib.Resource', xhrdav.lib.Resource);
