#!/bin/bash - 
#===============================================================================
#
#          FILE:  depsgen.sh
# 
#         USAGE:  ./depsgen.sh 
# 
#   DESCRIPTION:  Generate Closure library depend difinition script file.
# 
#       OPTIONS:  ---
#  REQUIREMENTS:  ---
#          BUGS:  ---
#         NOTES:  ---
#        AUTHOR: Satoshi Ohki (roothybrid7[at]gmail.com),
#       COMPANY: 
#       CREATED: 2011/09/19 03時24分53秒 JST
#      REVISION:  ---
#===============================================================================

set -o nounset                              # Treat unset variables as an error

PYTHON=$(which python)
OUTPUTFILE="xhrdavclientdeps.js"
#OUTPUTFILE="deps.js"

$PYTHON closure-library/closure/bin/build/depswriter.py --root_with_prefix="scripts ../../../scripts" --output_file=$OUTPUTFILE
[ $? -ne 0 ] && echo "USAGE: ./tools/$(basename $0)"

