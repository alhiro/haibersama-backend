#!/bin/bash
pm2 stop "io_backend"

# run everydat at 11 in the midnight
# 0 23 * * * /home/dev/io_backend/stop-node.sh