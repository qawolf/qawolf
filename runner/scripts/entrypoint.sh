#!/bin/bash
set -ex

exec supervisord -c ./scripts/supervisord.conf