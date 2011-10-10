/**
 * config.js - xhrdavclient config
 *
 * Configuration of Library parameters.
 *
 * @license Copyright 2011 The xhrdavclient library authors. All rights reserved.
 */

goog.provide('xhrdav.lib');
goog.provide('xhrdav.lib.Config');
goog.require('goog.Disposable');
goog.require('goog.dom');
goog.require('goog.array');
goog.require('goog.object');
goog.require('goog.json');
goog.require('goog.functions');
goog.require('goog.string.path');
goog.require('xhrdav.lib.functions');
goog.require('xhrdav.lib.XmlHttp');
goog.require('xhrdav.lib.Errors');
goog.require('xhrdav.lib.string');
goog.require('xhrdav.lib.HttpStatus');
goog.require('xhrdav.lib.functions.path');
goog.require('goog.debug.Console');
goog.require('goog.debug.Logger');

/*
 * Refs: goog.DEBUG=true|false
 */

/** @type {string} */
xhrdav.lib.LIBNAME = 'xhrdavclient';

/**
 * xhrdavclient Global config
 *
 * @private
 * @constructor
 */
xhrdav.lib.Config = function() {
  this.initialize_();
};
goog.addSingletonGetter(xhrdav.lib.Config);

/**
 * Initiaze config
 */
xhrdav.lib.Config.prototype.initialize_ = function() {
  /** @type {Object} */
  this.xmlParseFuncObj = 'xhrdav.lib.functions.domparse';

  /**
   @ @private
   * @type {goog.debug.Logger}
   */
  this.logger_ = new goog.debug.Logger.getLogger(xhrdav.lib.LIBNAME);

  if (goog.DEBUG) {
    this.logger_.setLevel(goog.debug.Logger.Level.ALL);
  } else {
    this.logger_.setLevel(goog.debug.Logger.Level.WARNING);
  }
  goog.debug.Console.autoInstall();
  goog.debug.Console.instance.setCapturing(true);

  /**
   * @private
   * @type {Object}
   */
  this.xmgr_ = {};
};

/**
 * Get XhrManager
 *
 * @return {Object} XhrManager config Map.
 */
xhrdav.lib.Config.prototype.getXhrMgrConfig = function() {
  return this.xmgr_;
};

/**
 * Get library logger
 *
 * Example:
 *  xhrdav.lib.Config.getInstance().getLogger().warning(
 *    'DavFs: ' + errors.request.path);
 *  xhrdav.lib.Config.getInstance().getLogger().warning(
 *    'DavFs: ' + errors.request.message);
 *
 * @param {number=} level goog.debug.Logger.Level
 * @return {goog.debug.Logger} logger object.
 */
xhrdav.lib.Config.prototype.getLogger = function(level) {
  if (level) this.logger_.setLevel(level);
  return this.logger_;
};

/**
 * Output debug log(use config method).
 *
 * Example:
 *  xhrdav.lib.Config.logging(node.isSelected());
 *  => [10.098s] [xhrdavclient] true
 *
 *  xhrdav.lib.Config.logging({
 *    selected: node.isSelected(), expanded: node.getExpanded()});
 *  => [10.098s] [xhrdavclient] selected: true
 *  => [10.098s] [xhrdavclient] expanded: false
 *
 * @param {(Object|*)} message Log message. Json/Hash Object OR stirng|number|boolean
 */
xhrdav.lib.Config.logging = function(messages) {
    var logger = xhrdav.lib.Config.getInstance().getLogger();

    if (messages && messages instanceof Object) {
        var logMessages = {};
        goog.mixin(logMessages, messages);
        goog.object.forEach(logMessages, function(v, k) {
            logger.config(k + ': ' + v);
        });
    } else {
        logger.config(messages);
    }
};

// Load Config
xhrdav.lib.Config.getInstance();

/* Entry Point for closure compiler */
goog.exportSymbol('xhrdav.lib.LIBNAME', xhrdav.lib.LIBNAME);
goog.exportSymbol('xhrdav.lib.Config.getInstance', xhrdav.lib.Config.getInstance);
goog.exportProperty(xhrdav.lib.Config.prototype, 'getXhrMgrConfig',
  xhrdav.lib.Config.prototype.getXhrMgrConfig);
goog.exportProperty(xhrdav.lib.Config.prototype, 'getLogger',
  xhrdav.lib.Config.prototype.getLogger);
goog.exportSymbol('xhrdav.lib.Config.logging', xhrdav.lib.Config.logging);

