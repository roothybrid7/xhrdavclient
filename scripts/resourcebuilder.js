/**
 * resourcebuilder.js - xhrdavclient resource object builder
 *
 * @license Copyright 2011 The xhrdavclient library authors. All rights reserved.
 */

goog.provide('xhrdav.lib.ResourceBuilder');
goog.require('xhrdav.lib.Config');
goog.require('xhrdav.lib.Resource');
goog.require('xhrdav.lib.ResourceController');

/**
 * xhrdavclient resource object
 *
 * @constructor
 */
xhrdav.lib.ResourceBuilder = function() {
  /** @type {Object} */
  this.rawData_ = null;

  /**
   * @type {{root:xhrdav.lib.ResourceController,
   *          childs:Array.<xhrdav.lib.ResourceController}}
   * @see xhrdav.lib.ResourceController
   */
  this.resources_ = null;
};

/**
 * Create Resource and returning builder
 *
 * @param {Object} rawObj Converted WebDAV resoruce json/hash object.
 * @return {xhrdav.lib.ResourceBuilder}
 */
xhrdav.lib.ResourceBuilder.createCollection = function(rawObj) {
  var builder = new xhrdav.lib.ResourceBuilder();

  builder.rawData_ = rawObj;
  builder.convertRaw2Models();

  return builder;
};

/**
 * Convert raw data to model objects.
 */
xhrdav.lib.ResourceBuilder.prototype.convertRaw2Models = function() {
  if (!goog.isDefAndNotNull(this.rawData_.D$response)) return;

  var resp;
  if (this.rawData_.D$response instanceof Array) {
    resp = this.rawData_.D$response;
  } else {
    resp = [this.rawData_.D$response];
  }
  // get properties from respnse data
  var resList = [];
  goog.array.forEach(resp, function(val, key) {
    var res = new xhrdav.lib.ResourceController();

    res.href = val.D$href.$t;
    res.pathlist = xhrdav.lib.utils.path.split(res.href);
    if (goog.string.startsWith(
      res.pathlist[res.pathlist.length - 1], '.')) return;  // Skip dot file.

    if (!goog.isDefAndNotNull(val.D$propstat)) {
      goog.array.extend(resList, res);
      return;
    }
    var propstat = val.D$propstat;

    res.status = propstat.D$status.$t || 'HTTP/1.1 404 Not Found';

    var status_chunks = res.status.split(' ');
    res.protocol = status_chunks.shift();
    res.statuscode = parseInt(status_chunks.shift());
    res.statustext = status_chunks.join(' ');

    if (!goog.isDefAndNotNull(propstat.D$prop)) {
      goog.array.extend(resList, res);
      return;
    }
    var props = propstat.D$prop;

    if (goog.isDefAndNotNull(props.D$getcontenttype) &&
      goog.isDefAndNotNull(props.D$getcontenttype.$t)) {
      res.contenttype = props.D$getcontenttype.$t;
    }
    if (goog.isDefAndNotNull(props.lp1$getcontentlength) &&
      goog.isDefAndNotNull(props.lp1$getcontentlength.$t)) {
      res.contentlength = parseInt(props.lp1$getcontentlength.$t);
    }
    if (goog.isDefAndNotNull(props.lp1$resourcetype)) {
      var restype = props.lp1$resourcetype;
      if (goog.isDefAndNotNull(restype.D$collection)) {
        res.resourcetype = 'collection';
      }
    }
    if (goog.isDefAndNotNull(props.lp1$creationdate) &&
      goog.isDefAndNotNull(props.lp1$creationdate.$t)) {
      res.creationdate = new Date(props.lp1$creationdate.$t);
    }
    if (goog.isDefAndNotNull(props.lp1$getlastmodified) &&
      goog.isDefAndNotNull(props.lp1$getlastmodified.$t)) {
      res.lastmodified = new Date(props.lp1$getlastmodified.$t);
    }
    if (goog.isDefAndNotNull(props.lp1$getetag) &&
      goog.isDefAndNotNull(props.lp1$getetag.$t)) {
      res.etag = props.lp1$getetag.$t;
    }

    if (goog.isDefAndNotNull(props.lp2$executable) &&
      goog.isDefAndNotNull(props.lp2$executable.$t)) {
      res.executable = (props.lp2$executable.$t == 'T') ? true : false;
    }
    goog.array.extend(resList, res);
  });

  // buile tree {root: <#root>, childs: <#element>, <#element>, ...}
  this.buildTree_(resList);
};

