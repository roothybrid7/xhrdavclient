/**
 * domparser.js - WebDAV Client dom parser.
 *
 * @license Copyright 2011 The xhrdavclient library authors. All rights reserved.
 */

goog.provide('xhrdav.lib.parser.DomParser');
goog.require('goog.dom.xml');
goog.require('goog.array');
//goog.require('goog.debug');

/**
 * Dom parser for WebDAV Client API
 *
 * @constructor
 * @param {Object} xml XML Document.
 * @param {Object} handler Dom Handler.
 * @param {Object} options Parse options.
 */
xhrdav.lib.parser.DomParser = function(xml, handler, options) {
  this.xml_ = goog.dom.xml.loadXml(
    goog.dom.xml.serialize(xml).split('\n').join('')).documentElement;
  this.handler_ = handler;

  if (!goog.isDefAndNotNull(options)) options = {};
  this.nsSeparator_ = options.nsSeparator || '$';
  this.textNodeName_ = options.textNodeName || '$t';
  this.attributePrefix_ = options.attributePrefix || '';
};

/**
 * Parse XML to Javascript Object
 * @param {Object} XML DOM Document.
 */
xhrdav.lib.parser.DomParser.prototype.parse = function() {
//  var obj = {};
  var xml = this.xml_;
  this.handler_.startDocument();
  this.handler_.setObject(this.parseDocument_(xml));
  this.handler_.endDocument();
};

xhrdav.lib.parser.DomParser.prototype.parseDocument_ = function(xml) {
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
        obj[key].push(this.parseDocument_(node));
      } else {
        obj[key] = this.parseDocument_(node);
      }
    }, this);
  }
  return obj;
};

xhrdav.lib.parser.DomParser.prototype.parseAttributeName_ = function(nodeName) {
  return this.attributePrefix_ + nodeName.replace(/:/, this.nsSeparator_);
};

xhrdav.lib.parser.DomParser.prototype.parseNodeName_ = function(nodeName) {
  return nodeName
    .replace(/:/, this.nsSeparator_)
    .replace(/#text/, this.textNodeName_);
};

/* Entry Point for closure compiler "ADVANCED_OPTIMIZATIONS" option */
goog.exportSymbol('xhrdav.lib.parser.DomParser', xhrdav.lib.parser.DomParser);
goog.exportProperty(
  xhrdav.lib.parser.DomParser.prototype, 'parse',
  xhrdav.lib.parser.DomParser.prototype.parse);

