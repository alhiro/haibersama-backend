#!/bin/bash
pm2 start ecosystem.config.js --env production --node-args="--max-old-space-size=8192" 

# run everydat at 5 in the morning
# 0 5 * * * /home/dev/io_backend/start-node.sh