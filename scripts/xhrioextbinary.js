/**
 * xhrioextbinary.js - goog.net.XhrIo Extension for sendAsBinary
 *
 * @license Copyright 2011 The xhrdavclient library authors. All rights reserved.
 */

goog.provide('xhrdav.lib.XhrIoExtBinary');
goog.require('xhrdav.lib.Config');
goog.require('goog.net.XhrIo');

/**
 * Extension for sendAsBinary
 *
 * @param {goog.net.XmlHttpFactory=} opt_xmlHttpFactory Factory to use when
 *     creating XMLHttpRequest objects.
 * @constructor
 * @extends {goog.net.XhrIo}
 */
xhrdav.lib.XhrIoExtBinary = function(opt_xmlHttpFactory) {
  goog.base(this, opt_xmlHttpFactory);
};
goog.inherits(xhrdav.lib.XhrIoExtBinary, goog.net.XhrIo);

/**
 * Override send by sendAsBinary.(Firefox, Chrome, Safari Only)
 *
 * @return {XMLHttpRequest} XMLHttpRequest object
 *     with overriding send method by sendAsBinary.
 * @protected
 * @see goog.net.XhrIo#createXhr
 */
xhrdav.lib.XhrIoExtBinary.prototype.createXhr = function() {
  var xhr = goog.base(this, 'createXhr');
  if (goog.isDef(window.XMLHttpRequest) && goog.isDef(xhr.sendAsBinary)) {
    xhr.send = xhr.sendAsBinary;
  }
  return xhr;
};

