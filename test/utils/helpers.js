/**
 * helpers.js - check functions.
 *
 * requires: goog.userAgent, goog.userAgent.product,
 *    goog.userAgent.product.isVersion.
 */

var testhelpers = (function(undefined) {
  return {
    canFileUpload: function(product) {
      var isIE = product.IE,
          version = product.VERSION;
      return (!isIE || goog.string.compareVersions(version, '10.0') >= 0);
    }
  };
}());
