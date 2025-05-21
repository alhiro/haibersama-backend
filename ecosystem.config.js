module.exports = {
    apps: [
       {
           name: 'io_backend',
           script: './app.js',
           env: {
              NODE_ENV: 'production',
              PORT: 3000
           }
       }
    ],
   deploy : {
      production : {
        user : 'dev',
        host : '34.50.73.153',
        ref  : 'origin/master',
        repo : 'https://gitlab.com/haiteam/hai-backend',
        path : '/home/dev',
        'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
        ssh_options: 'StrictHostKeyChecking=no',
      }
    }
  };