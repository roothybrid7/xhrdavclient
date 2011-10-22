/**
 * conf.js - xhrdavclient config
 *
 * Configuration of Library parameters.
 *
 * @license Copyright 2011 The xhrdavclient library authors. All rights reserved.
 */

goog.provide('xhrdav.Conf');
goog.require('xhrdav.lib');
goog.require('goog.net.XhrIo');

goog.require('goog.debug.Console');
goog.require('goog.debug.Logger');
goog.require('goog.debug.ErrorHandler');

/*
 * Refs: goog.DEBUG=true|false
 */

///** @type {string} */
//xhrdav.lib.LIBNAME = 'xhrdavclient';
//
///** @type {string} */
//xhrdav.lib.VERSION = '0.0.22';

/**
 * xhrdavclient Global config
 *
 * @constructor
 */
xhrdav.Conf = function() {
  this.initialize_();
  this.initializeErrorHandler_();
};
goog.addSingletonGetter(xhrdav.Conf);

/**
 * Initiaze config
 */
xhrdav.Conf.prototype.initialize_ = function() {
  /** @type {string} */
  this.xmlParseFuncObj = 'xhrdav.utils.domparse';

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

  /**
   * @private
   * @type {goog.debug.ErrorHandler}
   */
  this.errorHandler_ = null;
};

/**
 * Initialize errorHandler
 */
xhrdav.Conf.prototype.initializeErrorHandler_ = function() {
  var handler = goog.bind(function(e) {
    this.logger_.warning(e.name || 'Throws exception', e);
  }, this);
  this.errorHandler_ = new goog.debug.ErrorHandler(handler);
//  this.errorHandler_.protectWindowSetInterval();
//  this.errorHandler_.protectWindowSetTimeout();
  goog.net.XhrIo.protectEntryPoints(this.errorHandler_);
};

/**
 * Get errorHandler
 *
 * @return {goog.debug.ErrorHandler} errorHandler
 */
xhrdav.Conf.prototype.getErrorHandler = function() {
  if (!goog.isDefAndNotNull(this.errorHandler_)) {
    this.initializeErrorHandler_();
  }
  return this.errorHandler_;
};

/**
 * Get XhrManager
 *
 * @return {Object} XhrManager config Map.
 */
xhrdav.Conf.prototype.getXhrMgrConfig = function() {
  return this.xmgr_;
};

/**
 * Get library logger
 *
 * Example:
 *  xhrdav.Conf.getInstance().getLogger().warning(
 *    'DavFs: ' + errors.request.path);
 *  xhrdav.Conf.getInstance().getLogger().warning(
 *    'DavFs: ' + errors.request.message);
 *
 * @param {number=} level goog.debug.Logger.Level
 * @return {goog.debug.Logger} logger object.
 */
xhrdav.Conf.prototype.getLogger = function(level) {
  if (level) this.logger_.setLevel(level);
  return this.logger_;
};

/**
 * Output debug log(use config method).
 *
 * Example:
 *  xhrdav.Conf.logging(node.isSelected());
 *  => [10.098s] [xhrdavclient] true
 *
 *  xhrdav.Conf.logging({
 *    selected: node.isSelected(), expanded: node.getExpanded()});
 *  => [10.098s] [xhrdavclient] selected: true
 *  => [10.098s] [xhrdavclient] expanded: false
 *
 * @param {(Object|*)} message Log message. Json/Hash Object OR stirng|number|boolean
 * @param {string=} opt_output logger output method(warning, info, config, fine, etc).
 *     [default: info]
 * @see goog.debug.Logger
 */
xhrdav.Conf.logging = function(messages, opt_output) {
    var logger = xhrdav.Conf.getInstance().getLogger();
    var methodName = goog.isDefAndNotNull(opt_output)
      && goog.isDef(logger[opt_output]) ? opt_output : 'info';

    if (messages && messages instanceof Object) {
        var logMessages = {};
        goog.mixin(logMessages, messages);
        goog.object.forEach(logMessages, function(v, k) {
          logger[methodName](goog.string.subs('%s: %s', k, v));
        });
    } else {
      logger[methodName](messages);
    }
};

// Load Config
xhrdav.Conf.getInstance();

/* Entry Point for closure compiler */
//goog.exportSymbol('xhrdav.lib.LIBNAME', xhrdav.lib.LIBNAME);
goog.exportSymbol('xhrdav.Conf.getInstance', xhrdav.Conf.getInstance);
goog.exportProperty(xhrdav.Conf.prototype, 'getXhrMgrConfig',
  xhrdav.Conf.prototype.getXhrMgrConfig);
goog.exportProperty(xhrdav.Conf.prototype, 'getLogger',
  xhrdav.Conf.prototype.getLogger);
goog.exportSymbol('xhrdav.Conf.logging', xhrdav.Conf.logging);
