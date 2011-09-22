#!/bin/bash - 
#===============================================================================
#
#          FILE:  builder.sh
# 
#         USAGE:  ./builder.sh 
# 
#   DESCRIPTION:  Integrate script file by closurebuilder.py
# 
#       OPTIONS:  ---
#  REQUIREMENTS:  ---
#          BUGS:  ---
#         NOTES:  ---
#        AUTHOR: YOUR NAME (), 
#       COMPANY: 
#       CREATED: 2011/09/22 13時43分28秒 JST
#      REVISION:  ---
#===============================================================================

#set -o nounset                              # Treat unset variables as an error

PYTHON=$(which python)
OUTPUTFILE="xhrdavclient.js"
INPUTFILES=(
scripts/webdavclient.js
scripts/webdavhttpstatus.js
)
NAMESPACES=(
  'webdav.lib'
  'webdav.lib.Client'
  'webdav.lib.HttpStatus'
)
entries=
#for i in ${INPUTFILES[@]}
#do
#  entries+=" -i $i"
#done
for n in ${NAMESPACES[@]}
do
  entries+=" -n $n"
done

usage() {
  echo "USAGE: ./tools/$(basename $0) [-a | -g | -s | -w]"
  echo "Options:"
  echo "  -a: Compiling scripts with 'ADVANCED_OPTIMIZATIONS' by closure compiler"
  echo "  -g: Generate integrate scripts WITHOUT OPTIMIZATIONS [DEFAULT]"
  echo "  -s: Compiling scripts with 'SIMPLE_OPTIMIZATIONS' by closure compiler"
  echo "  -w: Compiling scripts with 'WHITESPACE_ONLY' by closure compiler"
} 1>&2

while getopts agsw OPT
do
  case $OPT in
  "a") FLG_ADVANCED="TRUE" ;;
  "g") FLG_GENERAGE="TRUE" ;;     # DEFAULT
  "s") FLG_SIMPLE="TRUE" ;;
  "w") FLG_WHITESPACE_ONLY="TRUE" ;;
  * ) usage
    exit 1 ;;
  esac
done

if [ "$FLG_ADVANCED" = "TRUE" ]; then
  options='-c tools/compiler/compiler.jar -f "--compilation_level=ADVANCED_OPTIMIZATIONS" -o compiled'
elif [ "$FLG_SIMPLE" = "TRUE" ]; then
  options='-c tools/compiler/compiler.jar -f "--compilation_level=SIMPLE_OPTIMIZATIONS" -o compiled'
elif [ "$FLG_WHITESPACE_ONLY" = "TRUE" ]; then
  options='-c tools/compiler/compiler.jar -f "--compilation_level=WHITESPACE_ONLY" -o compiled'
else
  options='-o script'
fi


command="$PYTHON closure-library/closure/bin/build/closurebuilder.py --output_file=$OUTPUTFILE --root=closure-library --root=scripts"
echo $command $options $entries | bash
[ $? -ne 0 ] && usage
