/**
 * xmlhttp.js - XMLHttpRequest prototype extensions
 *
 * @license Copyright 2011 The xhrdavclient library authors. All rights reserved.
 */

goog.provide('xhrdav.lib.XmlHttp');
goog.require('goog.array');

/**
 * XMLHttpRequest extend by userAgent product type.
 *
 * Example: Override sendAsBinary
 *   var xhr = new XMLHttpRequest();
 *   xhr.beforeSend = xhr.send;
 *   xhr.send = xhr.sendAsBinary;
 *
 * @constructor
 */
xhrdav.lib.XmlHttp = function() {
  this.initialize_();
};
goog.addSingletonGetter(xhrdav.lib.XmlHttp);


xhrdav.lib.XmlHttp.prototype.initialize_ = function() {
  if (goog.isDef(window.XMLHttpRequest) &&
    !goog.isDef(XMLHttpRequest.prototype.sendAsBinary)) {
      XMLHttpRequest.prototype.sendAsBinary = function(datastr) {
        function byteValue(x) {
          return x.charCodeAt(0) & 0xff;
        }
//        var ords = Array.prototype.map.call(datastr, byteValue);
        var ords = goog.array.map(datastr, byteValue);
        var ui8a = new Uint8Array(ords);
        if (goog.isDef(this.beforeSend)) {
          this.beforeSend(ui8a.buffer);
        } else {
          this.send(ui8a.buffer);
        }
      };
  }
};

xhrdav.lib.XmlHttp.getInstance();

