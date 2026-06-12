const app = require('./app');
const env = require('./config/env');

app.listen(env.port, () => {
  console.log('==================================================');
  console.log(`💚 Zippi Backend v2 running on http://localhost:${env.port}`);
  console.log(`   Environment: ${env.nodeEnv}`);
  console.log('==================================================');
});
