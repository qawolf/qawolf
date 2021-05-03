#!/bin/bash

set -ex

# TODO: remove nginx so we can run this container as non-root.

# # root user will be dropped to the 'node' user by default
# if [[ "$1" == supervisord ]] && [ "$(id -u)" == '0' ]; then
#   echo "Running process as 'node' user..."
# 	gosu node "$@"
# fi

echo "Running process as user: $(whoami)"
exec "$@"
