#!/bin/bash
# This is used by the develop.ts program to restart the server for hot reload
supervisorctl -c /scripts/supervisord.conf restart node
