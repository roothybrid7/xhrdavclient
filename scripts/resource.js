/**
 * resource.js - xhrdavclient resource object
 *
 * @license Copyright 2011 The xhrdavclient library authors. All rights reserved.
 */

goog.provide('xhrdav.lib.Resource');
goog.require('xhrdav.lib.Config');
goog.require('goog.array');
goog.require('goog.object');

/**
 * xhrdavclient resource object
 *
 * @constructor
 * @param {Object=} rawObj Json/Hash WebDAV response.
 */
xhrdav.lib.Resource = function(rawObj) {
  /** @type {Object} */
  this.rawData_ = rawObj || {};

  this.initialize_(this.rawData_);
};

/**
 * @param {Object} rawObj
 */
xhrdav.lib.Resource.prototype.initialize_ = function(rawObj) {
  if (!goog.isDefAndNotNull(rawObj.D$response)) return;

  var resp = rawObj.D$response;
  if (!(goog.isDefAndNotNull(resp.D$href) &&
    goog.isDefAndNotNull(resp.D$href.$t))) return;

  /** @type {string} */
  this.href = resp.D$href.$t;
  /** @type {string} */
  this.status = null;
  /** @type {string} */
  this.contenttype = null;
  /** @type {string} */
  this.resourcetype = null;
  /** @type {Date} */
  this.creationdate = null;
  /** @type {Date} */
  this.lastmodified = null;
  /** @type {string} */
  this.etag = null;

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

  /** @type {Array.<string>} */
  this.pathlist = this.href.split('/');

  this.pathlist = goog.array.filter(this.pathlist, function(v, i) {
    return (!goog.string.isEmptySafe(v)); });

  if (!goog.isDefAndNotNull(resp.D$propstat)) return;

  if (!(goog.isDefAndNotNull(resp.D$propstat.D$status) &&
    goog.isDefAndNotNull(resp.D$propstat.D$status.$t))) return;
  /** @type {string} */
  this.status = resp.D$propstat.D$status.$t || 'HTTP/1.1 404 Not Found';

  var status_chunks = this.status.split(' ');
  /** @type {string} */
  this.protocol = status_chunks.shift();
  /** @type {number} */
  this.statuscode = parseInt(status_chunks.shift());
  /** @type {string} */
  this.statustext = status_chunks.join(' ');

  if (!goog.isDefAndNotNull(resp.D$propstat.D$prop)) return;

  var _prop = resp.D$propstat.D$prop;

  if (goog.isDefAndNotNull(_prop.D$getcontenttype) &&
    goog.isDefAndNotNull(_prop.D$getcontenttype.$t)) {
    this.contenttype = _prop.D$getcontenttype.$t;
  }
  if (goog.isDefAndNotNull(_prop.lp1$getcontentlength) &&
    goog.isDefAndNotNull(_prop.lp1$getcontentlength.$t)) {
    /** @type {number} */
    this.contentlength = parseInt(_prop.lp1$getcontentlength.$t);
  }
  if (goog.isDefAndNotNull(_prop.lp1$resourcetype)) {
    var restype = _prop.lp1$resourcetype;
    if (goog.isDefAndNotNull(restype.D$collection)) {
      this.resourcetype = 'collection';
    }
  }
  if (goog.isDefAndNotNull(_prop.lp1$creationdate) &&
    goog.isDefAndNotNull(_prop.lp1$creationdate.$t)) {
    this.creationdate = new Date(_prop.lp1$creationdate.$t);
  }
  if (goog.isDefAndNotNull(_prop.lp1$getlastmodified) &&
    goog.isDefAndNotNull(_prop.lp1$getlastmodified.$t)) {
    this.lastmodified = new Date(_prop.lp1$getlastmodified.$t);
  }
  if (goog.isDefAndNotNull(_prop.lp1$getetag) &&
    goog.isDefAndNotNull(_prop.lp1$getetag.$t)) {
    this.etag = _prop.lp1$getetag.$t;
  }
  if (goog.isDefAndNotNull(_prop.lp2$executable) &&
    goog.isDefAndNotNull(_prop.lp2$executable.$t)) {
    /** @type {boolean} */
    this.executable = (_prop.lp2$executable.$t == 'T') ? true : false;
  }
};

