/**
 * resource.js - xhrdavclient resource object and resource type catalog.
 *
 * This is a WebDAV resoruce model and property catalog class.
 * Create assosiate Map by goog.mixin or use data model.
 *
 * @license Copyright 2011 The xhrdavclient library authors.
 * All rights reserved.
 */

goog.provide('xhrdav.Resource');
goog.require('goog.array');
goog.require('goog.object');

/**
 * xhrdavclient resource object
 *
 * @constructor
 */
xhrdav.Resource = function() {
  /** @type {string} */
  this.id = null;
  /** @type {string} */
  this.parentId = null;
  /** @type {string} */
  this.name = null;
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
goog.exportSymbol('xhrdav.Resource', xhrdav.Resource);
