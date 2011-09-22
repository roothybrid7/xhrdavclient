
WebDAV Client Ajax API
=======================

This is a WebDAV Client Ajax API Library Using Google Closure library.

[Closure-library](http://code.google.com/p/closure-library/) - Closure Library
===============================================================================

Scripts
--------

* davclient.js (Low-level API)
* fsdav.js (High-level API) NOT IMPLEMENTS
* httpstatus.js (WebDAV HTTP Extensions Status Code enum)

How to settings
-----------------

* Quick Start

    #index.html
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8" />
      <script src="closure-library/closure/goog/base.js" type="text/javascript"></script>
      <script src="xhrdavclientdeps.js" type="text/javascript"></script>
      <script type="text/javascript">
        goog.require('goog.object');
        goog.require('goog.net.XhrManager');
        goog.require('xhrdav.lib.Client');
        goog.require('xhrdav.lib.HttpStatus');
      </script>
    </head>
    <body>
      <div id="runner"></div>
      <script type="text/javascript">
        var dir = '/mydav/'
        var dav = new xhrdav.lib.Client();
        var httpStatus = xhrdav.lib.HttpStatus;
        var httpStatusText = xhrdav.lib.HttpStatus.text;

        dav.propfind(dir);
      </script>
    </body>
    </html>


Integrate Scripts
-------------------

* Command

    $ ./tools/builder.sh
    => generated 'xhrdavclient.js' in current directory.


Replace script.

    #index.html
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8" />
    <!--
      <script src="closure-library/closure/goog/base.js" type="text/javascript"></script>
      <script src="xhrdavclientdeps.js" type="text/javascript"></script>
    -->
      <script src="xhrdavclient.js" type="text/javascript"></script>
      <script type="text/javascript">
        goog.require('goog.object');
        goog.require('goog.net.XhrManager');
        goog.require('xhrdav.lib.Client');
        goog.require('xhrdav.lib.HttpStatus');
      </script>
    [...]
    </html>


Closure compiler
-----------------

Generate script file with optimization.

* AdvancedOptimizations

    $ ./tools/builder.sh -a
    => generated 'xhrdavclient.js' in current directory.

* SimpleOptimizations

    $ ./tools/builder.sh -s
    => generated 'xhrdavclient.js' in current directory.

* WhitespaceOnly

    $ ./tools/builder.sh -w
    => generated 'xhrdavclient.js' in current directory.

