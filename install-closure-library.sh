#!/bin/bash - 
#===============================================================================
#
#          FILE:  install-closure-library.sh
#
#         USAGE:  ./install-closure-library.sh
#
#   DESCRIPTION:  svn checkout google closure library
#
#       OPTIONS:  ---
#  REQUIREMENTS:  ---
#          BUGS:  ---
#         NOTES:  ---
#        AUTHOR: Satoshi Ohki (roothybrid7[at]gmail.com),
#       COMPANY: 
#       CREATED: 2011/09/15 18時26分07秒 JST
#      REVISION:  ---
#===============================================================================

set -o nounset                              # Treat unset variables as an error

svn checkout http://closure-library.googlecode.com/svn/trunk closure-library