/**
 * Building tree from response data
 *
 * @private
 * @param {Array.<xhrdav.lib.ResourceController>} resList
 * @see xhrdav.lib.ResourceController
 */
xhrdav.lib.ResourceBuilder.prototype.buildTree_ = function(resList) {
  goog.array.stableSort(resList, function(obj1, obj2) {
    return (obj1.pathlist.length - obj2.pathlist.length);
  });

  this.resources_ = {};
  this.resources_.root = resList.shift();
  this.resources_.childs = (resList.length > 0)  ? resList : [];
};

/**
 * Getter rawData
 *
 * @return {Object}
 */
xhrdav.lib.ResourceBuilder.prototype.getRawData = function() {
  return this.rawData_;
};

/**
 * Getter resources
 *
 * @return {{root:xhrdav.lib.ResourceController,
 *          childs:Array.<xhrdav.lib.ResourceController}}
 * @see xhrdav.lib.ResourceController
 */
xhrdav.lib.ResourceBuilder.prototype.getResources = function() {
  return this.resources_;
};

/**
 * Serialize resources [Class method]
 *
 * @param {{root:xhrdav.lib.ResourceController,
 *          childs:Array.<xhrdav.lib.ResourceController}} resources
 * @param {boolean} asModel TRUE: xhrdav.lib.Resource FALSE: {}
 * @return {{root:xhrdav.lib.Resource, childs:Array.<xhrdav.lib.Resource}}
 */
xhrdav.lib.ResourceBuilder.serialize = function(resources, asModel) {
  var serializedResources = {};

  var root = resources.root;
  var childs = resources.childs;

  serializedResources.root = root.serialize(asModel);
  serializedResources.childs =
    goog.array.map(childs, function(v, i) {
      return v.serialize(asModel); }) || [];

  return serializedResources;
};

/**
 * Serialize resources
 *
 * @param {boolean} asModel TRUE: xhrdav.lib.Resource FALSE: {}
 * @return {{root:xhrdav.lib.Resource, childs:Array.<xhrdav.lib.Resource}}
 * @see xhrdav.lib.ResourceBuilder.serialize
 */
xhrdav.lib.ResourceBuilder.prototype.serialize = function(asModel) {
  return xhrdav.lib.ResourceBuilder.serialize(this.getResources(), asModel);
};

/* Entry point for closure compiler */
goog.exportSymbol('xhrdav.lib.ResourceBuilder', xhrdav.lib.ResourceBuilder);
goog.exportSymbol('xhrdav.lib.ResourceBuilder.createCollection',
  xhrdav.lib.ResourceBuilder.createCollection);
goog.exportProperty(xhrdav.lib.ResourceBuilder.prototype, 'convertRaw2Models',
  xhrdav.lib.ResourceBuilder.prototype.convertRaw2Models);
goog.exportProperty(xhrdav.lib.ResourceBuilder.prototype, 'getRawData',
  xhrdav.lib.ResourceBuilder.prototype.getRawData);
goog.exportProperty(xhrdav.lib.ResourceBuilder.prototype, 'getResources',
  xhrdav.lib.ResourceBuilder.prototype.getResources);
goog.exportSymbol('xhrdav.lib.ResourceBuilder.serialize',
  xhrdav.lib.ResourceBuilder.serialize);
goog.exportProperty(xhrdav.lib.ResourceBuilder.prototype, 'serialize',
  xhrdav.lib.ResourceBuilder.prototype.serialize);

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

