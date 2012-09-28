/**
 * domparser.js - WebDAV Client dom parser.
 *
 * This is a Xml dom parser for WebDAV collection.
 *
 * @license Copyright 2011 The xhrdavclient library authors.
 * All rights reserved.
 */

goog.provide('xhrdav.parser.DomParser');
goog.require('goog.dom.xml');
goog.require('goog.functions');

/**
 * Dom parser for WebDAV Client API
 *
 * @constructor
 */
xhrdav.parser.DomParser = function() {
};

/**
 * Initialize parser
 *
 * @param {Object} xml XML Document.
 * @param {Object} handler Dom Handler.
 * @param {Object} options Parse options.
 * @return {xhrdav.DomParser} self object.
 */
xhrdav.parser.DomParser.prototype.initialize = function(xml, handler, options) {
  if (!(goog.isDefAndNotNull(xml) &&
      (xml.xml || // IE < 9
      xml instanceof Document))) {
    goog.functions.error('Xml document is NOT GIVEN!!')();
  }
  if (!goog.isDefAndNotNull(handler)) {
    goog.functions.error('Parse handler is NOT GIVEN!!')();
  }

  /** @type {Object} */
  this.xml_ = goog.dom.xml.loadXml(
      goog.dom.xml.serialize(xml).split('\n').join('')).documentElement;
  /** @type {Object} */
  this.handler_ = handler;

  if (!goog.isDefAndNotNull(options)) options = {};
  /** @type {string} */
  this.nsSeparator_ = options.nsSeparator || '$';
  /** @type {string} */
  this.textNodeName_ = options.textNodeName || '$t';
  /** @type {string} */
  this.attributePrefix_ = options.attributePrefix || '';

  return this;
};

/**
 * Parse XML to Javascript Object
 *
 * @return {xhrdav.DomParser} self object.
 */
xhrdav.parser.DomParser.prototype.parse = function() {
  var xml = this.xml_;
  this.handler_.startDocument();
  this.handler_.execute(this, xml);
  this.handler_.endDocument();
  return this;
};

/**
 * Execute parse XML Document to Javascript Object
 *
 * @param {Object} xml  parsing xml.
 * @return {Object} parsed object for xml.
 */
xhrdav.parser.DomParser.prototype.parseDocument = function(xml) {
  var obj = {};

  // get nodeValue
  if (xml.nodeType == goog.dom.NodeType.ELEMENT) { // element
    // do attributes
    goog.array.forEach(xml.attributes, function(attr, index) {
      var attrKey = this.parseAttributeName_(attr.nodeName);
      obj[attrKey] = attr.nodeValue;
    }, this);
  } else if (xml.nodeType == goog.dom.NodeType.TEXT) { // text
    obj = xml.nodeValue;
  }

  // do children
  if (xml.hasChildNodes()) {
    goog.array.forEach(xml.childNodes, function(node, index) {
      var key = this.parseNodeName_(node.nodeName);
      if (goog.isDefAndNotNull(obj[key])) {
        if (goog.typeOf(obj[key]) != 'array') {
          var old = obj[key];
          obj[key] = [];
          obj[key].push(old);
        }
        obj[key].push(this.parseDocument(node));
      } else {
        obj[key] = this.parseDocument(node);
      }
    }, this);
  }
  return obj;
};

/**
 * XML attribute nodename to Javascript object key
 *
 * @private
 * @param {string} nodeName Xml attribute nodename.
 * @return {string} converted object key for XML attribute nodename.
 */
xhrdav.parser.DomParser.prototype.parseAttributeName_ = function(nodeName) {
  return this.attributePrefix_ + nodeName.replace(/:/, this.nsSeparator_);
};

/**
 * XML nodename to Javascript object key
 *
 * @private
 * @param {string} nodeName Xml nodename.
 * @return {string} converted nodename.
 */
xhrdav.parser.DomParser.prototype.parseNodeName_ = function(nodeName) {
  return nodeName
    .replace(/:/, this.nsSeparator_)
    .replace(/#text/, this.textNodeName_);
};

/* Entry Point for closure compiler */
goog.exportSymbol('xhrdav.parser.DomParser', xhrdav.parser.DomParser);
goog.exportProperty(xhrdav.parser.DomParser.prototype, 'initialize',
  xhrdav.parser.DomParser.prototype.initialize);
goog.exportProperty(xhrdav.parser.DomParser.prototype, 'parse',
  xhrdav.parser.DomParser.prototype.parse);
goog.exportProperty(xhrdav.parser.DomParser.prototype, 'parseDocument',
  xhrdav.parser.DomParser.prototype.parseDocument);
