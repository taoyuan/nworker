const {Pool} = require('../..');

const pool = new Pool(require.resolve('./entry'), {
  enabled: true
});

(async () => {
  const result = await pool.execute('fibonacci', 10);
  console.log('result: ' + result); // => result: 55
  await pool.close();
})();
