#!/bin/bash

set -e

export QAW_XVFB_ARGS=${QAW_DISPLAY_WIDTH}x${QAW_DISPLAY_HEIGHT}x24

# eventually support running multiple displays/scripts
# https://stackoverflow.com/a/30336424/230462
export DISPLAY=:99

echo "Starting Xvfb $QAW_XVFB_ARGS on display $DISPLAY"
Xvfb ${DISPLAY} -shmem -screen 0 ${QAW_XVFB_ARGS} &

echo "Executing command(s) $*"
sh -c "$*"
