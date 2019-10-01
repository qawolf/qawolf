#!/bin/bash

set -e

cd $QAWOLF_DIR

echo "Executing command(s) $*"
sh -c "$*"
