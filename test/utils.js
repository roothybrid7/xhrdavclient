/**
 * Load json by script tag
 *
 * @param src script src file.
 */
function loadJson(src) {
  var script = document.createElement('script');
  script.src = src;
  document.body.appendChild(script);
}

/**
 * Logging for XHR
 *
 * goog.require:
 *  goog.debug.Logger
 *  goog.net.XhrIo, goog.net.XhrManager OR goog.net.testing.XhrIO
 *
 * <pre><code>
 * goog.net.XhrIo.send('/foo', function() {
 *   var xhr = e.target;
 *   xhrLogging('foo1', xhr);
 * });
 * </code></pre>
 *
 * @param {function(string)} logger
 * @param {Object} xhrEvent XHTTPRequest oncomplete event object.
 * @param {Function} callback Callback function.
 */
var xhrLogging = function(logger, xhrEvent, callback) {
  var req = xhrEvent.target;
  logger.config("Status: " + req.getStatus() + " - " + req.getStatusText());
  logger.config("Success?: " + req.isSuccess());
  logger.config("ResponseType: " + req.getResponseType());
  logger.config("Response: " + req.getResponse());
  logger.config("Response Headers: " + req.getAllResponseHeaders());
  if (req.getLastError()) {
    logger.warning("Error?: " + req.getLastErrorCode() + " - " + req.getLastError());
  }
  if (callback) callback(id, req);
};

