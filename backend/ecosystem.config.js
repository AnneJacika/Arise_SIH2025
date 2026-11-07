module.exports = {
  apps: [
    {
      name: 'quiz-server',
      script: 'quiz-server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 4000
      }
    }
  ]
};
