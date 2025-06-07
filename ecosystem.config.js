module.exports = {
    apps: [
       {
           name: 'io_backend',
           script: './app.js',
           env: {
              NODE_ENV: 'production',
              PORT: 3001
           }
       }
    ],
   deploy : {
      production : {
        user : 'haibersa',
        host : '103.147.154.206',
        ref  : 'origin/master',
        repo : 'https://gitlab.com/haiteam/hai-backend',
        path : '/home/haibersa/api.haibersama.com/v1/',
        'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
        ssh_options: 'StrictHostKeyChecking=no',
      }
    }
  };