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
 * Override static send method
 *
 *  var x = new goog.net.XhrIo();
 *  => var x = new xhrdav.lib.XhrIoExtBinary();
 *
 * @inheritDoc
 * @see goog.net.XhrIo.send
 */
xhrdav.lib.XhrIoExtBinary.send = function(url, opt_callback, opt_method,
  opt_content, opt_headers, opt_timeoutInterval) {
  var x = new xhrdav.lib.XhrIoExtBinary();
  goog.net.XhrIo.sendInstances_.push(x);
  if (opt_callback) {
    goog.events.listen(x, goog.net.EventType.COMPLETE, opt_callback);
  }
  goog.events.listen(x,
                     goog.net.EventType.READY,
                     goog.partial(goog.net.XhrIo.cleanupSend_, x));
  if (opt_timeoutInterval) {
    x.setTimeoutInterval(opt_timeoutInterval);
  }
  x.send(url, opt_method, opt_content, opt_headers);
};

//xhrdav.lib.XhrIoExtBinary.prototype.send = function(url, opt_method,
//  opt_content, opt_headers) {
//  goog.base(this, 'send', url, opt_method, opt_content, opt_headers);
//};

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
    xhr.beforeSend = xhr.send;
    xhr.send = xhr.sendAsBinary;
  }
  return xhr;
};

/* Entry Point for closure compiler */
goog.exportSymbol('xhrdav.lib.XhrIoExtBinary', xhrdav.lib.XhrIoExtBinary);
goog.exportSymbol('xhrdav.lib.XhrIoExtBinary.send', xhrdav.lib.XhrIoExtBinary.send);
goog.exportProperty(xhrdav.lib.XhrIoExtBinary.prototype, 'createXhr',
  xhrdav.lib.XhrIoExtBinary.prototype.createXhr);

