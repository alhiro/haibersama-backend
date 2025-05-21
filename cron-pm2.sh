#!/bin/bash

# Menyimpan output dari ps aux
ps_output=$(ps aux | grep -v grep)

# Mengecek apakah proses yang diinginkan ada atau tidak
if [[ $ps_output == *"/home/dev/io_backend/app.js"* ]]; then
  echo "Proses /home/dev/io_backend/app.js sedang berjalan."
else
  echo "Proses /home/dev/io_backend/app.js tidak ditemukan. Memulai proses dengan PM2."
  /home/dev/.asdf/shims/npx pm2 start "/home/dev/io_backend/app.js" -n [haio]
fi

# run cron
# */7 * * * * cd /home/dev/io_backend/ && ./cron-pm2.sh > cron.log