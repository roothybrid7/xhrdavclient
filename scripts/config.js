/**
 * config.js - xhrdavclient config
 *
 * @license Copyright 2011 The xhrdavclient library authors. All rights reserved.
 */

goog.provide('xhrdav.lib');
goog.provide('xhrdav.lib.Config');
goog.require('goog.Disposable');
goog.require('goog.dom');
goog.require('goog.array');
goog.require('goog.object');
goog.require('goog.functions');
goog.require('goog.string.path');
goog.require('xhrdav.lib.functions');
goog.require('xhrdav.lib.Errors');
goog.require('xhrdav.lib.string');
goog.require('xhrdav.lib.HttpStatus');
goog.require('goog.debug.Console');
goog.require('goog.debug.Logger');

/*
 * Refs: goog.DEBUG=true|false
 */

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

/** @type {string} */
xhrdav.lib.Config.LIBNAME = 'xhrdavclient';

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
  this.logger_ = new goog.debug.Logger.getLogger(xhrdav.lib.Config.LIBNAME);

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
 * @param {number=} level goog.debug.Logger.Level
 * @return {goog.debug.Logger} logger object.
 */
xhrdav.lib.Config.prototype.getLogger = function(level) {
  if (level) this.logger_.setLevel(level);
  return this.logger_;
};

// Load Config
xhrdav.lib.Config.getInstance();

/* Entry Point for closure compiler */
goog.exportSymbol('xhrdav.lib.LIBNAME', xhrdav.lib.LIBNAME);
goog.exportSymbol('xhrdav.lib.Config.getInstance', xhrdav.lib.Config.getInstance);
goog.exportProperty(xhrdav.lib.Config.prototype, 'getLogger',
  xhrdav.lib.Config.prototype.getLogger);

