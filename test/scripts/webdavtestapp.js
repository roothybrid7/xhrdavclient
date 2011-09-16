goog.provide('webdav.TestApp');
goog.require('goog.debug.Logger');
goog.require('goog.debug.Console');
goog.require('goog.object');
goog.require('goog.events');
goog.require('goog.Uri');
goog.require('goog.net.XhrIo');
goog.require('goog.net.XhrManager');
// Testing Framework
goog.require('goog.testing.AsyncTestCase');
goog.require('goog.testing.jsunit');

/**
 * @constructor
 */
webdav.TestApp = function() {
  /* Nothing to do */
};

webdav.TestApp.initialize = function() {
  goog.debug.Console.autoInstall();
  goog.debug.Console.instance.setCapturing(true);
};

webdav.TestApp.requestAndListen = function(request, logger, callback, handler) {
  goog.events.listen(request, goog.net.EventType.COMPLETE, function(e) {
    var xhr = e.target;
    logger.info("Status: " + xhr.getStatus() + " - " + xhr.getStatusText());
    if (xhr.isSuccess()) {
      logger.info("ResponseType: " + xhr.getResponseType());
      logger.info("Response: " + xhr.getResponse());
//          logger.info(goog.debug.deepExpose(xhr));
    } else {
      logger.info(xhr.getLastErrorCode() + " - " + xhr.getLastError());
      logger.info("Trace");
      logger.info(goog.debug.deepExpose(xhr));
    }
    callback(xhr.getStatus(), xhr.getStatusText());
    if (handler) {
      handler();
    }
  });
};

webdav.TestApp.listDir = function(request, directory, depth) {
  var url = goog.Uri.parse(directory);
  var headers = {};
  headers['Content-Type'] = 'application/xml';
  headers['Depth'] = depth || 1;
  var body = '<?xml version="1.0" encoding="UTF-8"?>' +
    '<D:propfind xmlns:D="DAV:"><D:allprop /></D:propfind>';
  request.send(url, 'PROPFIND', body, headers);
};

webdav.TestApp.createDir = function(request, directory) {
  var url = goog.Uri.parse(directory);
//      var url = goog.Uri.parse('http://localhost:8001/foo/');
  request.send(url, 'MKCOL');
};

webdav.TestApp.deleteDir = function(request, directory) {
  var url = goog.Uri.parse(directory);
  request.send(url, 'DELETE');
};

webdav.TestApp.getName = function() {
  return 'webdav.TestApp';
};

webdav.TestApp.initialize();