/**
 * Get raw data.
 *
 * @return {Object} WebDAV resource raw object(Json/Hash).
 */
xhrdav.lib.Resource.prototype.getRaw = function() {
  return this.rawData_;
};

/**
 * Serialize resource.
 *
 * @param {xhrdav.lib.Resource} resObj
 * @return {Object} converted Json/Hash Object.
 */
xhrdav.lib.Resource.serialize = function(resObj) {
  var httpStatus = xhrdav.lib.HttpStatus;
  var httpStatusText = xhrdav.lib.HttpStatus.text;

  var res_hash = {}

  // Path
  var href_hash = {href: resObj.href || null};
  var pathlist_hash = {pathlist: resObj.pathlist || []};

  goog.object.extend(res_hash, href_hash);
  goog.object.extend(res_hash, pathlist_hash);
  // TODO: set property statuscode, statustext, protocol,...
  // HTTP Status
  var sts_hash = {status: resObj.status || null};
  var stscode_hash = {statuscode:
    resObj.statuscode || httpStatus.INTERNAL_SERVER_ERROR};
  var ststxt_hash = {statustext:
    resObj.statustext || httpStatusText[httpStatus.INTERNAL_SERVER_ERROR]};
  var protocol_hash = {protocol: resObj.protocol || 'HTTP/1.1'};

  goog.object.extend(res_hash, sts_hash);
  goog.object.extend(res_hash, stscode_hash);
  goog.object.extend(res_hash, ststxt_hash);
  goog.object.extend(res_hash, protocol_hash);

  // etc
  var restype_hash = {resourcetype: resObj.resourcetype || null};
  var contenttype_hash = {contenttype: resObj.contenttype || null};
  var creation_hash = {creationdate: resObj.creationdate || null};
  var modified_hash = {lastmodified: resObj.lastmodified || null};
  var etag_hash = {etag: resObj.etag || null};

  goog.object.extend(res_hash, restype_hash);
  goog.object.extend(res_hash, contenttype_hash);
  goog.object.extend(res_hash, creation_hash);
  goog.object.extend(res_hash, modified_hash);
  goog.object.extend(res_hash, etag_hash);

  // File Only
  var contentlen_hash, exec_hash;
  if (goog.isNull(restype_hash.resourcetype)) {
    contentlen_hash = {contentlength: resObj.contentlength};
    exec_hash = {executable: !!resObj.executable};

    goog.object.extend(res_hash, contentlen_hash);
    goog.object.extend(res_hash, exec_hash);
  }

  return res_hash;
};

/* Entry point for closure compiler */
goog.exportSymbol('xhrdav.lib.Resource', xhrdav.lib.Resource);
goog.exportProperty(xhrdav.lib.Resource.prototype, 'getRaw',
  xhrdav.lib.Resource.prototype.getRaw);
goog.exportSymbol('xhrdav.lib.Resource.serialize', xhrdav.lib.Resource.serialize);


/*
  Structure raw data:
   D$response
     D$href
     D$propstat
       D$status
       D$prop
         D$getcontenttype
         lp1$getcontentlength
         lp1$resourcetype
           D$collection
         lp1$creationdate
         lp1$getlastmodified
         lp1$getetag
         lp2$executable
         D$lockdiscovery
           D$activelock
             D$locktype
               D$write
             D$lockscope
               D$exclusive
             D$depth
             D$owner
             D$timeout
             D$locktoken
               D$href  opaquelocktoken:f81xx......
 */
/*
  Structure converted data: Json/Hash repr
    {href: '/mydav/',
     status: 'HTTP/1.1 200 OK', statuscode: 200, statustext: 'OK', protocol: 'HTTP/1.1',
     resourcetype: ('collection' | null),
     contenttype: ('http/unix-directory' | 'image/jpeg' | 'text/plain'),
     contentlength: 4096
     executable: ('F' | 'T')
     creationdate: <#Date>, lastmodified: <#Date>
     etag: '"f18da..."',
     locktype: 'write', lockscope: 'exclusive', locktoken: opaquelocktoken:....,
     lockdepth: 0, lockowner: '', timeout: ('Infinite' | #)}
 */

